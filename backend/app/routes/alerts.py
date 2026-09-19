from datetime import datetime, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter
from app.services.alert_service import AlertService
from app.services.sms_service import send_sms, mask_phone_number
from app.whatsapp_service import create_whatsapp_alert
from app.utils.config import settings

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class WhatsAppAlertRequest(BaseModel):
    phone_number: str = Field(default="917373733474", description="Recipient phone number (e.g. 917373733474)")
    risk_level: str = Field(default="HIGH", description="Emergency risk level: LOW, MEDIUM, HIGH, CRITICAL")
    location: str = Field(default="Karur", description="Hazard location name")

class AlertEvaluateRequest(BaseModel):
    score: int = Field(..., description="Calculated composite risk score (0 - 100)")
    mode: str = Field(default="LIVE", description="Source mode: 'LIVE' or 'SIMULATION'")
    location: str = Field(default="Vellore District", description="Target hazard region")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Optional telemetry or contributing factors")

class AlertTestRequest(BaseModel):
    message: Optional[str] = Field(
        default="Twilio SMS Test — Demo: DisasterLens AI alert system connection verified successfully. Authorized recipient status: ACTIVE.",
        description="Optional custom test message text"
    )

@router.post("/evaluate")
async def evaluate_alert(req: AlertEvaluateRequest):
    """
    Evaluates whether a risk score meets or exceeds the threshold (>= 80).
    If threshold is reached, triggers live or simulation alert with SMS cooldown.
    """
    return await AlertService.evaluate_and_dispatch(
        score=req.score,
        mode=req.mode,
        location=req.location,
        details=req.details
    )

@router.post("/live")
async def evaluate_live_alert(req: AlertEvaluateRequest):
    """
    Evaluates LIVE risk score alert condition (score >= 80).
    Uses exclusively live data analysis results.
    """
    return await AlertService.evaluate_and_dispatch(
        score=req.score,
        mode="LIVE",
        location=req.location,
        details=req.details
    )

@router.post("/simulation")
async def evaluate_simulation_alert(req: AlertEvaluateRequest):
    """
    Evaluates WHAT-IF SIMULATION score alert condition (score >= 80).
    Uses exclusively hypothetical simulation scenario inputs.
    """
    return await AlertService.evaluate_and_dispatch(
        score=req.score,
        mode="SIMULATION",
        location=req.location,
        details=req.details
    )

@router.post("/test")
@router.post("/test-sms")
async def trigger_test_sms(req: Optional[AlertTestRequest] = None):
    """
    Deliberate manual test SMS trigger for hackathon demonstration.
    Uses Twilio backend service, targets authorized demo recipient, never exposes credentials.
    """
    msg_text = req.message if req and req.message else "DisasterLens AI test SMS — authorized hackathon demonstration."
    res = await send_sms(message=msg_text)
    now_iso = datetime.now(timezone.utc).isoformat()
    status_str = res.get("status", "FAILED")
    return {
        "success": res.get("success", False),
        "triggered": True,
        "risk_score": 0,
        "threshold": settings.alert_threshold,
        "alert_type": "test",
        "sms_status": status_str.lower(),
        "status": status_str,
        "message_sid": res.get("message_sid"),
        "recipient": res.get("maskedRecipient", AlertService.get_masked_recipient()),
        "provider": res.get("provider", settings.sms_provider),
        "timestamp": now_iso,
        "error": res.get("error")
    }

@router.post("/whatsapp")
def send_whatsapp_alert(req: WhatsAppAlertRequest):
    """
    Generates a WhatsApp Click-to-Chat emergency alert link.
    No WhatsApp API key required. User presses Send inside WhatsApp.
    """
    return create_whatsapp_alert(
        phone_number=req.phone_number,
        risk_level=req.risk_level,
        location=req.location
    )

@router.get("/config")
def get_alert_configuration():
    """
    Returns public/sanitized alert engine configuration (masked phone number, threshold, mode).
    Never exposes raw phone numbers or API secrets.
    """
    return AlertService.get_config()

@router.get("/history")
def get_alert_history():
    """
    Returns recent triggered alert events.
    """
    return AlertService.get_history()
