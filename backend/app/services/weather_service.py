"""Backend-only adapter for Windy Point Forecast API v2."""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

import httpx

from app.utils.config import settings

WINDY_URL = "https://api.windy.com/api/point-forecast/v2"


class WeatherApiError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class WeatherService:
    @staticmethod
    def _first_value(payload: dict[str, Any], key: str) -> Any:
        values = payload.get(key) or []
        return next((value for value in values if value is not None), None)

    @staticmethod
    def _unit(payload: dict[str, Any], key: str) -> str | None:
        return (payload.get("units") or {}).get(key)

    @staticmethod
    def _celsius(value: float | None, unit: str | None) -> float | None:
        if value is None:
            return None
        return round(value - 273.15, 1) if unit and unit.upper() in {"K", "KELVIN"} else round(value, 1)

    @staticmethod
    def _kmh(value: float | None, unit: str | None) -> float | None:
        if value is None:
            return None
        return round(value * 3.6, 1) if unit and ("m*s-1" in unit or unit in {"m/s", "ms-1"}) else round(value, 1)

    @classmethod
    async def get_weather(cls, location: str, lat: float, lon: float) -> dict[str, Any]:
        if not settings.windy_api_key:
            raise WeatherApiError(503, "Weather service is not configured. Set WINDY_API_KEY on the backend.")

        request_body = {
            "lat": lat,
            "lon": lon,
            "model": "gfs",
            "parameters": ["temp", "dewpoint", "precip", "wind", "windGust", "rh", "pressure"],
            "levels": ["surface"],
            "key": settings.windy_api_key,
        }

        try:
            async with httpx.AsyncClient(timeout=settings.windy_timeout_seconds) as client:
                response = await client.post(WINDY_URL, json=request_body)
        except httpx.TimeoutException as exc:
            raise WeatherApiError(504, "Windy Point Forecast API timed out.") from exc
        except httpx.RequestError as exc:
            raise WeatherApiError(502, "Windy Point Forecast API could not be reached.") from exc

        if response.status_code in {401, 403}:
            raise WeatherApiError(response.status_code, "Windy API key was rejected.")
        if response.status_code == 429:
            raise WeatherApiError(429, "Windy API rate limit reached. Please try again later.")
        if response.status_code != 200:
            raise WeatherApiError(502, "Windy Point Forecast API returned an error.")

        try:
            payload = response.json()
        except ValueError as exc:
            raise WeatherApiError(502, "Windy Point Forecast API returned invalid JSON.") from exc

        timestamps = payload.get("ts") or []
        if not timestamps:
            raise WeatherApiError(502, "Windy Point Forecast API returned no forecast timestamps.")

        temp_key, dew_key = "temp-surface", "dewpoint-surface"
        precip_key, humidity_key, pressure_key = "past3hprecip-surface", "rh-surface", "pressure-surface"
        wind_u_key, wind_v_key, gust_key = "wind_u-surface", "wind_v-surface", "gust-surface"
        temp = cls._first_value(payload, temp_key)
        dewpoint = cls._first_value(payload, dew_key)
        precip = cls._first_value(payload, precip_key)
        humidity = cls._first_value(payload, humidity_key)
        pressure = cls._first_value(payload, pressure_key)
        wind_u = cls._first_value(payload, wind_u_key)
        wind_v = cls._first_value(payload, wind_v_key)
        gust = cls._first_value(payload, gust_key)

        if all(value is None for value in (temp, dewpoint, precip, humidity, pressure, wind_u, wind_v, gust)):
            raise WeatherApiError(502, "Windy Point Forecast API returned no usable weather values.")

        wind_speed = math.hypot(wind_u, wind_v) if wind_u is not None and wind_v is not None else None
        pressure_unit = cls._unit(payload, pressure_key)
        pressure_hpa = round(pressure / 100, 1) if pressure is not None and pressure_unit == "Pa" else pressure
        timestamp = datetime.fromtimestamp(timestamps[0] / 1000, tz=timezone.utc).isoformat()

        return {
            "source": "Windy Point Forecast API",
            "location": location,
            "coordinates": {"lat": lat, "lon": lon},
            "timestamp": timestamp,
            "rainfall": {"value": precip, "unit": "mm", "period": "Previous 3 hours"},
            "weather": {
                "temp": cls._celsius(temp, cls._unit(payload, temp_key)),
                "dewpoint": cls._celsius(dewpoint, cls._unit(payload, dew_key)),
                "unit": "°C",
                "humidity": humidity,
                "humidityUnit": "%",
                "pressure": pressure_hpa,
                "pressureUnit": "hPa" if pressure_hpa is not None else None,
            },
            "wind": {
                "speed": cls._kmh(wind_speed, cls._unit(payload, wind_u_key)),
                "unit": "km/h",
                "gusts": cls._kmh(gust, cls._unit(payload, gust_key)),
            },
            "dataQuality": {"isLiveApiData": True, "isMockData": False},
        }
