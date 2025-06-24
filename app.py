
from flask import Flask, render_template, jsonify, send_file, request, Response
from flask_cors import CORS
import mariadb
import time
import csv
from datetime import datetime
import os
import logging
import json # Added for SSE

# Try to import smbus for I2C communication (needed on Raspberry Pi)
try:
    import smbus
    HARDWARE_AVAILABLE = True
except ImportError:
    HARDWARE_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Logging Setup ---
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'battery_monitor.log')
logging.basicConfig(
    filename=log_file_path,
    level=logging.INFO,
    format='%(asctime)s %(levelname)s:%(name)s:%(threadName)s:%(message)s'
)
if not HARDWARE_AVAILABLE:
    app.logger.warning("smbus not available. ADC communication will not be possible.")
else:
    app.logger.info("smbus available. Running with hardware.")

# --- Configuration ---
PYTHON_NUMBER_OF_CELLS = 4
VOLTAGE_DIVIDER_COMPENSATION_FACTOR = 1.0  # Adjust as per your circuit
# Define a threshold below which a cell is considered disconnected or completely depleted,
# and should be reported as 0.0V. Based on user: "lowest value, which means zero, is 2.51".
# Set threshold slightly above to catch this range.
FUNCTIONAL_ZERO_THRESHOLD = 2.6

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'app_user',
    'password': 'Ah12345678',
    'database': 'i2c_db'
}

# I2C Configuration (for Raspberry Pi)
if HARDWARE_AVAILABLE:
    BUS = smbus.SMBus(1)  # Use bus 1 for newer Raspberry Pi models
    PCF8591_ADDRESS = 0x48  # Default address for PCF8591

def get_db_connection():
    """Create and return a database connection."""
    conn = None
    try:
        conn = mariadb.connect(**db_config)
        return conn
    except mariadb.Error as e:
        app.logger.error(f"Database connection error: {e}")
        return None

def read_voltage(channel):
    """Read voltage from a specific ADC channel with validation and compensation."""
    if not HARDWARE_AVAILABLE:
        app.logger.error(f"smbus (I2C interface) is not available. Cannot read from ADC for channel {channel}.")
        raise IOError("smbus (I2C interface) is not available. ADC readings are impossible.")
    
    # Hardware reading logic
    try:
        if not 0 <= channel < PYTHON_NUMBER_OF_CELLS:
            app.logger.error(f"Invalid channel number: {channel}. Expected 0 to {PYTHON_NUMBER_OF_CELLS - 1}.")
            raise ValueError(f"Invalid channel number: {channel}. Expected 0 to {PYTHON_NUMBER_OF_CELLS - 1}.")
        
        BUS.write_byte(PCF8591_ADDRESS, 0x40 + channel) # Select channel
        time.sleep(0.02) # Allow ADC to settle
        BUS.read_byte(PCF8591_ADDRESS)  # Dummy read to discard previous channel's residue
        time.sleep(0.02) # A bit more settling time
        raw_value = BUS.read_byte(PCF8591_ADDRESS) # Actual read for the current channel
        
        voltage_at_adc_pin = (raw_value / 255.0) * 5.0 # Assuming VREF is 5.0V
        actual_cell_voltage = voltage_at_adc_pin * VOLTAGE_DIVIDER_COMPENSATION_FACTOR
        
        # Check if voltage is below the functional zero threshold
        if actual_cell_voltage < FUNCTIONAL_ZERO_THRESHOLD:
            app.logger.info(f"Channel {channel} voltage {actual_cell_voltage:.3f}V is below functional zero threshold {FUNCTIONAL_ZERO_THRESHOLD}V. Reporting as 0.0V.")
            return 0.0
        
        # General sanity check for "impossible" readings (e.g., way above VREF after compensation)
        # This primarily logs a warning if a value is outside a very broad expected hardware range.
        max_expected_compensated_voltage = (5.0 * VOLTAGE_DIVIDER_COMPENSATION_FACTOR) + 0.5 # Allow some margin
        if not (-0.5 <= actual_cell_voltage <= max_expected_compensated_voltage):
            app.logger.warning(f"Channel {channel} compensated voltage {actual_cell_voltage:.3f}V is outside very broad expected range (-0.5V to {max_expected_compensated_voltage:.1f}V). This might indicate an issue.")
            # Depending on how strict, could return 0.0 or None here. For now, let it pass if not caught by functional zero.
        
        return round(actual_cell_voltage, 3)

    except IOError as e:
        app.logger.error(f"I2C Error reading channel {channel}: {e}. Check PCF8591 at address {PCF8591_ADDRESS}. Returning None.")
        return None 
    except Exception as e:
        app.logger.error(f"General error reading channel {channel}: {e}. Returning None.")
        return None

