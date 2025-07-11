Battery Monitor Project
1. Project Overview

Project Title: Design of an IoT-Based Battery Logging and Monitoring System
Institution: Al Zaytoonah University of Jordan, Department of Electrical Engineering
Collaborator: ExcelX Company
Authors: Mohammad Alm'aita, Abdalrahman AbuAlrous, Zaed Shalash, Ala'a Awwad
Supervisor: Dr. Sami Aldalahmeh
Core Purpose:
Develop a sophisticated Internet of Things (IoT)-enabled system for real-time monitoring, logging, and diagnostics of a 4-cell lithium-ion battery pack.
Integrate precise hardware measurements, cloud-based data storage, and artificial intelligence (AI)-driven analytics to enhance battery performance, safety, and longevity.
Address limitations of traditional battery monitoring systems, such as lack of real-time remote access and predictive diagnostics, using IoT and modern web frameworks.


Target Applications:
Electric vehicles, renewable energy storage, and portable electronics.
Educational tool for engineering students, prototyping platform for researchers, and scalable solution for industry professionals working on battery management systems (BMS).


Compliance:
Adheres to the IEC 62133-2:2017 standard for secondary lithium-ion cells, ensuring safety in voltage monitoring and overcharge/over-discharge prevention.



2. Key Features
2.1 Real-Time Voltage Monitoring

Functionality:
Continuous monitoring of individual cell voltages for a 4-cell lithium-ion battery pack at a sampling frequency of 1 Hz (one reading per second).
Utilizes a PCF8591 Analog-to-Digital Converter (ADC) interfaced via I2C with a Raspberry Pi for accurate voltage measurements (±0.05 V).


Data Streaming:
Employs Server-Sent Events (SSE) for low-latency, real-time data updates to a web-based dashboard.


Visualization:
Displays live cell voltages with intuitive status indicators (e.g., Normal, Warning Low, Warning High, Critical) using graphical elements like battery icons and badges.



2.2 Cell Status Indication

Mechanism:
Automatically assigns status based on customizable voltage thresholds stored in the browser's localStorage.


Thresholds:
Configurable via a settings interface, allowing users to define voltage ranges for status classification (e.g., cell imbalance >0.1 V).



2.3 Historical Data Logging and Visualization

Storage:
Voltage readings stored in a MariaDB database, supporting up to 43,200 readings per cell to capture long-term behavioral trends.


Visualization:
Interactive charts, built using modern JavaScript libraries, display voltage trends for the entire battery pack and individual cells.


Detailed Cell View:
Modal interface provides per-cell historical charts, showing current voltage, status, and statistical metrics (minimum, maximum, and average voltages).



2.4 Data Export

Functionality:
Users can export historical voltage data as CSV files for external analysis, facilitating research and reporting.



2.5 AI-Powered Diagnostics and Insights

Platform:
Integrates Google Gemini models via the Genkit SDK for advanced diagnostics.


Diagnostic Reports:
Generates detailed summaries of battery health, identifying anomalies such as cell imbalances (>0.1 V) with 95% accuracy in controlled test scenarios.


Predictive Alerts:
Analyzes historical voltage trends to predict potential issues, such as rapid discharge or cell degradation.


Charging Advice:
Provides AI-generated recommendations based on current battery state and user-provided context (e.g., storage duration or usage patterns).



2.6 Dashboard Statistics

Metrics:
Displays pack-level metrics, including total pack voltage, cell voltage spread (difference between highest and lowest cell voltages), and per-cell statistics.


Timestamps:
Indicates the last update time for live voltage data and dashboard statistics, ensuring transparency in data freshness.



2.7 User Interface and Experience

Framework:
Built with Next.js 15 (App Router) and ShadCN UI components for a responsive, modern interface.


Design:
Persistent dark theme for comfortable viewing.
Collapsible sidebar for navigation.
Electric-themed loading animation for an engaging user experience.
Subtle electric background animation for thematic consistency.


