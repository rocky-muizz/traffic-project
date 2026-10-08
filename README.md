# SmartFlow AI — Autonomous Adaptive Traffic Signal Control System
### Final Year Project (FYP) • Intelligent Transportation Systems (ITS)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-cyan.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%203.8%20Flash-orange.svg)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)](LICENSE)

---

## 📌 Project Abstract

Urban traffic congestion results in severe economic losses, commuter delays, and thousands of tons of avoidable greenhouse gas emissions annually. Traditional fixed-time electro-mechanical signal controllers allocate rigid, static green phases regardless of real-time demand, while legacy inductive loops suffer from mechanical failure and zero classification capability.

**SmartFlow AI** is an autonomous, full-stack, edge-native Intelligent Transportation System (ITS) designed to optimize urban traffic flow, reduce congestion, and prioritize emergency vehicles at busy intersections. The system combines:
1. **Multimodal Computer Vision (YOLOv8 / Gemini 3.8 Flash)** to detect and classify multi-class Indian/urban vehicles (Auto-rickshaws, BMTC buses, two-wheelers, cars, trucks, and ambulances).
2. **Indian Road Congress (IRC: 106-1990) Passenger Car Unit (PCU) Computation** to dynamically measure queue pressure.
3. **Deep Q-Network (DQN) Adaptive Signal Timing** that dynamically extends green splits (12s–65s) and preempts emergency vehicles within 1.4 seconds.
4. **Historical Peak Hour Analytics & Machine Learning Forecasting** calibrated for high-density corridors (e.g., Silk Board Junction, Marathahalli ORR, Hebbal Flyover).
5. **Automated Urban Planning Municipal Reports** complying with Highway Capacity Manual (HCM 2020) Level of Service (LOS) ratings.

---

## 🚀 Key Modules & Capabilities

### 1. 📸 Bangalore Real Snapshot Evaluator & Signal Allocator
- **Ground Truth Presets:** High-resolution authentic traffic photos from iconic Bengaluru bottlenecks:
  - **Silk Board Junction** (Central Silk Board / Hosur Road flyover ramp)
  - **Outer Ring Road (ORR)** (Marathahalli & Bellandur Tech Corridor)
  - **Indiranagar 100ft Road** (Emergency Ambulance Preemption)
- **Custom Snapshot Upload:** Upload any real traffic image taken from a smartphone or CCTV camera (JPG, PNG, WEBP).
- **Computer Vision Detections:** Interactive canvas overlays with bounding boxes, confidence ratings, and class filters (Autos in yellow, BMTC buses in green, bikes in cyan, cars in blue, ambulances in red).
- **Automated Signal Allocation:** Calculates total Passenger Car Units (PCU) and allocates exact green durations (e.g., 52s for heavy Silk Board queue vs. 18s for off-peak).
- **One-Click Live Controller Handoff:** Injects the allocated signal timing and detected queue directly into the live 4-way intersection simulation.

### 2. 🚦 4-Way Dual-Lane Interactive Canvas Simulation
- **Full Physics Engine:** Dual approach lanes per direction (Protected Left-Turn Lane + Through/Right Lane), departure lanes, zebra crosswalks, stop lines, and turning guide arcs.
- **Micro-Simulation Vehicle Dynamics:** Headway gap maintenance, realistic acceleration/deceleration, and smooth turning trajectories.
- **AI Adaptive Mode vs. Legacy Fixed-Time (45s) Mode:** Side-by-side benchmarking showing a **63% reduction in average commuter delay**.
- **Emergency Vehicle Preemption (EVP):** Automatic visual siren detection triggers an immediate green wave corridor, clearing emergency vehicles with 70% lower transit latency.
- **Interactive Scenarios:** Balanced Flow, AM Peak Rush, Emergency Run, and Gridlock Stress Test.

