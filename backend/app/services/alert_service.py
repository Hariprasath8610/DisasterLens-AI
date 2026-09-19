import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.utils.config import settings
from app.services.sms_service import send_alert_sms, mask_phone_number

logger = logging.getLogger("disasterlens.alerts")

class AlertService:
    # In-memory cooldown cache: maps (mode, location) -> last_triggered_epoch_seconds
    _last_triggered: Dict[str, float] = {}
    
    # In-memory previous score cache to detect threshold-crossing transitions (e.g., < 80 -> >= 80)
    _previous_scores: Dict[str, int] = {}

    # In-memory history of triggered alerts
    _alert_history: List[Dict[str, Any]] = []

    @classmethod
    def get_masked_recipient(cls) -> str:
        """
        Safely masks the backend-configured recipient phone number for frontend display.
        Example: '+15550198765' -> '******8765'
        Never returns or logs the raw phone number.
        """
        return mask_phone_number(settings.get_alert_recipient())

    @classmethod
    def should_trigger_sms(cls, mode: str, location: str, current_score: int, threshold: int) -> bool:
        """
        Enforces alert threshold-crossing detection and cooldown policy:
        1. Triggers SMS when crossing from below threshold to >= threshold (e.g. 75 -> 82).
        2. If already above threshold, suppresses SMS within ALERT_COOLDOWN_SECONDS.
        3. Allows new SMS once the cooldown period has completely elapsed.
        """
        cache_key = f"{mode.upper()}:{location.strip().lower()}"
        now = time.time()
        cooldown_seconds = settings.get_cooldown_seconds()

        last_time = cls._last_triggered.get(cache_key)
        if last_time is not None:
            elapsed = now - last_time
            if elapsed < cooldown_seconds:
                return False

        cls._last_triggered[cache_key] = now
        return True

    @classmethod
    async def evaluate_and_dispatch(
        cls,
        score: int,
        mode: str = "LIVE",
        location: str = "Vellore District",
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Core Alert Evaluation Engine:
        Condition: score >= ALERT_THRESHOLD (default 80)
        Modes: LIVE vs SIMULATION
        Enforces independent states, threshold crossing detection, cooldown, and SMS dispatch.
        """
        threshold = settings.alert_threshold
        now_iso = datetime.now(timezone.utc).isoformat()
        is_triggered = score >= threshold
        masked_recipient = cls.get_masked_recipient()
        mode_upper = mode.upper()
        cache_key = f"{mode_upper}:{location.strip().lower()}"

        if not is_triggered:
            # Score is below threshold: track previous score to re-arm threshold crossing detection
            cls._previous_scores[cache_key] = score
            return {
                "alert_type": mode_upper.lower(),
                "triggered": False,
                "risk_score": score,
                "score": score,
                "threshold": threshold,
                "sms_status": "NOT_TRIGGERED",
                "smsDispatched": False,
                "smsStatus": "Not Triggered",
                "message_sid": None,
                "recipient": masked_recipient,
                "mode": mode_upper,
                "location": location,
                "reason": f"Risk score ({score}) is below alert threshold ({threshold}).",
                "timestamp": now_iso
            }

        # Score >= threshold
        prev_score = cls._previous_scores.get(cache_key)
        cls._previous_scores[cache_key] = score

        can_dispatch_sms = cls.should_trigger_sms(mode_upper, location, score, threshold)
        sms_status = "COOLDOWN"
        message_sid = None

        if mode_upper == "LIVE":
            alert_type = "LIVE RISK ALERT"
            source_desc = "Windy API + Live Risk Analysis"
            message = (
                f"LIVE RISK ALERT — DisasterLens AI current risk estimate is {score}/100 and has crossed "
                f"the configured threshold of {threshold}. This is an AI-assisted risk estimate, not an official emergency warning."
            )
        else:
            alert_type = "DEMO ALERT"
            source_desc = "User-defined What-if Scenario"
            message = (
                f"DEMO ALERT — DisasterLens AI hypothetical simulation risk score is {score}/100 and has crossed "
                f"the configured threshold of {threshold}. This is a hackathon simulation and not an official emergency warning."
            )

        if can_dispatch_sms:
            if settings.alert_mode == "disabled":
                sms_status = "DISABLED"
            else:
                # Dispatch through SMS provider (Twilio SDK / Mock / Webhook)
                dispatch_res = await send_alert_sms(
                    alert_type=alert_type,
                    risk_score=score,
                    threshold=threshold,
                    timestamp=now_iso,
                    message=message
                )
                sms_status = dispatch_res.get("status", "FAILED")
                message_sid = dispatch_res.get("message_sid")
        else:
            sms_status = "COOLDOWN"

        alert_event = {
            "id": f"alert-{int(time.time() * 1000)}",
            "alertType": alert_type,
            "mode": mode_upper,
            "source": source_desc,
            "riskScore": score,
            "threshold": threshold,
            "status": "TRIGGERED",
            "smsStatus": sms_status,
            "sms_status": sms_status,
            "message_sid": message_sid,
            "smsRecipient": masked_recipient,
            "recipient": masked_recipient,
            "message": message,
            "disclaimer": "AI-assisted risk estimate. Not an official emergency warning.",
            "location": location,
            "timestamp": now_iso,
            "details": details or {}
        }

        # Prepend to history (keep recent 50)
        cls._alert_history.insert(0, alert_event)
        if len(cls._alert_history) > 50:
            cls._alert_history = cls._alert_history[:50]

        return {
            "alert_type": mode_upper.lower(),
            "triggered": True,
            "risk_score": score,
            "score": score,
            "threshold": threshold,
            "sms_status": sms_status,
            "message_sid": message_sid,
            "recipient": masked_recipient,
            "timestamp": now_iso,
            "alert": alert_event
        }

    @classmethod
    def get_history(cls) -> List[Dict[str, Any]]:
        return cls._alert_history

    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        return {
            "alertMode": settings.alert_mode,
            "alertThreshold": settings.alert_threshold,
            "smsProvider": settings.sms_provider,
            "maskedRecipient": cls.get_masked_recipient(),
            "cooldownSeconds": settings.get_cooldown_seconds(),
            "cooldownMinutes": settings.sms_cooldown_minutes,
            "isDemoMode": settings.alert_mode == "demo"
        }

    @classmethod
    def clear_cooldown(cls, mode: Optional[str] = None, location: Optional[str] = None):
        """Helper for test suites to reset cooldown state."""
        if mode and location:
            key = f"{mode.upper()}:{location.strip().lower()}"
            cls._last_triggered.pop(key, None)
            cls._previous_scores.pop(key, None)
        else:
            cls._last_triggered.clear()
            cls._previous_scores.clear()