def read_all_voltages():
    """Read voltages from all configured battery cells."""
    readings = []
    for ch in range(PYTHON_NUMBER_OF_CELLS):
        # This will now raise IOError if HARDWARE_AVAILABLE is false,
        # or return None if there's a specific I2C read error during BUS.read_byte.
        # The calling functions (API endpoints) will handle the IOError.
        voltage = read_voltage(ch) 
        readings.append({
            'cell': ch + 1, 
            'ain_channel': f'AIN{ch}',
            'voltage': voltage 
        })
    return readings

def insert_voltage_reading(cell, voltage):
    """Insert voltage reading into the database. Skips None (I2C error)."""
    # Allow 0.0V to be inserted if it's a functional zero.
    if voltage is None: # Only skip if it's an actual I2C read error resulting in None
        app.logger.debug(f"Skipping database insert for cell {cell} due to voltage being None (I2C error).")
        return True

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            app.logger.error("Failed to get DB connection for insert_voltage_reading.")
            return False
        
        cursor = conn.cursor()
        query = "INSERT INTO voltage_readings (cell_number, voltage) VALUES (%s, %s)"
        cursor.execute(query, (cell, voltage))
        conn.commit()
        return True
    except mariadb.Error as e:
        app.logger.error(f"Database insert error for cell {cell} voltage {voltage}: {e}")
        if conn:
            try:
                conn.rollback()
            except mariadb.Error as rb_err:
                app.logger.error(f"Error during rollback: {rb_err}")
        return False
    except Exception as e_gen:
        app.logger.error(f"Generic error in insert_voltage_reading for cell {cell}: {e_gen}")
        return False
    finally:
        if cursor:
            try:
                cursor.close()
            except mariadb.Error as e_cur:
                app.logger.error(f"Error closing cursor in insert_voltage_reading: {e_cur}")
        if conn:
            try:
                if hasattr(conn, '_closed') and not conn._closed:
                     conn.close()
                elif not hasattr(conn, '_closed'): # Fallback if _closed does not exist
                     conn.close()
            except mariadb.Error as e_conn:
                app.logger.error(f"Error closing connection in insert_voltage_reading: {e_conn}")

def get_voltage_history(limit=100):
    """Get historical voltage readings from the database."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            app.logger.error("Failed to get DB connection for get_voltage_history.")
            return []
        
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT cell_number, voltage, timestamp 
            FROM voltage_readings 
            ORDER BY timestamp DESC
            LIMIT %s
        """
        cursor.execute(query, (limit,))
        result = cursor.fetchall()
        return result
    except mariadb.Error as e:
        app.logger.error(f"Database query error in get_voltage_history: {e}")
        return []
    except Exception as e_gen:
        app.logger.error(f"Generic error in get_voltage_history: {e_gen}")
        return []
    finally:
        if cursor:
            try:
                cursor.close()
            except mariadb.Error as e_cur:
                app.logger.error(f"Error closing cursor in get_voltage_history: {e_cur}")
        if conn:
            try:
                if hasattr(conn, '_closed') and not conn._closed:
                     conn.close()
                elif not hasattr(conn, '_closed'):
                     conn.close()
            except mariadb.Error as e_conn:
                app.logger.error(f"Error closing connection in get_voltage_history: {e_conn}")

@app.route('/')
def index_route(): # Renamed from index
    """Serve the main application page (not used by Next.js frontend directly)."""
    return "Battery Monitor Flask API is running. Use /api/..."