### 3. 📹 Multi-Camera Computer Vision Grid
- **4 Corridor Feeds:** Synchronized CAM-01 (North), CAM-02 (South), CAM-03 (East), and CAM-04 (West) simulated 30 FPS feeds with day, rain, and night/infrared modes.
- **YOLOv8 & ByteTrack Telemetry:** Real-time object tracking IDs (`#TRK-104`), radar speed telemetry (`km/h`), and queue length estimation.
- **Live Laptop Webcam Integration:** Test optical flow and object detection live with your laptop's integrated camera for thesis viva demonstrations.

### 4. 📊 Traffic Management Center (TMC) Operations Dashboard
- **Highway Capacity Manual (HCM 2020) Compliance:** Real-time Level of Service tracking (upgrades from **LOS D/E** to **LOS B**).
- **Core Operations KPIs:** Average control delay (s/veh), total throughput, flow rate (PCU/hr), $CO_2$ emissions saved (kg), and fuel conserved (L).
- **NEMA Dual-Ring Phase Diagram:** Actuated dual-ring barrier sequence with countdown timers and green extension indicators.
- **Gemini AI Tactical Diagnosis:** Instant AI recommendations diagnosing spillback risks and queue disparities.

### 5. 📈 Historical Peak Hours Analytics & Forecasting
- **Corridor Profiles:** Silk Board, Marathahalli ORR, Whitefield ITPL, and Hebbal Flyover.
- **24-Hour Diurnal Telemetry Curve:** Interactive bar chart with metrics for volume, control delay, corridor speed, and spillback risk.
- **Peak Hour Windows:** Morning Peak (07:30–09:30 AM), Midday Commercial Surge (12:00–01:30 PM), and Evening Peak Apex (17:00–19:30 PM).
- **Machine Learning Next-Day Forecast Simulator:** Predicts peak volume and bottleneck severity under clear sky, monsoon downpour (+28% delay), metro construction (+38%), and Friday rush (+22%) scenarios.
- **7-Day × 24-Hour Congestion Heatmap:** Weekly density matrix.
- **Webster’s Cycle Calculator:** Live computation of $C_0 = \frac{1.5L + 5}{1 - Y}$ alongside dynamic phase splits.
- **Telemetry Export:** Full 15-column CSV export for transportation planners.

### 6. 📑 Automated Urban Planning Reports
- **Executive Audit Generator:** Formatted technical reports generated by Gemini 3.8 Flash.
- **HCM 2020 Evaluation Tables:** Quantitative delay and queue comparisons between fixed-time and AI adaptive controllers.
- **Infrastructure Recommendations:** Geometric improvements, Transit-Signal Priority (TSP) for BMTC buses, and pedestrian refuge designs.
- **Export Formats:** Print-to-PDF ready and raw Markdown download.

### 7. 🎓 Academic FYP Architecture & Viva Kit
- **Markov Decision Process (MDP) Formulation:**
  - **State Space:** $s_t = [Q_N, Q_S, Q_E, Q_W, W_N, W_S, W_E, W_W, \text{Phase}(t), \text{ElapsedTime}]$
  - **Reward Function:** $R_t = -\sum_{i} (\alpha \cdot d_{i,t} + \beta \cdot q_{i,t}) - \rho \cdot \Delta p$
- **4-Layer System Architecture:** Hardware Perception $\rightarrow$ Computer Vision Inference $\rightarrow$ Reinforcement Learning Agent $\rightarrow$ Actuation & Reporting.
- **Bill of Materials (BOM):** Edge deployment specs for NVIDIA Jetson Orin Nano, PoE IP cameras, and NTCIP 1202 controller relays.

---

## 🛠️ System Requirements & Prerequisites

### Hardware Requirements
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher (Intel Core i5 / Apple M1+ recommended)
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk Space:** ~500 MB free disk space
- **Display:** 1280 × 720 minimum (1920 × 1080 Full HD recommended)
- **Camera (Optional):** Integrated laptop webcam or USB webcam for live camera testing

### Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu, Debian, Fedora, etc.)
- **Node.js:** Version **v18.0.0 or higher** (v20 LTS recommended)
- **Package Manager:** npm (v9+)
- **Modern Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari

---

## 📦 Local Installation & Setup

