"""
Unit tests for Biomass and SGR Growth Models.
"""

from app.core.growth import (
    calculate_biomass,
    calculate_sgr,
    calculate_daily_weight_gain,
    determine_stage_name,
)


def test_calculate_biomass_standard():
    # 5000 fish, 200g, 90% survival -> 5000 * 200 / 1000 * 0.9 = 900.0 kg
    biomass = calculate_biomass(5000, 200.0, 0.90)
    assert biomass == 900.0


def test_calculate_biomass_edge_cases():
    assert calculate_biomass(0, 200.0, 0.9) == 0.0
    assert calculate_biomass(5000, 0.0, 0.9) == 0.0
    assert calculate_biomass(5000, 200.0, 0.0) == 0.0
    assert calculate_biomass(-100, 200.0, 0.9) == 0.0
    # Survival rate clamped to 1.0 max
    assert calculate_biomass(1000, 100.0, 1.5) == 100.0


def test_calculate_sgr():
    # Weight grows from 100g to 150g in 30 days
    sgr = calculate_sgr(100.0, 150.0, 30.0)
    assert sgr > 0.0
    assert round(sgr, 2) == 1.35

    # Edge cases
    assert calculate_sgr(0, 100, 10) == 0.0
    assert calculate_sgr(100, 0, 10) == 0.0
    assert calculate_sgr(100, 150, 0) == 0.0


def test_calculate_daily_weight_gain():
    # Grower Tilapia (180g), nominal SGR = 1.2%
    # With stress=1.0: 180 * (1 + 0.012) = 182.16g
    gain_optimal = calculate_daily_weight_gain(180.0, "tilapia", stress_factor=1.0, days=1.0)
    assert gain_optimal == 182.16

    # With severe stress=0.0: no growth
    gain_stressed = calculate_daily_weight_gain(180.0, "tilapia", stress_factor=0.0, days=1.0)
    assert gain_stressed == 180.0

    # With mild stress=0.5: SGR = 0.6% -> 180 * 1.006 = 181.08g
    gain_mild = calculate_daily_weight_gain(180.0, "tilapia", stress_factor=0.5, days=1.0)
    assert gain_mild == 181.08

    # Edge case: zero or negative weight
    assert calculate_daily_weight_gain(0.0, "tilapia") == 0.0


def test_determine_stage_name():
    assert determine_stage_name("tilapia", 0.5) == "fry"
    assert determine_stage_name("tilapia", 15.0) == "fingerling"
    assert determine_stage_name("tilapia", 50.0) == "juvenile"
    assert determine_stage_name("tilapia", 250.0) == "grower"
    assert determine_stage_name("tilapia", 500.0) == "finisher"
