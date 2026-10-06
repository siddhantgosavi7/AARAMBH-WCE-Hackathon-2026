"""
Unit tests for Core Feed Calculator.
"""

from app.core.feed_calculator import (
    calculate_daily_feed,
    build_explanation,
)


def test_calculate_daily_feed_optimal():
    # 5000 Tilapia, 200g (Grower stage, base rate 2.5%), Biomass = 900kg
    # Unadjusted = 900 * 0.025 = 22.5 kg
    # Optimal conditions: 28.5°C, 5.8 mg/L DO
    res = calculate_daily_feed(
        biomass_kg=900.0,
        species="tilapia",
        avg_weight_g=200.0,
        temperature=28.5,
        dissolved_oxygen=5.8,
    )
    assert res.species == "tilapia"
    assert res.stage == "grower"
    assert res.unadjusted_feed_kg == 22.5
    assert res.temp_factor == 1.0
    assert res.do_factor == 1.0
    assert res.adjusted_daily_feed_kg == 22.5
    assert "Optimal environmental conditions" in res.explanation


def test_calculate_daily_feed_hypoxia_zero_cutoff():
    # DO < 3.0 mg/L -> feed MUST BE 0.0
    res = calculate_daily_feed(
        biomass_kg=900.0,
        species="tilapia",
        avg_weight_g=200.0,
        temperature=28.5,
        dissolved_oxygen=2.5,
    )
    assert res.do_factor == 0.0
    assert res.adjusted_daily_feed_kg == 0.0
    assert "CRITICAL HYPOXIA ALERT" in res.explanation


def test_calculate_daily_feed_thermal_extreme_zero_cutoff():
    # Temp > 38.0°C for Tilapia -> feed MUST BE 0.0
    res = calculate_daily_feed(
        biomass_kg=900.0,
        species="tilapia",
        avg_weight_g=200.0,
        temperature=39.0,
        dissolved_oxygen=6.0,
    )
    assert res.temp_factor == 0.0
    assert res.adjusted_daily_feed_kg == 0.0
    assert "LETHAL THERMAL EXTREME" in res.explanation


def test_calculate_daily_feed_suboptimal_reduction():
    # Temp: 34.0°C (warm), DO: 4.0 mg/L (mild hypoxia, do_f = 0.5)
    res = calculate_daily_feed(
        biomass_kg=900.0,
        species="tilapia",
        avg_weight_g=200.0,
        temperature=34.0,
        dissolved_oxygen=4.0,
    )
    assert res.do_factor == 0.5
    assert 0.0 < res.temp_factor < 1.0
    expected_combined = res.temp_factor * 0.5
    assert res.adjusted_daily_feed_kg < res.unadjusted_feed_kg
    assert round(res.adjusted_daily_feed_kg, 1) == round(res.unadjusted_feed_kg * expected_combined, 1)
    assert "Low DO" in res.explanation
    assert "Elevated temperature" in res.explanation


def test_calculate_daily_feed_zero_biomass_edge_cases():
    res = calculate_daily_feed(
        biomass_kg=0.0,
        species="tilapia",
        avg_weight_g=200.0,
        temperature=28.0,
        dissolved_oxygen=6.0,
    )
    assert res.adjusted_daily_feed_kg == 0.0
    assert res.unadjusted_feed_kg == 0.0


def test_calculate_daily_feed_fcr_max_cap():
    # When hunger factor is boosted, verify it cannot exceed stage max_daily_rate_pct
    # For Tilapia grower, max_daily_rate_pct is 3.8% (34.2kg for 900kg biomass)
    res = calculate_daily_feed(
        biomass_kg=900.0,
        species="tilapia",
        avg_weight_g=200.0,
        temperature=28.0,
        dissolved_oxygen=6.0,
        hunger_feedback_factor=2.5,  # extreme boost attempt
    )
    assert round(res.adjusted_daily_feed_kg, 2) <= round(900.0 * 0.038, 2)
