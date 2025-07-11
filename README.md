# 🔋 Battery Monitor Project

## 📘 1. Project Overview

**Project Title:** Design of an IoT-Based Battery Logging and Monitoring System  
**Institution:** Al Zaytoonah University of Jordan, Department of Electrical Engineering  
**Collaborator:** ExcelX Company  
**Authors:** Mohammad Alm'aita, Abdalrahman AbuAlrous, Zaed Shalash, Ala'a Awwad  
**Supervisor:** Dr. Sami Aldalahmeh  

### 🎯 Core Purpose
Develop an Internet of Things (IoT)-enabled system for real-time monitoring, logging, and diagnostics of a **4-cell lithium-ion battery pack**. The project integrates precise voltage sensing, cloud-based data storage, and AI-powered analytics to enhance safety, performance, and usability.

### 🧩 Target Applications
- Electric vehicles
- Renewable energy storage systems
- Portable electronics
- Educational and research platforms
- Industry-grade BMS prototyping

### 📜 Compliance
Compliant with **IEC 62133-2:2017** standard for secondary lithium-ion cells (voltage safety, overcharge/over-discharge prevention).

---

## ⚙️ 2. Key Features

### 🔄 2.1 Real-Time Voltage Monitoring
- Reads cell voltages every 1 second (1 Hz)
- Uses **PCF8591 ADC** via I2C to Raspberry Pi (accuracy ±0.05 V)
- Streamed via **SSE** (Server-Sent Events) to frontend dashboard

### 🟢 2.2 Cell Status Indication
- Customizable voltage thresholds saved in `localStorage`
- Automatically labels status: Normal, Warning Low/High, Critical

### 📊 2.3 Historical Data Logging & Visualization
- **MariaDB** stores up to **43,200 readings per cell**
- Interactive JavaScript charts (pack & per-cell views)
- Modals show voltage stats (min, max, average)

### 📁 2.4 Data Export
- Download historical readings in `.csv` format

### 🤖 2.5 AI-Powered Diagnostics (Genkit + Google Gemini)
- Identifies cell imbalance (>0.1 V) with up to **95% accuracy**
- Predictive alerts (e.g. rapid discharge, degradation)
- Context-based AI recommendations for optimal charging/storage

### 📈 2.6 Dashboard Statistics
- Pack-level voltage, cell spread, min/max voltages
- Update timestamps for data freshness

### 💻 2.7 UI/UX Design
- Built with **Next.js 15 (App Router)** and **ShadCN UI**
- Responsive, modern, dark-themed UI
- Features: collapsible sidebar, animated loading, electric background

### 🔥 2.8 Firebase Firestore Integration
- Logs anonymous visits (timestamp, user agent)
- Mirrors processed voltage readings for frontend analytics

---

## 🧰 3. Technology Stack

### Frontend
- Framework: Next.js 15 (App Router), React 18
- Language: TypeScript
- Styling: Tailwind CSS
- UI: ShadCN UI
- State: React Hooks (`useState`, `useEffect`, etc.)
- Real-Time: Server-Sent Events (SSE)
- Firebase Firestore for anonymous logs

### Backend
- Framework: **Flask (Python 3.x)**
- API: REST + SSE
- DB Access: `mariadb` Python connector

### Database
- **MariaDB** (SQL) for voltage logging

### Hardware
- **Raspberry Pi 4**
- **PCF8591 ADC** (4 analog inputs, I2C)
- Voltage divider circuit to scale cell voltages (0–5V input)

### AI Integration
- **Google Gemini (v2.0 Flash)** via **Genkit SDK**
- AI for diagnostics, predictions, and suggestions

### Tooling
- Visual Studio Code
- Node.js, npm (frontend)
- Python, pip (backend)
- AutoCAD & 3D modeling software
- CNC router for enclosure

---

## 🎯 4. Project Goals

| Objective            | Target                           |
|----------------------|----------------------------------|
| Voltage Accuracy     | ±0.05 V (target ±0.01 V)         |
| Dashboard Uptime     | ≥99% uptime                      |
| Load Speed           | ≤3 seconds                       |
| AI Detection Accuracy| ≥95% anomaly identification      |
| Scalability          | Modular for up to 12 cells       |
| Export Formats       | CSV                              |
| Remote Logging       | Firestore (frontend)             |
| Educational Value    | Real-world BMS learning platform |

---

## 🧱 5. System Architecture


graph TD
  A[Battery Pack (4 Cells)] --> B[Voltage Divider Circuits]
  B --> C[PCF8591 ADC]
  C --> D[Raspberry Pi (I2C)]
  D -->|Read + Process| E[Flask Backend]
  E -->|Save| F[MariaDB]
  E -->|SSE/REST| G[Next.js Frontend]
  G -->|Log| H[Firebase Firestore]
  E -->|AI Requests| I[Genkit + Gemini]


| Parameter              | Required    | Achieved     | Status     |
| ---------------------- | ----------- | ------------ | ---------- |
| Voltage Accuracy       | ±0.01 V     | ±0.05 V      | 🔴 Not Met |
| Update Frequency       | 1 Hz        | 1 Hz (SSE)   | 🟢 Met     |
| Storage Capacity       | 43,200/cell | Supported    | 🟡 Likely  |
| Dashboard Load Time    | ≤3 s        | Responsive   | 🟡 Likely  |
| AI Accuracy            | ≥95%        | Under Test   | 🟡 Pending |
| Power Consumption      | ≤5 W        | \~4.2 W      | 🟢 Likely  |
| Budget                 | ≤\$150      | \~\$131      | 🟢 Met     |
| System Uptime (30-day) | ≥99%        | Stable (24h) | 🟡 Pending |


##🔮 7. Future Work
Expand to 8–12 cells using multiple ADCs

Integrate current & temperature sensors

Train ML models for degradation detection

Enable HTTPS/MQTT over TLS for security

Add smart features (balancing, adaptive charging)

Develop a mobile companion app

Store data in Google Sheets or AWS IoT

## 📁 8. Repository Structure
bash
نسخ
تحرير/frontend      → Next.js app (UI, SSE, Firebase)
/backend       → Flask backend (ADC, REST, SSE, AI)
/hardware      → Schematics & enclosure design (AutoCAD)
/docs          → Technical documentation & test reports
/scripts       → Helper scripts (export, diagnostics, setup)

## ⚙️ 9. Installation & Setup
🔌 Hardware
Connect 4-cell pack → Voltage dividers → PCF8591

PCF8591 → I2C pins on Raspberry Pi

## 🐍 Backend
bash
نسخ
تحرير
pip install flask mariadb
python app.py
## 🌐 Frontend
bash
نسخ
تحرير
cd frontend
npm install
npm run dev

## Configure Firestore credentials (optional)

  ###   Visit: http://localhost:3000

### 🤖 AI (Optional)
Install Genkit SDK

### Set up Google Gemini API keys in backend

## 📚 10. References

- IEC 62133-2:2017 Standard

- Gabbar, H. A., et al. (2021), Technologies, 9(2), 28

- Project Documentation, Al Zaytoonah University of Jordan, Spring 2025

## 🔖 Tags

--
#BatteryMonitor #IoT #RaspberryPi #LithiumIon #Flask #NextJS #MariaDB #GoogleGemini #BMS #AI #EngineeringProject #ElectricalEngineering #ZUJ



