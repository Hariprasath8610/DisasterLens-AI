from fastapi import APIRouter
from datetime import datetime, timezone
from app.utils.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def check_health():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