Additional Pages:
Informational pages: About Us, Cooperation, Privacy Policy, Terms of Service.



2.8 Firebase Firestore Integration

Purpose:
Logs anonymous visit data (e.g., timestamps, user agent) and mirrors processed voltage readings from the frontend for auxiliary analysis.


Use Case:
Enables separate data logging for frontend-specific applications or cross-platform analytics.



3. Technology Stack
3.1 Frontend

Framework/Library: Next.js 15 (App Router), React 18
Language: TypeScript
UI Components: ShadCN UI
Styling: Tailwind CSS
State Management: React Hooks (useState, useEffect, useTransition)
Data Fetching: Native fetch API for initial data loading; SSE for real-time updates
Client-Side Database: Firebase Firestore for logging visit data and voltage copies

3.2 Backend

Framework: Flask (Python 3.x)
Language: Python
API: RESTful API for data retrieval, commands, and SSE streaming
Database Communication: mariadb Python connector for MariaDB interactions

3.3 Primary Database

Type: MariaDB (SQL-based relational database)
Purpose: Stores historical voltage readings with timestamps, supporting up to 43,200 readings per cell

3.4 Hardware Interface

Single Board Computer (SBC): Raspberry Pi (e.g., Raspberry Pi 4)
Analog-to-Digital Converter: PCF8591 ADC (8-bit, 4 analog inputs, I2C interface)
Communication Protocol: I2C for reliable data exchange between ADC and Raspberry Pi
Voltage Scaling: Voltage divider circuits to scale cell voltages to the ADC's input range (0-5 V)

3.5 Artificial Intelligence

Platform: Google Gemini models (e.g., Gemini 2.0 Flash)
Integration: Genkit SDK for defining and executing AI workflows
Functionality: Diagnostic reporting, predictive alerts, and usage recommendations

3.6 Development Environment

IDE: Visual Studio Code
Frontend Dependencies: Node.js, npm
Backend Dependencies: Python, pip
Additional Tools: AutoCAD for hardware enclosure design, 3D modeling software for visualization, CNC router for manufacturing

4. Project Goals

Accuracy:
Provide reliable voltage measurements with ±0.05 V accuracy (target: ±0.01 V, limited by ADC resolution).


Usability:
Offer an intuitive, responsive dashboard with 99% uptime and ≤3-second load times.


Insight:
Enable long-term trend analysis through MariaDB storage and interactive visualizations.


Flexibility:
Support data export (CSV) and auxiliary logging (Firebase Firestore) for research and analysis.


Intelligence:
Deliver AI-driven diagnostics with 95% anomaly detection accuracy, predictive alerts, and usage recommendations.


Extensibility:
Ensure modular design for scalability (e.g., additional cells via more ADCs) and future sensor integration (e.g., current, temperature).


Education:
Serve as a learning tool for battery management systems in academic and professional settings.


Reliability:
Maintain continuous operation with clear indicators of data source and connection status.



5. System Architecture

Battery Pack:
A 4-cell lithium-ion battery pack with individual cell taps for voltage measurement.


Voltage Sensing Circuit:
Voltage dividers scale cell voltages to match the PCF8591 ADC's input range.


PCF8591 ADC:
Converts analog voltages to digital values with a resolution of 8 bits and ±0.05 V accuracy.


Raspberry Pi:
Reads digital voltage data via I2C at 1 Hz.
Hosts the Flask application for data processing and API services.


Flask Backend:
Processes raw ADC data into calibrated voltage readings.
Stores readings in MariaDB with timestamps.
Serves REST API endpoints for current and historical data, CSV exports, and SSE streams.
Interfaces with Genkit to invoke Google Gemini for AI-driven diagnostics.


MariaDB Database:
Stores historical voltage data, supporting queries for trend analysis and data export.


Next.js Frontend:
Fetches initial data via REST API.
Subscribes to SSE streams for real-time voltage updates.
Renders interactive dashboards, charts, and diagnostic reports.
Logs visit data and voltage copies to Firebase Firestore.
Supports user-configurable thresholds via localStorage.


