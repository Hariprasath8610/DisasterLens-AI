from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "DisasterLens AI API"
    app_version: str = "1.0.0"
    environment: str = "development"
    port: int = 8000
    host: str = "0.0.0.0"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    # Backend-only integrations. Never expose these values through an API response.
    windy_api_key: str = ""
    windy_timeout_seconds: float = 10.0
    high_risk_threshold: int = 80
    sms_demo_mode: bool = True
    sms_cooldown_minutes: int = 60
    gemini_api_key: str = ""
    openai_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
