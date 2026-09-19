import abc
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from app.utils.config import settings

logger = logging.getLogger("disasterlens.sms")

def mask_phone_number(number: str) -> str:
    """Safely masks a phone number for logs and frontend payload."""
    cleaned = (number or "").strip()
    if not cleaned:
        return "Not Configured"
    if len(cleaned) <= 4:
        return "****" + cleaned
    return "******" + cleaned[-4:]

class BaseSMSProvider(abc.ABC):
    @abc.abstractmethod
    async def send_alert_sms(
        self,
        alert_type: str,
        risk_score: int,
        threshold: int,
        timestamp: str,
        recipient: str,
        message: str
    ) -> Dict[str, Any]:
        """
        Sends an alert SMS and returns structured delivery result:
        {
            "success": bool,
            "status": "SENT" | "REQUEST_ACCEPTED" | "FAILED" | "DEMO",
            "message_sid": Optional[str],
            "provider": str,
            "maskedRecipient": str,
            "error": Optional[str]
        }
        """
        pass

class MockSMSProvider(BaseSMSProvider):
    """
    Default mock/demo provider for local development, hackathon demos,
    and automated testing. Does not transmit billable SMS.
    """
    async def send_alert_sms(
        self,
        alert_type: str,
        risk_score: int,
        threshold: int,
        timestamp: str,
        recipient: str,
        message: str
    ) -> Dict[str, Any]:
        masked = mask_phone_number(recipient)
        mock_sid = f"SM_MOCK_{int(time.time() * 1000)}"
        # Log ONLY: alert type, risk score, threshold, timestamp, delivery status
        logger.info(
            "ALERT LOG | Alert Type: %s | Risk Score: %d | Threshold: %d | Timestamp: %s | Delivery Status: DEMO | Recipient: %s",
            alert_type, risk_score, threshold, timestamp, masked
        )
        return {
            "success": True,
            "status": "DEMO",
            "message_sid": mock_sid,
            "provider": "mock",
            "maskedRecipient": masked,
            "error": None
        }

class TwilioSMSProvider(BaseSMSProvider):
    """
    Official Twilio Python SDK integration for authorized deployments.
    Never exposes Twilio Auth Token or credentials in logs or payloads.
    """
    def __init__(
        self,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        from_number: Optional[str] = None
    ):
        self.account_sid = account_sid.strip() if account_sid is not None else (settings.twilio_account_sid or "").strip()
        self.auth_token = auth_token.strip() if auth_token is not None else (settings.twilio_auth_token or "").strip()
        self.from_number = from_number.strip() if from_number is not None else (settings.get_twilio_phone_number() or "").strip()

    def is_configured(self) -> bool:
        return bool(self.account_sid and self.auth_token and self.from_number)

    async def send_alert_sms(
        self,
        alert_type: str,
        risk_score: int,
        threshold: int,
        timestamp: str,
        recipient: str,
        message: str
    ) -> Dict[str, Any]:
        masked = mask_phone_number(recipient)

        if not self.is_configured():
            err_msg = "Twilio credentials missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in backend .env."
            logger.error(
                "ALERT LOG | Alert Type: %s | Risk Score: %d | Threshold: %d | Timestamp: %s | Delivery Status: FAILED | Reason: Missing credentials",
                alert_type, risk_score, threshold, timestamp
            )
            return {
                "success": False,
                "status": "FAILED",
                "message_sid": None,
                "provider": "twilio",
                "maskedRecipient": masked,
                "error": err_msg
            }

        try:
            # Create official Twilio client
            client = Client(self.account_sid, self.auth_token)

            # Send SMS via official SDK
            msg = client.messages.create(
                to=recipient,
                from_=self.from_number,
                body=message
            )

            # Map Twilio delivery/request status
            raw_status = (msg.status or "unknown").lower()
            if raw_status in ("queued", "accepted", "sending"):
                reported_status = "REQUEST_ACCEPTED"
            elif raw_status in ("sent", "delivered"):
                reported_status = "SENT"
            elif raw_status in ("failed", "undelivered"):
                reported_status = "FAILED"
            else:
                reported_status = "UNKNOWN"

            logger.info(
                "ALERT LOG | Alert Type: %s | Risk Score: %d | Threshold: %d | Timestamp: %s | Delivery Status: %s | SID: %s",
                alert_type, risk_score, threshold, timestamp, reported_status, msg.sid
            )
            return {
                "success": reported_status != "FAILED",
                "status": reported_status,
                "raw_status": raw_status,
                "message_sid": msg.sid,
                "provider": "twilio",
                "maskedRecipient": masked,
                "error": None
            }
        except TwilioRestException as exc:
            # Safe handling: never log auth token or raw sensitive headers
            err_detail = f"Twilio API error ({getattr(exc, 'code', 'error')}): {getattr(exc, 'msg', str(exc))}"
            logger.error(
                "ALERT LOG | Alert Type: %s | Risk Score: %d | Threshold: %d | Timestamp: %s | Delivery Status: FAILED | Twilio Code: %s",
                alert_type, risk_score, threshold, timestamp, getattr(exc, "code", "UNKNOWN")
            )
            return {
                "success": False,
                "status": "FAILED",
                "message_sid": None,
                "provider": "twilio",
                "maskedRecipient": masked,
                "error": err_detail
            }
        except Exception as exc:
            logger.error(
                "ALERT LOG | Alert Type: %s | Risk Score: %d | Threshold: %d | Timestamp: %s | Delivery Status: FAILED | Error: %s",
                alert_type, risk_score, threshold, timestamp, str(exc)
            )
            return {
                "success": False,
                "status": "FAILED",
                "message_sid": None,
                "provider": "twilio",
                "maskedRecipient": masked,
                "error": str(exc)
            }

