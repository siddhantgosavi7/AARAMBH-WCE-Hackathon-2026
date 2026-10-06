"""
Unit tests for Pollution Accounting and Savings calculations.
"""

from app.core.pollution import (
    calculate_nitrogen_load,
    calculate_phosphorus_load,
    calculate_pollution_risk_score,
    calculate_savings_vs_baseline,
)


def test_calculate_nitrogen_load_mass_balance():
    # 10 kg feed, 30% crude protein, 30% retention
    # N_load = 10 * 0.30 * 0.16 * (1 - 0.30) = 10 * 0.30 * 0.16 * 0.70 = 0.336 kg N
    n_load = calculate_nitrogen_load(10.0, 30.0, 0.30)
    assert n_load == 0.336

    # Zero feed
    assert calculate_nitrogen_load(0.0, 30.0, 0.30) == 0.0


def test_calculate_phosphorus_load():
    # 10 kg feed, 1.1% P, 25% retention -> 10 * 0.011 * 0.75 = 0.0825 kg P
    p_load = calculate_phosphorus_load(10.0, 1.1, 0.25)
    assert round(p_load, 4) == 0.0825
    assert calculate_phosphorus_load(0.0) == 0.0


def test_calculate_pollution_risk_score_bounds():
    # Optimal conditions: low N load, do_f=1.0, 0 leftovers
    score_low = calculate_pollution_risk_score(
        n_load_kg=0.2,
        area_ha=1.0,
        do_factor=1.0,
        leftover_pct=0.0,
    )
    assert 0.0 <= score_low <= 15.0

    # High stress conditions: high N load, DO crash (do_f=0.0), 30% leftovers
    score_high = calculate_pollution_risk_score(
        n_load_kg=4.0,
        area_ha=0.5,
        do_factor=0.0,
        leftover_pct=30.0,
    )
    assert 70.0 <= score_high <= 100.0


def test_calculate_savings_vs_baseline():
    # Tilapia Grower, actual 15 kg, baseline 20 kg -> 5 kg saved
    # At Rs 75/kg: 5 * 75 = Rs 375 saved
    res = calculate_savings_vs_baseline(
        actual_feed_kg=15.0,
        baseline_feed_kg=20.0,
        species="tilapia",
        avg_weight_g=200.0,
        area_ha=0.5,
        do_factor=0.8,
        cost_per_kg_inr=75.0,
    )
    assert res.feed_saved_kg == 5.0
    assert res.cost_saved_inr == 375.0
    assert res.nitrogen_avoided_kg > 0.0
    assert res.phosphorus_avoided_kg > 0.0
    assert 0.0 <= res.pollution_risk_score <= 100.0
