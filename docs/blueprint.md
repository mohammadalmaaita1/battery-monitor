# **App Name**: Battery Sensei

## Core Features:

- Voltage Dashboard: Displays a dashboard with real-time voltage readings for each of the 8 battery cells.
- CSV Export: Allows users to download voltage data in CSV format, preserving the original voltage readings.
- Historical Data Table: Allows users to access to a history table with the stored data and time, ordered from the most recent readings
- Safe Voltage Scaling: Uses a voltage divider circuit to safely scale down voltages from the battery for ADC readings, with software compensation to display real values.
- Diagnostic Report Generation: Generates a diagnostic message and indicates whether cells voltage levels are normal based on defined thresholds; Uses a LLM as tool.

## Style Guidelines:

- Primary color: Calm teal (#4DB6AC) for a modern and reliable feel.
- Secondary colors: Light gray (#ECEFF1) for backgrounds and darker gray (#607D8B) for text.
- Accent: Use green (#4CAF50) for healthy voltage levels, and red (#F44336) for alerts or warnings.
- Clean and modern fonts (inherit system defaults) for easy readability.
- Use simple, clear icons from a library like FontAwesome for indicating cell status and actions (download, update).
- Grid-based layout for the cell display, ensuring a clean and organized look. Keep everything responsive.
- Subtle transitions for voltage updates to provide a smooth, real-time monitoring experience.