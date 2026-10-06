from datetime import date, timedelta
from types import SimpleNamespace

from app.core.crop_analytics import analyze_farm
from app.schemas.farm import FarmAnalysisRequest


def test_baseline_uses_area_and_produces_explainable_market_decision():
    farm = SimpleNamespace(
        id=1,
        name="Test Farm",
        location="Kolhapur, Maharashtra",
        crop="wheat",
        area_acres=5,
        sowing_date=date.today() - timedelta(days=90),
        storage_days=7,
    )
    analysis = analyze_farm(farm, {"status": "unavailable", "source": "Open-Meteo", "forecast": []})

    assert analysis["yield_prediction"]["expected_production_tonnes"] > 0
    assert (
        analysis["yield_prediction"]["low_production_tonnes"]
        < analysis["yield_prediction"]["expected_production_tonnes"]
    )
    assert analysis["recommendation"]["decision"] in {"SELL NOW", "WAIT", "MONITOR"}
    assert "weather was not used" in analysis["yield_prediction"]["inputs_used"][-1]


def test_wheat_input_accepts_kolhapur_five_acres():
    request = FarmAnalysisRequest(
        farm_name="Kolhapur Test Farm",
        field_name="West Field",
        location="Kolhapur, Maharashtra",
        crop="wheat",
        area_acres=5,
        sowing_date=date.today() - timedelta(days=90),
        storage_days=7,
    )

    assert request.crop == "wheat"
    assert request.area_acres == 5
