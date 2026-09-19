from typing import Optional
from fastapi import APIRouter, Query
from app.services.risk_service import RiskService
from app.services.weather_service import WeatherService, WeatherApiError
from app.services.alert_service import AlertService
from app.schemas.payloads import SimulationRequest

router = APIRouter(prefix="/risk", tags=["Risk"])

@router.get("")
async def get_risk_evaluation(
    location: str = Query("Vellore District", description="Location name"),
    disaster_type: str = Query("flood", description="Disaster category (flood, cyclone, landslide)"),
    lat: Optional[float] = Query(None, description="Latitude for live weather correlation"),
    lon: Optional[float] = Query(None, description="Longitude for live weather correlation"),
    rainfall: Optional[float] = Query(None, description="Observed/Forecast rainfall mm"),
    river_level: Optional[float] = Query(None, description="Observed river stage meters"),
    soil_saturation: Optional[float] = Query(None, description="Soil saturation percentage"),
    wind_speed: Optional[float] = Query(None, description="Wind speed km/h"),
    drainage_blocked: bool = Query(False, description="Urban drainage blockage flag")
):
    source = "Windy API"
    rainfall_val = rainfall
    wind_val = wind_speed

    # If coordinates are given and rainfall is not explicitly provided, fetch live weather from Windy
    if lat is not None and lon is not None and rainfall_val is None:
        try:
            weather_data = await WeatherService.get_weather(location=location, lat=lat, lon=lon)
            if weather_data and "rainfall" in weather_data:
                rf = weather_data["rainfall"].get("value")
                if rf is not None:
                    rainfall_val = float(rf)
            if weather_data and "wind" in weather_data:
                ws = weather_data["wind"].get("speed")
                if ws is not None:
                    wind_val = float(ws)
            source = weather_data.get("source", "Windy API")
        except WeatherApiError:
            # Fall back to localized baseline if Windy is offline/rate-limited
            source = "HydroNet Model (Telemetry Baseline)"

    return RiskService.evaluate_risk(
        location=location,
        disaster_type=disaster_type,
        rainfall_mm=rainfall_val,
        river_level_m=river_level,
        wind_kmh=wind_val,
        soil_saturation=soil_saturation,
        drainage_blocked=drainage_blocked,
        source=source,
        is_simulated=False
    )

class RiskSimulationRequest(SimulationRequest):
    location: str = "Vellore District"
    disaster_type: str = "flood"

@router.post("/simulation")
async def evaluate_simulation_risk(req: RiskSimulationRequest):
    """
    Dedicated endpoint:
    1. Evaluates simulation risk dynamically via RiskService.
    2. Performs threshold check (score >= 80).
    3. Triggers SIMULATION SMS alert through SMS provider abstraction with cooldown deduplication.
    4. Returns structured simulation and alert status.
    """
    risk_res = RiskService.evaluate_risk(
        location=req.location,
        disaster_type=req.disaster_type,
        rainfall_mm=req.rain,
        river_level_m=req.river,
        wind_kmh=req.wind,
        soil_saturation=req.soil,
        drainage_blocked=req.drainageBlocked,
        source="User-defined What-if Scenario",
        is_simulated=True
    )
    score = risk_res["compositeScore"]

    # Evaluate alert
    alert_res = await AlertService.evaluate_and_dispatch(
        score=score,
        mode="SIMULATION",
        location=req.location,
        details={
            "rain": req.rain,
            "river": req.river,
            "wind": req.wind,
            "soil": req.soil,
            "drainageBlocked": req.drainageBlocked
        }
    )

    alert_info = {
        "triggered": alert_res.get("triggered", False),
        "threshold": 80,
        "sms_status": alert_res.get("sms_status", alert_res.get("alert", {}).get("smsStatus", "NOT_TRIGGERED")),
        "message_sid": alert_res.get("message_sid"),
        "recipient": alert_res.get("recipient", alert_res.get("alert", {}).get("smsRecipient")),
        "timestamp": alert_res.get("timestamp"),
        "message": alert_res.get("alert", {}).get("message")
    }

    tier_raw = risk_res.get("tier", "Low Risk").upper().replace(" RISK", "")
    return {
        "simulation": {
            "risk_score": score,
            "risk_level": tier_raw,
            "is_simulated": True,
            "details": risk_res
        },
        "alert": alert_info
    }
