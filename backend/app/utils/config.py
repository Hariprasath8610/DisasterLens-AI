import os
from pathlib import Path
from typing import Any
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
    high_risk_threshold: int = 80
    sms_demo_mode: bool = True
    sms_cooldown_minutes: int = 60
    openweather_api_key: str = ""
    gemini_api_key: str = ""
    openai_api_key: str = ""

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