@app.route('/api/voltage', methods=['GET'])
def get_voltage_api():
    """API endpoint to get current voltage readings (for initial load/manual refresh)."""
    try:
        # read_all_voltages will propagate IOError if HARDWARE_AVAILABLE is False
        current_readings_raw = read_all_voltages() 
        
        for reading in current_readings_raw:
            # insert_voltage_reading now handles storing 0.0V, but skips None
            insert_voltage_reading(reading['cell'], reading['voltage']) 
        
        # Return all readings, including 0.0V or None, frontend will handle display.
        return jsonify({
            'status': 'success',
            'readings': current_readings_raw, 
            'timestamp': datetime.now().isoformat()
        })
    except IOError as e: # Specifically catch the IOError from read_voltage via read_all_voltages
        app.logger.error(f"Error in /api/voltage due to hardware interface: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e), # Should be "smbus (I2C interface) is not available..."
            'error_code': 'BSE_NO_HW_INTERFACE' 
        }), 500
    except Exception as e:
        app.logger.error(f"Error in /api/voltage: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'An internal server error occurred while fetching voltages.',
            'error_code': 'BSE5001' 
        }), 500

@app.route('/api/voltage/stream')
def voltage_stream():
    """Streams live voltage readings using Server-Sent Events."""
    def generate_voltage_data():
        app.logger.info("Starting SSE voltage stream.")
        while True:
            try:
                # read_all_voltages will propagate IOError if HARDWARE_AVAILABLE is False
                current_readings_stream = read_all_voltages()

                for reading in current_readings_stream:
                    insert_voltage_reading(reading['cell'], reading['voltage'])
                
                # The frontend will now correctly handle `null` for voltage, so we send it as is.
                # This prevents the frontend from flickering to 0.0V on a transient read error.
                sse_payload_readings = []
                for r in current_readings_stream:
                    sse_payload_readings.append({
                        'cell': r['cell'],
                        'ain_channel': r['ain_channel'],
                        'voltage': r['voltage'] # Send null as is
                    })
                
                data_payload = {
                    'status': 'success',
                    'readings': sse_payload_readings, 
                    'timestamp': datetime.now().isoformat()
                }
                yield f"data: {json.dumps(data_payload)}\n\n"
                time.sleep(1)

            except IOError as e_hw: # Catch IOError from read_all_voltages
                app.logger.error(f"Hardware interface error in SSE voltage stream generator: {e_hw}", exc_info=True)
                error_payload = {
                    'status': 'error',
                    'message': str(e_hw),
                    'error_code': 'BSE_STREAM_NO_HW_INTERFACE'
                }
                try:
                    yield f"data: {json.dumps(error_payload)}\n\n"
                except Exception as yield_err: 
                    app.logger.error(f"Error yielding hardware error payload in SSE stream: {yield_err}")
                # Wait longer before retrying if hardware interface is the issue
                # Or potentially break, depending on desired behavior. For now, retry after delay.
                time.sleep(10) 
            except GeneratorExit:
                app.logger.info("SSE voltage stream client disconnected.")
                return 
            except Exception as e:
                app.logger.error(f"Error in SSE voltage stream generator: {e}", exc_info=True)
                error_payload = {
                    'status': 'error',
                    'message': str(e),
                    'error_code': 'BSE_STREAM_ERROR'
                }
                try:
                    yield f"data: {json.dumps(error_payload)}\n\n"
                except Exception as yield_err: 
                    app.logger.error(f"Error yielding error payload in SSE stream: {yield_err}")
                time.sleep(5) 
                
    return Response(generate_voltage_data(), mimetype='text/event-stream')