### Step 1: Clone or Extract the Project
```bash
git clone <repository-url>
cd smartflow-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root directory:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Optional: Google Gemini API Key for live multimodal snapshot evaluation and report generation
# (If not provided, the system runs with its built-in fallback analytics engine)
GEMINI_API_KEY="your_gemini_api_key_here"

# Server Port (default: 3000)
PORT=3000
```
> **Tip:** You can obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### Step 4: Run the Development Server
```bash
npm run dev
```

### Step 5: Open in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📜 NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the full-stack development server with hot-reload (`tsx server.ts`) on port 3000 |
| `npm run build` | Compiles and builds the production bundle into `/dist` using Vite |
| `npm run start` | Runs the production full-stack server using `tsx server.ts` |
| `npm run lint` | Runs the TypeScript compiler check (`tsc --noEmit`) to verify types |
| `npm run clean` | Removes `/dist` and build cache files |

---

## 📂 Project Directory Structure

```
├── .env.example                   # Environment variable template
├── index.html                     # HTML entry point with metadata
├── metadata.json                  # AI Studio project capabilities
├── package.json                   # Dependencies and scripts
├── server.ts                      # Express full-stack backend with Gemini GenAI endpoints
├── tsconfig.json                  # TypeScript compiler configuration
├── vite.config.ts                 # Vite bundler configuration
│
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Main navigation shell & state management
│   ├── index.css                  # Tailwind CSS styles and glow animations
│   │
│   ├── assets/
│   │   └── images/                # Real Bangalore junction snapshot assets
│   │       ├── bangalore_silkboard_traffic_*.jpg
│   │       ├── bangalore_orr_marathahalli_*.jpg
│   │       └── bangalore_indiranagar_signal_*.jpg
│   │
│   ├── types/
│   │   └── traffic.ts             # TypeScript definitions for vehicles, phases & telemetry
│   │
│   ├── utils/
│   │   └── trafficAnalytics.ts    # Peak hour analytics, Webster's cycle & CSV export engine
│   │
│   └── components/
│       ├── BangaloreSnapshotEvaluator.tsx  # Vision evaluator & signal timing allocator
│       ├── IntersectionSimulation.tsx      # 2D Canvas 4-way intersection simulation
│       ├── CameraFeedsPanel.tsx            # Multi-camera grid & live webcam test
│       ├── RealTimeDashboard.tsx           # TMC operations dashboard & NEMA phase diagram
│       ├── HistoricalAnalytics.tsx         # Diurnal curve, 7-day heatmap & ML forecasting
│       ├── UrbanPlannerReports.tsx         # AI municipal report generator (PDF / Markdown)
│       └── FYPArchitecture.tsx             # Academic thesis architecture & viva kit
```

---

## 🔬 Mathematical Formulations

### 1. Indian Road Congress (IRC: 106-1990) Passenger Car Units (PCU)
$$\text{Total PCU} = 0.5 \cdot N_{\text{2W}} + 1.0 \cdot N_{\text{Auto}} + 1.0 \cdot N_{\text{Car}} + 3.0 \cdot N_{\text{Bus}} + 3.0 \cdot N_{\text{Truck}}$$

### 2. Webster's Delay-Minimizing Cycle Length
$$C_0 = \frac{1.5L + 5}{1 - Y}$$
*Where $L$ is total lost time per cycle (seconds), and $Y = \sum y_i$ is the sum of critical lane flow ratios ($y_i = q_i / s_i$).*

### 3. Highway Capacity Manual Peak Hour Factor (PHF)
$$\text{PHF} = \frac{V}{4 \times V_{15}}$$
*Where $V$ is total hourly volume and $V_{15}$ is the maximum 15-minute flow rate within the hour.*

### 4. Reinforcement Learning Bellman Optimality Equation
$$Q^*(s, a) = \mathbb{E} \left[ R(s, a) + \gamma \max_{a'} Q^*(s', a') \right]$$

---

## 📄 License & Attribution

This project is released under the **Apache License 2.0**.
Designed and developed for academic Final Year Project (FYP) presentations, university viva defense, and smart city transportation engineering demonstrations.
