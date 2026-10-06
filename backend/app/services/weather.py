from typing import Any

import httpx

from app.config import settings

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def _condition(code: int | None) -> str:
    if code in {0, 1}:
        return "Clear"
    if code in {2, 3}:
        return "Cloudy"
    if code in {51, 53, 55, 56, 57}:
        return "Drizzle"
    if code in {61, 63, 65, 80, 81, 82}:
        return "Rain"
    if code in {95, 96, 99}:
        return "Thunderstorm"
    return "Unknown"


def fetch_weather(location: str) -> dict[str, Any]:
    """Fetch real geocoded forecast data, returning an explicit unavailable state on failure."""
    try:
        with httpx.Client(timeout=settings.WEATHER_TIMEOUT_SECONDS) as client:
            geocode = client.get(
                GEOCODING_URL, params={"name": location, "count": 1, "language": "en"}
            )
            geocode.raise_for_status()
            results = geocode.json().get("results") or []
            if not results:
                return {
                    "status": "unavailable",
                    "source": "Open-Meteo",
                    "error": "Location was not found",
                    "forecast": [],
                }
            place = results[0]
            forecast = client.get(
                FORECAST_URL,
                params={
                    "latitude": place["latitude"],
                    "longitude": place["longitude"],
                    "timezone": "auto",
                    "forecast_days": 7,
                    "current": "temperature_2m,relative_humidity_2m,precipitation",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean",
                },
            )
            forecast.raise_for_status()
            payload = forecast.json()
    except (httpx.HTTPError, KeyError, TypeError) as exc:
        return {"status": "unavailable", "source": "Open-Meteo", "error": str(exc), "forecast": []}

    daily = payload.get("daily", {})
    days = []
    for index, day in enumerate(daily.get("time", [])):
        days.append(
            {
                "date": day,
                "condition": _condition(daily.get("weather_code", [None])[index]),
                "high_c": daily.get("temperature_2m_max", [None])[index],
                "low_c": daily.get("temperature_2m_min", [None])[index],
                "rain_mm": daily.get("precipitation_sum", [0])[index],
                "humidity_pct": daily.get("relative_humidity_2m_mean", [None])[index],
            }
        )
    return {
        "status": "live",
        "source": "Open-Meteo",
        "location": place.get("name", location),
        "coordinates": {"latitude": place["latitude"], "longitude": place["longitude"]},
        "current": payload.get("current"),
        "forecast": days,
    }
