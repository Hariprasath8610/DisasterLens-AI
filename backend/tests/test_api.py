import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.config import settings

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_weather_endpoint_returns_normalized_windy_data(monkeypatch):
    class FakeResponse:
        status_code = 200

        @staticmethod
        def json():
            return {
                "ts": [1720000000000],
                "units": {
                    "temp-surface": "K", "dewpoint-surface": "K", "past3hprecip-surface": "mm",
                    "wind_u-surface": "m*s-1", "gust-surface": "m*s-1", "rh-surface": "%", "pressure-surface": "Pa",
                },
                "temp-surface": [300.15], "dewpoint-surface": [295.15], "past3hprecip-surface": [4.2],
                "wind_u-surface": [3], "wind_v-surface": [4], "gust-surface": [7], "rh-surface": [72], "pressure-surface": [101325],
            }

    class FakeClient:
        def __init__(self, **_kwargs): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *_args): pass
        async def post(self, *_args, **_kwargs): return FakeResponse()

    monkeypatch.setattr("app.services.weather_service.httpx.AsyncClient", FakeClient)
    monkeypatch.setattr(settings, "windy_api_key", "test-key")
    response = client.get("/api/weather?location=Vellore&lat=12.9165&lon=79.1325")
    assert response.status_code == 200
    data = response.json()
    assert data["rainfall"] == {"value": 4.2, "unit": "mm", "period": "Previous 3 hours"}
    assert data["weather"]["temp"] == 27.0
    assert data["weather"]["pressure"] == 1013.2
    assert data["wind"]["speed"] == 18.0
    assert data["dataQuality"]["isMockData"] is False

def test_weather_rejects_invalid_coordinates():
    response = client.get("/api/weather?lat=91&lon=79.1325")
    assert response.status_code == 400

def test_weather_requires_backend_key(monkeypatch):
    monkeypatch.setattr(settings, "windy_api_key", "")
    response = client.get("/api/weather?lat=12.9165&lon=79.1325")
    assert response.status_code == 503

def test_risk_endpoint():
    response = client.get("/api/risk?location=Vellore&disaster_type=flood")
    assert response.status_code == 200
    data = response.json()
    assert "compositeScore" in data
    assert data["compositeScore"] == 72
    assert "shapFactors" in data
    assert len(data["shapFactors"]) == 5

def test_disasters_endpoint():
    response = client.get("/api/disasters")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3

def test_history_endpoint():
    response = client.get("/api/history?location=Vellore")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any("2021" in evt["name"] for evt in data)

def test_simulation_endpoint():
    payload = {
        "rain": 120.0,
        "river": 4.2,
        "wind": 42.0,
        "duration": 8,
        "soil": 95.0,
        "drainageBlocked": True
    }
    response = client.post("/api/simulation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "simulationScore" in data
    assert data["simulationScore"] > 50
    assert "affectedCitizens" in data

def test_ai_chat_endpoint():
    payload = {
        "userQuery": "Why is risk increasing in Vellore?",
        "location": "Vellore District",
        "rainfall": 86.0,
        "riverLevel": 3.4
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert len(data["response"]) > 20
    assert "confidence" in data
