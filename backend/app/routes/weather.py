from fastapi import APIRouter, HTTPException, Query
from app.services.weather_service import WeatherApiError, WeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("")
async def get_weather(
    location: str = Query("Vellore District", description="Location name"),
    lat: float = Query(12.34, description="Latitude"),
    lon: float = Query(79.13, description="Longitude")
):
    if not -90 <= lat <= 90 or not -180 <= lon <= 180:
        raise HTTPException(status_code=400, detail="Coordinates must be latitude -90..90 and longitude -180..180.")
    try:
        return await WeatherService.get_weather(location=location, lat=lat, lon=lon)
    except WeatherApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
