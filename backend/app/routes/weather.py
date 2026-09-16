from fastapi import APIRouter, Query
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("")
def get_weather(
    location: str = Query("Vellore District", description="Location name"),
    lat: float = Query(12.34, description="Latitude"),
    lon: float = Query(79.13, description="Longitude")
):
    return WeatherService.get_weather(location=location, lat=lat, lon=lon)