@app.route('/api/history', methods=['GET'])
def get_history_api():
    """API endpoint to get voltage history."""
    try:
        history_data = get_voltage_history()
        processed_history = []
        for row in history_data:
            voltage = None
            if row.get('voltage') is not None:
                try:
                    voltage = float(row['voltage']) 
                except (ValueError, TypeError):
                    app.logger.warning(f"Could not convert voltage {row['voltage']} to float for history.")
            
            timestamp_str = None
            ts_value = row.get('timestamp')
            if isinstance(ts_value, datetime):
                timestamp_str = ts_value.isoformat()
            elif ts_value is not None:
                timestamp_str = str(ts_value)

            processed_history.append({
                'cell': int(row['cell_number']),
                'ain_channel': f'AIN{int(row["cell_number"]) - 1}',
                'voltage': voltage, 
                'timestamp': timestamp_str
            })
        return jsonify(processed_history)
    except Exception as e:
        app.logger.error(f"Error in /api/history: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'An internal server error occurred while fetching history.',
            'error_code': 'BSE5002'
        }), 500

@app.route('/api/connect', methods=['POST']) 
def connect_api():
    """API endpoint to test connection to the ADC/hardware."""
    try:
        # This will now raise IOError if HARDWARE_AVAILABLE is False
        voltage_val = read_voltage(0) 
        if voltage_val is not None: 
            return jsonify({
                'status': 'success',
                'message': f'Connected to Battery Monitor. ADC Reading for AIN0: {voltage_val}V (compensated/0.0 if functional zero)'
            })
        else: 
            return jsonify({
                'status': 'error',
                'message': 'Could not read valid voltage from ADC. Check hardware or I2C connection. Reading was None.',
                'error_code': 'BSEHW001'
            }), 500
    except IOError as e_hw: # Catch the specific IOError
        app.logger.error(f"Error in /api/connect due to hardware interface: {e_hw}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e_hw), 
            'error_code': 'BSE_NO_HW_INTERFACE_CONNECT'
        }), 500
    except Exception as e:
        app.logger.error(f"Error in /api/connect: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e), 
            'error_code': 'BSE5005'
        }), 500

