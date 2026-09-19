import os
from pathlib import Path
from typing import Any, Optional
from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent

# Explicitly load backend/.env first, with fallback to root .env
load_dotenv(BACKEND_DIR / ".env", override=False)
load_dotenv(ROOT_DIR / ".env", override=False)

class Settings(BaseSettings):
    app_name: str = "DisasterLens AI API"
    app_version: str = "1.0.0"
    environment: str = "development"
    port: int = 8000
    host: str = "0.0.0.0"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    # AI Service & Ollama Local Configuration
    ai_service_provider: str = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:8b"
    ollama_timeout: float = 120.0
    ollama_num_predict: int = 450

    # Backend-only integrations (Windy, SMS, Risk Engine). Never expose to clients.
    windy_api_key: str = ""
    windy_timeout_seconds: float = 10.0
    alert_mode: str = "demo"  # "demo", "production", "disabled"
    alert_threshold: int = 80
    high_risk_threshold: int = 80
    sms_demo_mode: bool = True
    sms_cooldown_minutes: int = 60
    demo_sms_recipient: str = "+15550198765"
    
    # Twilio Official SMS Alert Integration
    sms_provider: str = "twilio"  # "twilio", "mock", "webhook"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    twilio_from_number: str = ""
    alert_recipient_phone: str = ""
    demo_sms_recipient: str = "+917373733474"
    alert_cooldown_seconds: Optional[int] = 300
    sms_cooldown_minutes: int = 5
    sms_webhook_url: str = ""
    whatsapp_recipient_phone: str = "917373733474"

    openweather_api_key: str = ""
    gemini_api_key: str = ""
    openai_api_key: str = ""

    def get_twilio_phone_number(self) -> str:
        return (self.twilio_phone_number or self.twilio_from_number or "").strip()

    def get_alert_recipient(self) -> str:
        return (self.alert_recipient_phone or self.demo_sms_recipient or "").strip()

    def get_cooldown_seconds(self) -> int:
        if self.alert_cooldown_seconds is not None and self.alert_cooldown_seconds > 0:
            return int(self.alert_cooldown_seconds)
        if self.sms_cooldown_minutes is not None and self.sms_cooldown_minutes > 0:
            return int(self.sms_cooldown_minutes * 60)
        return 300

    @field_validator("windy_api_key", mode="before")
    @classmethod
    def sanitize_windy_key(cls, v: Any) -> str:
        if v is None:
            return ""
        cleaned = str(v).strip()
        # Remove any surrounding single or double quotes
        if (cleaned.startswith('"') and cleaned.endswith('"')) or (cleaned.startswith("'") and cleaned.endswith("'")):
            cleaned = cleaned[1:-1].strip()
        return cleaned

    model_config = SettingsConfigDict(
        env_file=(
            str(BACKEND_DIR / ".env"),
            str(ROOT_DIR / ".env"),
            ".env"
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
