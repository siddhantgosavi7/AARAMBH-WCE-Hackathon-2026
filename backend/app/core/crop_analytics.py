import json
from datetime import date
from pathlib import Path
from statistics import mean, pstdev
from typing import Any

DATA_DIR = Path(__file__).parent.parent / "data"
HECTARES_PER_ACRE = 0.404686
CROP_TARGET_DAYS = {"wheat": 120, "soybean": 105}


def _sample(name: str) -> dict[str, Any]:
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def _weather_factor(weather: dict[str, Any]) -> tuple[float, list[str]]:
    if weather.get("status") != "live" or not weather.get("forecast"):
        return 1.0, ["Live weather was unavailable, so weather was not used in this estimate."]
    rain = sum(day.get("rain_mm") or 0 for day in weather["forecast"][:7])
    high = max((day.get("high_c") or 0) for day in weather["forecast"][:7])
    factors, notes = [1.0], [f"Live 7-day rainfall forecast: {rain:.1f} mm."]
    if rain > 100:
        factors.append(0.95)
        notes.append("Heavy forecast rain adds a drainage risk adjustment.")
    elif 15 <= rain <= 80:
        factors.append(1.02)
        notes.append("Forecast rainfall is in a generally supportive range.")
    if high >= 38:
        factors.append(0.96)
        notes.append("High forecast heat adds a crop-stress adjustment.")
    return mean(factors), notes


def _market_recommendation(prices: list[float], storage_days: int) -> dict[str, Any]:
    current = prices[-1]
    recent_average = mean(prices[-5:])
    trend_pct = ((current - prices[0]) / prices[0]) * 100
    if trend_pct <= -2:
        decision = "SELL NOW"
        reason = "The latest price is falling against the recent trend, so holding carries downside risk."
    elif current < recent_average and trend_pct > 1 and storage_days >= 7:
        decision = "WAIT"
        reason = "The latest price is below the recent average while the overall trend is upward, and storage is available."
    else:
        decision = "MONITOR"
        reason = "The recent price signal is mixed or storage time is limited. Recheck prices before committing a sale."
    return {
        "decision": decision,
        "reason": reason,
        "current_price_inr_per_quintal": round(current),
        "recent_average_inr_per_quintal": round(recent_average),
        "trend_pct": round(trend_pct, 1),
        "history": prices,
    }


def analyze_farm(farm: Any, weather: dict[str, Any]) -> dict[str, Any]:
    """Transparent baseline, not an ML model. Uses saved input, samples, and live weather when available."""
    crop = farm.crop.lower()
    yield_history = _sample("sample_crop_history.json")[crop]
    market_history = _sample("sample_market_history.json")[crop]
    historical_yields = yield_history["observations"]
    baseline_yield = mean(historical_yields)
    weather_multiplier, weather_notes = _weather_factor(weather)
    crop_days = (date.today() - farm.sowing_date).days
    maturity_ratio = min(crop_days / CROP_TARGET_DAYS[crop], 1.0)
    maturity_multiplier = 0.85 + (0.15 * maturity_ratio)
    yield_per_hectare = baseline_yield * weather_multiplier * maturity_multiplier
    area_hectares = farm.area_acres * HECTARES_PER_ACRE
    production_tonnes = yield_per_hectare * area_hectares
    variation = pstdev(historical_yields) if len(historical_yields) > 1 else 0
    uncertainty = max(variation * area_hectares, production_tonnes * 0.12)
    market = _market_recommendation(market_history["prices"], farm.storage_days)
    estimated_value = production_tonnes * 10 * market["current_price_inr_per_quintal"]
    confidence = (
        55 + (10 if weather.get("status") == "live" else 0) + (10 if maturity_ratio >= 0.75 else 0)
    )

    return {
        "data_mode": "Hybrid: saved farmer input + bundled sample historical crop/market data + live weather when available. Satellite data is not connected.",
        "farm": {
            "id": farm.id,
            "name": farm.name,
            "location": farm.location,
            "crop": crop.title(),
            "area_acres": farm.area_acres,
            "sowing_date": farm.sowing_date.isoformat(),
            "storage_days": farm.storage_days,
        },
        "weather": weather,
        "satellite": {
            "status": "not_connected",
            "message": "No satellite provider or field boundary has been configured. NDVI is not shown or used in the estimate.",
        },
        "historical_crop_data": {
            "source": yield_history["source"],
            "unit": yield_history["unit"],
            "observations": historical_yields,
            "average_yield_per_hectare": round(baseline_yield, 2),
        },
        "yield_prediction": {
            "method": "Transparent historical-yield baseline; this is not a trained ML model.",
            "unit": "tonnes/hectare",
            "yield_per_hectare": round(yield_per_hectare, 2),
            "expected_production_tonnes": round(production_tonnes, 2),
            "low_production_tonnes": round(max(0, production_tonnes - uncertainty), 2),
            "high_production_tonnes": round(production_tonnes + uncertainty, 2),
            "confidence_pct": confidence,
            "inputs_used": [
                "crop",
                "farm area",
                "sowing date",
                "bundled historical yield observations",
                *weather_notes,
            ],
            "limitations": "No trained model evaluation, real historical field records, or satellite features are available in this prototype.",
        },
        "market": {
            "source": market_history["source"],
            "market": market_history["market"],
            "unit": market_history["unit"],
            **market,
        },
        "recommendation": {
            **market,
            "estimated_gross_value_inr": round(estimated_value),
            "explanation": f"{market['reason']} Expected production is {production_tonnes:.2f} tonnes based on the stated baseline.",
        },
    }