@app.route('/api/download', methods=['GET'])
def download_csv_api():
    """API endpoint to download voltage history as CSV."""
    csv_file_path = os.path.join(os.getcwd(), 'voltage_history.csv')
    try:
        history_data = get_voltage_history(limit=1000) 
        
        with open(csv_file_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Cell', 'AIN Channel', 'Voltage (V)', 'Timestamp'])
            for row in history_data:
                ain_channel = f'AIN{int(row["cell_number"]) - 1}'
                voltage_val = ''
                if row.get('voltage') is not None:
                    try:
                        voltage_val = float(row['voltage'])
                    except (ValueError, TypeError):
                        pass 
                
                timestamp_str = str(row.get('timestamp', '')) 
                if isinstance(row.get('timestamp'), datetime):
                    timestamp_str = row['timestamp'].isoformat()
                
                writer.writerow([
                    int(row['cell_number']), 
                    ain_channel, 
                    voltage_val, 
                    timestamp_str
                ])
        
        return send_file(csv_file_path, as_attachment=True, download_name='voltage_history.csv')
    except Exception as e:
        app.logger.error(f"Error in /api/download: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': 'Failed to generate or send CSV file.',
            'error_code': 'BSE5006'
        }), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data_api():
    """API endpoint for aggregate statistics."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'status': 'error', 'message': 'Database connection failed for dashboard data.', 'error_code': 'BSEDB003'}), 500
    
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as total FROM voltage_readings WHERE voltage IS NOT NULL") 
        total_readings_row = cursor.fetchone()
        total_readings = total_readings_row.get('total', 0) if total_readings_row else 0
        
        cursor.execute("""
            SELECT cell_number, AVG(voltage) as avg_voltage
            FROM voltage_readings
            WHERE voltage IS NOT NULL AND voltage > 0  
            GROUP BY cell_number
        """)
        avg_voltages_rows = cursor.fetchall()
        avg_voltages_processed = []
        for row in avg_voltages_rows:
            avg_voltage_val = None
            if row.get('avg_voltage') is not None:
                try:
                    avg_voltage_val = round(float(row['avg_voltage']), 3)
                except (ValueError, TypeError):
                    app.logger.warning(f"Could not convert avg_voltage {row['avg_voltage']} to float for dashboard.")
            avg_voltages_processed.append({
                'cell': int(row['cell_number']),
                'avg_voltage': avg_voltage_val
            })
        
        cursor.execute("SELECT MAX(timestamp) as latest FROM voltage_readings WHERE voltage IS NOT NULL") 
        latest_timestamp_row = cursor.fetchone()
        latest_timestamp_iso = None
        if latest_timestamp_row and latest_timestamp_row.get('latest'):
            latest_dt_object = latest_timestamp_row['latest']
            if isinstance(latest_dt_object, datetime):
                latest_timestamp_iso = latest_dt_object.isoformat()
            else: 
                try:
                    parsed_dt = datetime.fromisoformat(str(latest_dt_object))
                    latest_timestamp_iso = parsed_dt.isoformat()
                except ValueError:
                    app.logger.warning(f"Could not parse latest_timestamp '{latest_dt_object}' as datetime.")
                    latest_timestamp_iso = str(latest_dt_object) 
        
        return jsonify({
            'status': 'success',
            'total_readings': total_readings,
            'average_voltages_per_cell': avg_voltages_processed,
            'latest_reading_timestamp': latest_timestamp_iso,    
            'timestamp': datetime.now().isoformat() 
        })
    except mariadb.Error as e:
        app.logger.error(f"Database error in /api/dashboard: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Database error fetching dashboard data.', 'error_code': 'BSEDB004'}), 500
    except Exception as e:
        app.logger.error(f"Error in /api/dashboard: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'An internal server error fetching dashboard data.', 'error_code': 'BSE5008'}), 500
    finally:
        if cursor:
            try:
                cursor.close()
            except mariadb.Error as e_cur:
                app.logger.error(f"Error closing cursor in get_dashboard_data_api: {e_cur}")
        if conn:
            try:
                if hasattr(conn, '_closed') and not conn._closed:
                     conn.close()
                elif not hasattr(conn, '_closed'):
                     conn.close()
            except mariadb.Error as e_conn:
                app.logger.error(f"Error closing connection in get_dashboard_data_api: {e_conn}")


def create_db_and_table():
    """Creates the database and table if they don't exist."""
    conn_no_db = None
    cursor_no_db = None
    conn = None
    cursor = None
    try:
        conn_no_db = mariadb.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password']
        )
        cursor_no_db = conn_no_db.cursor()
        cursor_no_db.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        app.logger.info(f"Database '{db_config['database']}' ensured.")
        
        conn = get_db_connection() 
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS voltage_readings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    cell_number TINYINT NOT NULL,
                    voltage DECIMAL(5, 3), 
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_cell_timestamp (cell_number, timestamp)
                )
            """)
            app.logger.info("Table 'voltage_readings' ensured (voltage as DECIMAL(5,3)) with index.")
        else:
            app.logger.error("Failed to connect to database to create table 'voltage_readings'.")

    except mariadb.Error as e:
        app.logger.error(f"Error during database/table setup: {e}")
    except Exception as e_gen:
        app.logger.error(f"A non-MariaDB error occurred during database/table setup: {e_gen}")
    finally:
        if cursor_no_db:
            try:
                cursor_no_db.close()
            except mariadb.Error as e_cur_ndb: app.logger.error(f"Error closing no_db cursor: {e_cur_ndb}")
        if conn_no_db:
            try:
                if hasattr(conn_no_db, '_closed') and not conn_no_db._closed:
                     conn_no_db.close()
                elif not hasattr(conn_no_db, '_closed'):
                     conn_no_db.close() 
            except mariadb.Error as e_conn_ndb: app.logger.error(f"Error closing no_db connection: {e_conn_ndb}")
        if cursor:
            try:
                cursor.close()
            except mariadb.Error as e_cur_db: app.logger.error(f"Error closing db cursor: {e_cur_db}")
        if conn:
            try:
                if hasattr(conn, '_closed') and not conn._closed:
                     conn.close()
                elif not hasattr(conn, '_closed'):
                     conn.close()
            except mariadb.Error as e_conn_db: app.logger.error(f"Error closing db connection: {e_conn_db}")


if __name__ == '__main__':
    create_db_and_table() 
    app.logger.info("Battery Monitor Flask API starting...")
    app.run(debug=True, host='0.0.0.0', port=5000)

    

    
