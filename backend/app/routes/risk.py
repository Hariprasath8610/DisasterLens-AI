from fastapi import APIRouter, Query
from app.services.risk_service import RiskService

router = APIRouter(prefix="/risk", tags=["Risk"])

@router.get("")
def get_risk_evaluation(
    location: str = Query("Vellore District", description="Location name"),
    disaster_type: str = Query("flood", description="Disaster category (flood, cyclone, landslide)")
):
    return RiskService.evaluate_risk(location=location, disaster_type=disaster_type)
