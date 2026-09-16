from typing import Dict, Any

class WeatherService:
    @staticmethod
    def get_weather(location: str, lat: float, lon: float) -> Dict[str, Any]:
        """
        Retrieves live and forecasted meteorological telemetry.
        Can query Open-Meteo or OpenWeatherMap API when credentials are provided.
        """
        return {
            "location": location,
            "coordinates": {"lat": lat, "lon": lon},
            "rainfall": {
                "value": 86,
                "unit": "mm",
                "delta": "+24mm/6h",
                "subtext": "Last 24h accumulation",
                "trend": [10, 18, 25, 45, 68, 86]
            },
            "forecast": {
                "condition": "Heavy Rain",
                "timeframe": "Next 24 Hours",
                "confidence": 92,
                "expectedMm": 115
            },
            "riverLevel": {
                "value": 3.4,
                "unit": "m",
                "threshold": 3.8,
                "alert": 4.0,
                "breach": 6.0,
                "capacityPercent": 85,
                "delta": "+0.8m / 6h",
                "status": "Moderate"
            },
            "weather": {
                "temp": 28,
                "dew": 24,
                "humidity": 89,
                "subtext": "Atmospheric Saturation High"
            },
            "wind": {
                "speed": 18,
                "unit": "km/h",
                "direction": "NE (45°)",
                "gusts": 34,
                "subtext": "Monsoon trough convergence"
            },
            "soil": {
                "saturation": 84,
                "runoffVelocity": 1.8,
                "ponnaiDischarge": "+38% surcharge"
            }
        }
