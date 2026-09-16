# DisasterLens AI

AI-powered local natural disaster risk intelligence platform.

## Live Windy weather forecast

The dashboard weather strip reads live forecast values through the FastAPI backend; the browser never receives the Windy API key. Copy `backend/.env.example` to `backend/.env`, set `WINDY_API_KEY`, then start the backend with `uvicorn app.main:app --reload` from `backend/`. Test with `http://localhost:8000/api/weather?location=Vellore&lat=12.9165&lon=79.1325`.

Windy Point Forecast provides forecast data, not observed hydrology or disaster predictions. River levels, soil saturation, and risk-model features remain separate until dedicated sources are integrated.

DisasterLens AI combines environmental data, geographic information, historical disaster patterns, and AI to help users understand local disaster risk.

## Features

* Interactive disaster risk map
* Flood risk analysis
* Environmental risk indicators
* AI-powered risk explanations
* What-if risk simulation
* Historical disaster replay
* Disaster alerts
* Location-based analysis

## Tech Stack

**Frontend:**
* React
* Vite
* Tailwind CSS
* Leaflet & OpenStreetMap

**Backend:**
* FastAPI
* Python
* Uvicorn

**AI:**
* LLM-based risk analysis
* AI risk explanation

## Project Structure

```text
DisasterLens-AI/
├── frontend/
├── backend/
├── ai/
└── docs/
```

## Run Locally

Configure environment variables using `.env.example` in the root and `backend/` directories before starting.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## Status

**Under Development**

Some features currently use demonstration data while real-time environmental data sources and production AI services are being integrated.

## Team

* **Balasurya** — UI/UX & Stitch
* **Hariprasath** — Frontend, Backend & Integration
* **Aswath** — AI/LLM & Git Management
