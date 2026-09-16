import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "DisasterLens AI API"
    app_version: str = "1.0.0"
    environment: str = "development"
    port: int = 8000
    host: str = "0.0.0.0"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    # Optional Third-party API keys
    openweather_api_key: str = os.getenv("OPENWEATHER_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
