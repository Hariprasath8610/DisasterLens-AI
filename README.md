# DisasterLens AI — Intelligent Climate & Disaster Risk Platform

DisasterLens AI is an enterprise-grade geospatial intelligence and early warning risk assessment platform. It combines real-time hydrological telemetry, machine learning risk models, explainable AI (SHAP attributions), interactive "What-If" flood simulations, and AI-driven emergency response recommendations.

---

## 🏛️ System Architecture

```
DisasterLens-AI/
├── frontend/               # Modern React + Vite + Tailwind CSS SPA
│   ├── public/             # Static assets & SVG icons (DisasterLens logo)
│   ├── src/
│   │   ├── components/     # Reusable modular UI components
│   │   │   ├── common/     # RiskGauge, Badges, TelemetryCard
│   │   │   ├── layout/     # Header, Sidebar, Responsive Layout Shell
│   │   │   ├── map/        # Leaflet Interactive Map, CartoDrawer, AreaDossier
│   │   │   └── modules/    # TelemetryStrip, SHAP bars, Hydrograph, Simulations
│   │   ├── context/        # Global AppContext (Live mode, location, alerts, sync)
│   │   ├── data/           # High-fidelity mock telemetry & risk fallbacks
│   │   ├── pages/          # 10 Operational Disaster Management views
│   │   ├── services/       # Axios API client connecting to FastAPI backend
│   │   ├── App.jsx         # App routing & master shell
│   │   └── index.css       # Tailwind directives & custom radar styling
│   └── vite.config.js      # Vite configuration & backend proxy
│
├── backend/                # Production FastAPI REST Backend
│   ├── app/
│   │   ├── main.py         # FastAPI application entrypoint & CORS middleware
│   │   ├── models/         # Domain models (RiskAssessment, Simulation, etc.)
│   │   ├── schemas/        # Pydantic request/response payload schemas
│   │   ├── services/       # Weather, Hydrological Risk, Simulation, & AI engines
│   │   ├── routers/        # Modular API route controllers
│   │   └── utils/          # Configuration & environment loader (pydantic-settings)
│   ├── tests/              # Pytest automated test suite (7/7 passed)
│   ├── requirements.txt    # Production Python dependencies
│   └── .env.example        # Backend environment template
│
├── ai/                     # Dedicated directory for team ML models & notebooks
├── docs/                   # System design, architecture & integration notes
├── .env.example            # Root environment variable template
└── README.md               # Master documentation & developer guide
```

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment (Python 3.10+)
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env

# Run unit tests
pytest tests -v

# Start FastAPI server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The FastAPI documentation (Swagger UI) is available at:
`http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (React + Vite + Tailwind CSS)

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev

# Or build for production
npm run build
```

The frontend application is accessible at:
`http://127.0.0.1:5173`

---

## 🗺️ Operational Pages & Views

| Page | Route | Description |
| :--- | :--- | :--- |
| **Landing** | `/` | Hero section, core value propositions, system capabilities, and navigation CTA. |
| **Dashboard** | `/dashboard` | Executive command center with live risk gauge, telemetry strips, SHAP explainability, and action protocols. |
| **Live Map** | `/map` | Interactive OpenStreetMap (Leaflet) with multi-basin risk overlays, radar beacons, Carto layer drawer, and Area Dossier. |
| **Risk Analysis** | `/risk-analysis` | Deep hydrological factor breakdown, cross-sectional basin levels, SHAP feature impact, and emergency interventions. |
| **Historical Replay** | `/historical-replay` | Timeline player replaying historical disaster analogues (e.g., 2015 Tamil Nadu deluge) with dynamic scrubber. |
| **What-If Simulation** | `/simulation` | Interactive simulation sandbox adjusting rainfall intensity (+100mm) and dam discharge to model breach thresholds. |
| **Active Alerts** | `/alerts` | Categorized real-time alerts (Severe, Moderate, Advisory) with direct dispatch and mitigation actions. |
| **AI Assistant** | `/ai-assistant` | AI-powered incident copilot generating rapid evacuation routes, logistics, and resource calculations. |
| **Location Search** | `/search` | Geospatial search interface analyzing risks across districts and river basins. |
| **Settings** | `/settings` | System telemetry frequencies, webhook alerting endpoints, API keys, and map display preferences. |

---

## 🔌 API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and timestamp |
| `GET` | `/api/weather?location=...` | Current weather, precipitation, humidity, barometric pressure |
| `GET` | `/api/risk?location=...` | Hydrological risk score, severity index, SHAP factors, recommendations |
| `GET` | `/api/disasters?active_only=true`| List of active disaster alerts, polygons, and affected populations |
| `GET` | `/api/history?year=2015` | Historical disaster events and comparative hydrographs |
| `POST`| `/api/simulation` | Runs hydrological what-if scenarios (rain delta, drainage capacity) |
| `POST`| `/api/ai/chat` | AI Copilot conversational assistance with situational grounding |

---

## 🤖 Teammate Integration Guide (For Aswath — AI Lead)

The AI Copilot architecture is designed specifically for seamless drop-in integration:

1. **Service Interface**: `backend/app/services/ai_service.py` defines `BaseAIService`.
2. **Current Mock**: `DevMockAIService` provides immediate, reliable contextual responses with zero latency during offline development.
3. **Production Gemini Ready**: `ProductionGeminiAIService` is pre-written and ready to connect to Google Gemini (`google-generativeai`) or any LLM API using `GEMINI_API_KEY`.
4. **How to Connect**:
   - Set `GEMINI_API_KEY=your_api_key_here` in `backend/.env`.
   - Set `AI_SERVICE_PROVIDER=gemini` (or instantiate custom models from `ai/` folder).
   - The frontend automatically passes session context, location, and conversation history to `/api/ai/chat`.

---

## 🎨 Design System & Aesthetic

- **Design Philosophy**: Mission-critical, modern, high-contrast, clean white/slate canvas with vibrant semantic danger indicators.
- **Typography**: Manrope (Body/UI) and Space Grotesk (Display/Headings) from Google Fonts.
- **Color Palette**:
  - Primary Slate: `#0f172a` (slate-900)
  - Emergency Alert: `#ef4444` (red-500)
  - Warning Warning: `#f59e0b` (amber-500)
  - Safe Baseline: `#10b981` (emerald-500)
  - Atmospheric Cyan: `#06b6d4` (cyan-500)
- **Map System**: Leaflet with OpenStreetMap cartography, customized pulsing radar beacons, interactive polygon boundaries for flood plains (Palar River Basin, Ranipet, Katpadi).

---

## 🛡️ License
Proprietary & Confidential — DisasterLens AI Research Group.