class WebhookSMSProvider(BaseSMSProvider):
    """
    Real SMS gateway via generic HTTP Webhook for external SMS dispatchers.
    """
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send_alert_sms(
        self,
        alert_type: str,
        risk_score: int,
        threshold: int,
        timestamp: str,
        recipient: str,
        message: str
    ) -> Dict[str, Any]:
        masked = mask_phone_number(recipient)
        if not self.webhook_url:
            return {
                "success": False,
                "status": "FAILED",
                "message_sid": None,
                "provider": "webhook",
                "maskedRecipient": masked,
                "error": "SMS Webhook URL not configured."
            }

        payload = {
            "alertType": alert_type,
            "riskScore": risk_score,
            "threshold": threshold,
            "timestamp": timestamp,
            "recipient": recipient,
            "message": message
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(self.webhook_url, json=payload)
                if 200 <= res.status_code < 300:
                    logger.info(
                        "ALERT LOG | Alert Type: %s | Risk Score: %d | Threshold: %d | Timestamp: %s | Delivery Status: SENT | Recipient: %s",
                        alert_type, risk_score, threshold, timestamp, masked
                    )
                    return {
                        "success": True,
                        "status": "SENT",
                        "message_sid": f"WH_{int(time.time() * 1000)}",
                        "provider": "webhook",
                        "maskedRecipient": masked,
                        "error": None
                    }
                else:
                    return {
                        "success": False,
                        "status": "FAILED",
                        "message_sid": None,
                        "provider": "webhook",
                        "maskedRecipient": masked,
                        "error": f"Webhook returned HTTP {res.status_code}"
                    }
        except Exception as exc:
            return {
                "success": False,
                "status": "FAILED",
                "message_sid": None,
                "provider": "webhook",
                "maskedRecipient": masked,
                "error": str(exc)
            }

class SMSFactory:
    @staticmethod
    def get_provider() -> BaseSMSProvider:
        provider_name = (settings.sms_provider or "twilio").strip().lower()
        if provider_name == "twilio" or (settings.twilio_account_sid and provider_name != "mock"):
            return TwilioSMSProvider(
                account_sid=settings.twilio_account_sid,
                auth_token=settings.twilio_auth_token,
                from_number=settings.get_twilio_phone_number()
            )
        elif provider_name == "webhook":
            return WebhookSMSProvider(webhook_url=settings.sms_webhook_url)
        elif provider_name == "mock":
            return MockSMSProvider()
        return TwilioSMSProvider()

async def send_sms(message: str, recipient: Optional[str] = None) -> Dict[str, Any]:
    """
    Direct SMS transmission interface conceptually equivalent to send_sms(message).
    Validates credentials, creates Twilio client, dispatches SMS, returns status and SID.
    Never exposes credentials or full phone numbers.
    """
    target_recipient = recipient or settings.get_alert_recipient()
    provider = SMSFactory.get_provider()
    now_iso = datetime.now(timezone.utc).isoformat()
    return await provider.send_alert_sms(
        alert_type="MANUAL TEST ALERT",
        risk_score=0,
        threshold=settings.alert_threshold,
        timestamp=now_iso,
        recipient=target_recipient,
        message=message
    )

async def send_alert_sms(
    alert_type: str,
    risk_score: int,
    threshold: int,
    timestamp: str,
    recipient: Optional[str] = None,
    message: str = ""
) -> Dict[str, Any]:
    target_recipient = recipient or settings.get_alert_recipient()
    provider = SMSFactory.get_provider()
    return await provider.send_alert_sms(
        alert_type=alert_type,
        risk_score=risk_score,
        threshold=threshold,
        timestamp=timestamp,
        recipient=target_recipient,
        message=message
    )
