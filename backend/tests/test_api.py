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
    assert data["compositeScore"] == 89  # calculated dynamically from baseline 86mm rain, 3.4m river, 84% soil
    assert data["mode"] == "LIVE"
    assert data["source"] == "Windy API"
    assert data["isSimulated"] is False
    assert "shapFactors" in data
    assert len(data["shapFactors"]) == 5

def test_risk_dynamic_calculation():
    # Low risk weather: 5mm rain, 2.0m river, 10kmh wind, 45% soil
    res_low = client.get("/api/risk?location=Vellore&rainfall=5&river_level=2.0&wind_speed=10&soil_saturation=45")
    assert res_low.status_code == 200
    score_low = res_low.json()["compositeScore"]
    assert score_low < 40  # Low risk tier

    # Severe risk weather: 160mm rain, 4.8m river, 60kmh wind, 95% soil
    res_high = client.get("/api/risk?location=Vellore&rainfall=160&river_level=4.8&wind_speed=60&soil_saturation=95")
    assert res_high.status_code == 200
    score_high = res_high.json()["compositeScore"]
    assert score_high >= 80  # Critical threshold crossed
    assert score_high > score_low

def test_alert_evaluation_live_threshold():
    from app.services.alert_service import AlertService
    AlertService.clear_cooldown()

    # Score >= 80 triggers LIVE alert
    payload = {"score": 85, "mode": "LIVE", "location": "Katpadi Sector"}
    res = client.post("/api/alerts/live", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["triggered"] is True
    assert data["alert"]["alertType"] == "LIVE RISK ALERT"
    assert data["alert"]["mode"] == "LIVE"
    assert data["alert"]["smsStatus"].upper() in ("DEMO", "SENT", "REQUEST_ACCEPTED", "FAILED")
    assert "******" in data["alert"]["smsRecipient"]

    # Immediate second call is suppressed by cooldown
    res_cooldown = client.post("/api/alerts/live", json=payload)
    assert res_cooldown.status_code == 200
    data2 = res_cooldown.json()
    assert data2["triggered"] is True
    assert "COOLDOWN" in data2["alert"]["smsStatus"].upper()

def test_alert_evaluation_simulation_threshold():
    from app.services.alert_service import AlertService
    AlertService.clear_cooldown()

    payload = {"score": 92, "mode": "SIMULATION", "location": "Katpadi Sector"}
    res = client.post("/api/alerts/simulation", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["triggered"] is True
    assert data["alert"]["alertType"] == "DEMO ALERT"
    assert data["alert"]["mode"] == "SIMULATION"
    assert "hackathon simulation" in data["alert"]["message"]
    assert data["alert"]["smsStatus"].upper() in ("DEMO", "SENT", "REQUEST_ACCEPTED", "FAILED")

def test_manual_test_sms_endpoint():
    res = client.post("/api/alerts/test", json={"message": "Manual test trigger"})
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "******" in data["recipient"]

def test_alert_below_threshold():
    payload = {"score": 74, "mode": "LIVE", "location": "Vellore"}
    res = client.post("/api/alerts/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["triggered"] is False

def test_alert_config_masks_secrets():
    res = client.get("/api/alerts/config")
    assert res.status_code == 200
    data = res.json()
    assert "maskedRecipient" in data
    assert "******" in data["maskedRecipient"]
    assert "windy_api_key" not in str(data)
    assert "twilio_auth_token" not in str(data)

@pytest.mark.anyio
async def test_sms_provider_abstraction():
    from app.services.sms_service import MockSMSProvider, TwilioSMSProvider

    mock_provider = MockSMSProvider()
    res = await mock_provider.send_alert_sms(
        alert_type="LIVE RISK ALERT",
        risk_score=88,
        threshold=80,
        timestamp="2026-09-17T07:00:00Z",
        recipient="+15550198765",
        message="Test alert"
    )
    assert res["success"] is True
    assert res["status"].upper() == "DEMO"
    assert res["maskedRecipient"] == "******8765"

    # Twilio with missing credentials returns FAILED safely
    twilio_provider = TwilioSMSProvider("", "", "")
    res_tw = await twilio_provider.send_alert_sms(
        alert_type="LIVE RISK ALERT",
        risk_score=88,
        threshold=80,
        timestamp="2026-09-17T07:00:00Z",
        recipient="+15550198765",
        message="Test alert"
    )
    assert res_tw["success"] is False
    assert res_tw["status"].upper() == "FAILED"
    assert res_tw["message_sid"] is None

def test_simulation_alert_threshold_and_cooldown():
    from app.services.alert_service import AlertService
    AlertService.clear_cooldown("SIMULATION", "Karur")

    # 1. Score 79: Should not trigger alert
    res_79 = client.post("/api/alerts/simulation", json={"score": 79, "location": "Karur"})
    assert res_79.status_code == 200
    d_79 = res_79.json()
    assert d_79["triggered"] is False
    assert d_79["sms_status"] == "NOT_TRIGGERED"

    # 2. Score 83: Crosses threshold (>=80) -> Triggered
    res_83 = client.post("/api/alerts/simulation", json={"score": 83, "location": "Karur"})
    assert res_83.status_code == 200
    d_83 = res_83.json()
    assert d_83["triggered"] is True
    assert d_83["risk_score"] == 83
    assert d_83["alert_type"] == "simulation"

    # 3. Score 85 immediately after: Duplicate suppressed by 300s cooldown
    res_85 = client.post("/api/alerts/simulation", json={"score": 85, "location": "Karur"})
    assert res_85.status_code == 200
    d_85 = res_85.json()
    assert d_85["triggered"] is True
    assert d_85["sms_status"] == "COOLDOWN"

def test_twilio_test_sms_endpoint():
    res = client.post("/api/alerts/test-sms")
    assert res.status_code == 200
    data = res.json()
    assert data["triggered"] is True
    assert data["alert_type"] == "test"
    assert "recipient" in data
    assert "******" in data["recipient"]
    # Verify no raw secret key in response
    assert "TWILIO_AUTH_TOKEN" not in str(data)

def test_whatsapp_service_function():
    from app.whatsapp_service import create_whatsapp_alert
    
    res = create_whatsapp_alert(
        phone_number="+91 73737-33474",
        risk_level="HIGH",
        location="Karur"
    )
    assert res["success"] is True
    assert res["mode"] == "whatsapp_link"
    assert res["phone_number"] == "917373733474"
    assert "🚨 DisasterLens AI Alert" in res["message"]
    assert "Risk Level: HIGH" in res["message"]
    assert "Location: Karur" in res["message"]
    assert res["whatsapp_url"].startswith("https://wa.me/917373733474?text=")

def test_whatsapp_alert_endpoint():
    payload = {
        "phone_number": "7373733474",
        "risk_level": "HIGH",
        "location": "Karur"
    }
    response = client.post("/api/alerts/whatsapp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["mode"] == "whatsapp_link"
    assert data["phone_number"] == "917373733474"
    assert data["whatsapp_url"].startswith("https://wa.me/917373733474?text=")
    assert "Risk%20Level%3A%20HIGH" in data["whatsapp_url"]

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