Physical Enclosure:
Custom-designed using AutoCAD and 3D modeling software, constructed with 5D wood panels and acrylic sheets, manufactured via CNC routing.



6. Design Constraints and Validation
6.1 Constraints

Power Consumption:
≤5 W to ensure portability (likely met, pending power meter validation).


Cost:
≤$150 for scalability (achieved at 93 JD ≈ $131).


Cell Count:
Limited to 4 cells due to PCF8591 ADC capacity (expandable with additional ADCs).


System Uptime:
≥99% over 30 days (stable for 24-hour tests, pending long-term validation).



6.2 Validation Results

Table:


Parameter
Required
Achieved
Status
Notes



Voltage Accuracy
±0.01 V
±0.05 V
Not Met
Limited by ADC resolution; consider higher-resolution ADC (e.g., ADS1115).


Update Frequency
1 Hz
1 Hz (SSE)
Met
Verified via SSE logs and timestamps.


Data Storage
43,200 readings/cell
Supported by MariaDB
Likely Met
Pending exact storage duration confirmation.


Dashboard Responsiveness
≤3 s load time
Responsive UI
Likely Met
Pending precise load time measurement.


AI Diagnostic Accuracy
95%
Under Testing
Pending
Validated in controlled simulations.


Power Consumption
≤5 W
Likely ≤5 W
Likely Met
Pending power meter validation.


Budget
≤$150
$131
Met
Cost-effective component selection.


System Uptime
≥99%
Stable for 24 hours
Likely Met
Pending 30-day test results.


Cell Count
4 cells
4 cells (expandable)
Met
Scalable design.




7. Future Work

Scalability:
Expand support for larger battery packs (8-12 cells) using additional ADCs or multiplexing.


Sensor Integration:
Incorporate current and temperature sensors for comprehensive battery health monitoring.


AI Enhancements:
Train machine learning models on real-world battery datasets for improved failure prediction and degradation detection.


Data Security:
Implement HTTPS and MQTT over TLS for secure remote access.


Smart Features:
Add automated cell balancing, adaptive charging, and load optimization.


Mobile Application:
Develop a companion mobile app for real-time monitoring and alerts.


Cloud Integration:
Utilize cloud platforms (e.g., AWS IoT Core, Google Sheets) for remote data access and long-term analytics.



8. Repository Structure

/frontend:
Next.js (TypeScript) code for the web dashboard, including UI components, SSE integration, and Firebase Firestore logging.


/backend:
Flask (Python) code for ADC data acquisition, REST API, SSE streaming, MariaDB integration, and Genkit AI workflows.


/hardware:
Schematics and design files (AutoCAD, 3D models) for the physical enclosure.


/docs:
Project documentation, including this README, datasheets, and test results.


/scripts:
Utility scripts for setup, testing, and data export.



9. Installation and Setup

Hardware Setup:
Connect the 4-cell lithium-ion battery pack to the PCF8591 ADC via voltage dividers.
Interface the ADC with a Raspberry Pi using I2C.


Backend Setup:
Install Python 3.x, Flask, and mariadb connector (pip install flask mariadb).
Configure MariaDB database and update connection settings in the Flask app.
Run the Flask server (python app.py).


Frontend Setup:
Install Node.js and npm.
Navigate to /frontend, run npm install, and start the Next.js app (npm run dev).
Configure Firebase Firestore credentials for visit and voltage logging.


AI Integration:
Set up Genkit SDK and Google Gemini API credentials in the Flask backend.


Access:
Open the dashboard at http://localhost:3000 (or deployed URL).
Monitor live data, configure thresholds, and export CSV files.



10. References

IEC 62133-2:2017:
Safety requirements for secondary lithium-ion cells.


Gabbar, H. A., et al., "Review of battery management systems (BMS) development and industrial standards," Technologies, 9(2), 28, 2021.
Project documentation: Al Zaytoonah University of Jordan, Spring 2025.
