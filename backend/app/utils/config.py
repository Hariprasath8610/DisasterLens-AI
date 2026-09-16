import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "DisasterLens AI API"
    app_version: str = "1.0.0"
    environment: str = "development"
    port: int = 8000
    host: str = "0.0.0.0"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    # AI Service & Ollama Local Configuration
    ai_service_provider: str = os.getenv("AI_SERVICE_PROVIDER", "ollama")
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "qwen3:8b")
    ollama_timeout: float = float(os.getenv("OLLAMA_TIMEOUT", "120.0"))
    ollama_num_predict: int = int(os.getenv("OLLAMA_NUM_PREDICT", "450"))

    # Optional Third-party Weather API
    openweather_api_key: str = os.getenv("OPENWEATHER_API_KEY", "")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
