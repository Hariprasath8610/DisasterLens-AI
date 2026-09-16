import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_weather_endpoint():
    response = client.get("/api/weather?location=Vellore&lat=12.34&lon=79.13")
    assert response.status_code == 200
    data = response.json()
    assert "rainfall" in data
    assert data["rainfall"]["value"] == 86

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
