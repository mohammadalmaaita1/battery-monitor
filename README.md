
# Battery Monitor Project Details

## 1. Project Overview

**Project Name:** Design of Battery Logging System using IoT

**Core Purpose:**
The Battery Monitor is a comprehensive system designed for real-time monitoring, logging, and diagnostics of multi-cell lithium battery packs. It aims to provide users with detailed insights into battery health, performance, and potential issues, leveraging both direct hardware measurements from a Raspberry Pi and AI-powered analysis.

**Target Audience:**
This project is suited for electronics hobbyists, DIY enthusiasts, engineering students, and professionals who work with or are interested in understanding and maintaining lithium battery systems.

## 2. Key Features

*   **Real-Time Voltage Monitoring:**
    *   Live display of individual cell voltages (currently configured for up to 4 cells, expandable via backend and frontend configuration).
    *   Data streamed from the Python backend using Server-Sent Events (SSE) for minimal latency.
    *   Clear visual indicators (e.g., battery icons, status badges) for each cell's current state.
*   **Cell Status Indication:**
    *   Automatic status assignment (e.g., Normal, Warning Low, Warning High, Critical) based on voltage levels.
    *   Frontend voltage thresholds for status display are customizable via the Settings page (stored in browser localStorage).
*   **Historical Data Logging & Visualization:**
    *   Voltage readings are periodically saved to a MariaDB database by the Python backend.
    *   Interactive charts display voltage trends over time for the entire pack and for individual cells.
*   **Detailed Cell View:**
    *   Modal pop-up for each cell providing a dedicated historical voltage chart.
    *   Displays current voltage, status, and calculated Min, Max, and Average voltage from its historical data in the modal.
*   **Data Export:**
    *   Ability to download historical voltage readings (from MariaDB) in CSV format for external analysis.
*   **AI-Powered Diagnostics & Insights (via Genkit & Google Gemini):**
    *   **Diagnostic Report:** Generates a summary of overall battery health and identifies specific anomalies (e.g., low voltage, cell imbalance) with potential causes and recommended actions. Users can provide optional context.
    *   **Optimal Usage/Charging Advice:** Provides AI-generated recommendations based on current battery state and optional user-provided context (e.g., storage plans, upcoming usage needs).
    *   **Predictive Alerts:** Analyzes recent voltage trends from historical data to flag potential upcoming issues (e.g., rapid discharge, cell degradation).
*   **Dashboard Statistics:**
    *   Displays key pack-level metrics: Overall Pack Voltage, Cell Voltage Spread (difference between highest and lowest cell), Min/Max Cell Voltages.
    *   Shows total logged readings and average voltage per cell (from MariaDB).
    *   Timestamps for when live voltage data and dashboard statistics were last updated.
*   **User Interface & Experience:**
    *   Responsive and modern user interface built with Next.js (App Router) and ShadCN UI components.
    *   Persistent dark theme for comfortable viewing.
    *   Collapsible sidebar for navigation.
    *   **Electric Loading Animation:** An engaging initial loading animation.
    *   **Subtle Electric Background Animation:** A continuous, thematic background animation.
    *   Informative pages: About Us, Cooperation, Privacy Policy, Terms of Service.
*   **Firebase Firestore Integration (Frontend-side):**
    *   Logs anonymous visit data (timestamp, user agent) to Firestore.
    *   Logs a copy of processed voltage readings to Firestore as they are updated on the frontend, mirroring MariaDB entries for potential frontend-specific uses or separate analysis.

## 3. Technology Stack

*   **Frontend:**
    *   **Framework/Library:** Next.js 15 (App Router), React 18
    *   **Language:** TypeScript
    *   **UI Components:** ShadCN UI
    *   **Styling:** Tailwind CSS
    *   **State Management:** React Hooks (useState, useEffect, useTransition, etc.)
    *   **Data Fetching & Real-time:** Native `fetch` API for initial load, Server-Sent Events (SSE) for live updates.
    *   **Client-side Database:** Firebase Firestore (for logging visits and voltage copies).
*   **Backend:**
    *   **Framework:** Python 3.x with Flask
    *   **Language:** Python
    *   **API:** RESTful API for data retrieval, commands, and SSE stream.
    *   **Database Communication:** `mariadb` Python connector (for MariaDB).
*   **Primary Database (Sensor Data):**
    *   MariaDB (SQL-based)
*   **Hardware Interface:**
    *   **Microcontroller/SBC:** Designed for Raspberry Pi (or similar Single Board Computer).
    *   **Analog-to-Digital Converter (ADC):** PCF8591 (interfaced via I2C).
    *   **Communication Protocol:** I2C for reading voltages from ADC.
*   **Artificial Intelligence (AI):**
    *   **Platform:** Google Gemini models (e.g., Gemini 2.0 Flash).
    *   **Integration:** Genkit SDK for defining and running AI flows.
*   **Development Environment & Tooling:**
    *   Visual Studio Code (with Firebase Studio integration hints)
    *   Node.js & npm for frontend dependencies.
    *   Python `pip` for backend dependencies.

## 4. Project Goals

*   **Accuracy:** Provide reliable and accurate real-time voltage monitoring for each cell directly from hardware.
*   **Usability:** Offer a clear, intuitive, and responsive dashboard for easy visualization and interaction.
*   **Insight:** Enable users to track voltage trends over time and understand battery behavior through historical data from MariaDB.
*   **Flexibility:** Facilitate data analysis by allowing users to download raw voltage readings (CSV from MariaDB).
*   **Intelligence:** Leverage AI (Genkit/Gemini) to generate actionable diagnostic reports, offer optimal usage advice, and provide predictive alerts.
*   **Extensibility:** Allow for separate data logging to Firebase Firestore from the frontend for auxiliary purposes.
*   **Education:** Serve as a valuable and educational tool for those learning about or working with battery management systems.
*   **Reliability:** Create a robust system that can run continuously for monitoring purposes, clearly indicating data source and connection status.

## 5. System Architecture (Conceptual)

1.  **Battery Cells:** The lithium battery pack with individual cell taps for voltage measurement.
2.  **Voltage Sensing Circuit:** Voltage dividers scale down cell voltages to be readable by the ADC.
3.  **PCF8591 ADC:** Converts analog cell voltages to digital values.
4.  **Raspberry Pi (Backend Host):**
    *   Reads digital voltage data from ADC via I2C.
    *   Runs the Python Flask application.
    *   The Flask app:
        *   Processes raw ADC data into voltage readings.
        *   Stores readings in the **MariaDB database**.
        *   Serves API endpoints for current/historical data (from MariaDB) and CSV download.
        *   Provides an **SSE stream** for live voltage updates.
        *   Interfaces with **Genkit** to call **Google Gemini models** for diagnostics, advice, and alerts.
5.  **MariaDB Server:** Stores and serves historical sensor voltage data.
6.  **Next.js Frontend (Client-Side):**
    *   Fetches initial data from Flask API.
    *   Subscribes to SSE stream for live updates from the Flask backend.
    *   Renders dashboards, charts, and interactive UI elements.
    *   Sends requests for AI analysis to backend Next.js server actions, which then trigger Genkit flows.
    *   Allows user configuration for frontend display (e.g., thresholds via localStorage).
    *   **Connects to Firebase Firestore to log application events (like visits) and copies of processed voltage readings.**
    *   Displays **electric loading and background animations**.

This markdown file contains a comprehensive overview of your project. You can copy parts of it into your README, "About Us" page, or other documentation as you see fit.
