"""
Unit tests for Environmental Factors (Temperature Bell Curve & DO Piecewise).
"""

import pytest
from app.core.feed_calculator import (
    calculate_temp_factor,
    calculate_do_factor,
)


# --- Temperature Bell Curve Tests ---

def test_tilapia_temp_optimal_plateau():
    # Tilapia optimal is 27.0 - 31.0 °C
    assert calculate_temp_factor(27.0, "tilapia") == 1.0
    assert calculate_temp_factor(29.0, "tilapia") == 1.0
    assert calculate_temp_factor(31.0, "tilapia") == 1.0


def test_tilapia_temp_lethal_cutoffs():
    # Min lethal: 12.0, Max lethal: 38.0
    assert calculate_temp_factor(12.0, "tilapia") == 0.0
    assert calculate_temp_factor(10.0, "tilapia") == 0.0
    assert calculate_temp_factor(38.0, "tilapia") == 0.0
    assert calculate_temp_factor(40.0, "tilapia") == 0.0


def test_tilapia_temp_suboptimal_smooth_transition():
    # Cool transition (12 to 27)
    factor_20 = calculate_temp_factor(20.0, "tilapia")
    assert 0.0 < factor_20 < 1.0

    # Warm transition (31 to 38)
    factor_35 = calculate_temp_factor(35.0, "tilapia")
    assert 0.0 < factor_35 < 1.0
    # Higher temperature should have lower appetite factor than closer to optimum
    factor_33 = calculate_temp_factor(33.0, "tilapia")
    assert factor_33 > factor_35


def test_rohu_thermal_limits():
    # Rohu optimal: 26 - 30; lethal: 14 and 36
    assert calculate_temp_factor(28.0, "rohu") == 1.0
    assert calculate_temp_factor(14.0, "rohu") == 0.0
    assert calculate_temp_factor(36.0, "rohu") == 0.0


def test_shrimp_thermal_limits():
    # Shrimp optimal: 28 - 32; lethal: 16 and 35
    assert calculate_temp_factor(30.0, "shrimp") == 1.0
    assert calculate_temp_factor(15.0, "shrimp") == 0.0
    assert calculate_temp_factor(35.5, "shrimp") == 0.0


# --- Dissolved Oxygen Modulator Tests ---

def test_do_factor_optimal():
    # Optimal threshold is 5.0 mg/L
    assert calculate_do_factor(5.0, "tilapia") == 1.0
    assert calculate_do_factor(6.5, "tilapia") == 1.0
    assert calculate_do_factor(8.0, "tilapia") == 1.0


def test_do_factor_lethal_halt():
    # Tilapia critical halt is 3.0 mg/L
    assert calculate_do_factor(2.99, "tilapia") == 0.0
    assert calculate_do_factor(2.0, "tilapia") == 0.0
    assert calculate_do_factor(0.0, "tilapia") == 0.0


def test_do_factor_linear_degradation():
    # Between 3.0 and 5.0 mg/L for tilapia:
    # At 4.0 mg/L: exactly halfway -> 0.5
    factor_mid = calculate_do_factor(4.0, "tilapia")
    assert factor_mid == 0.5

    # At 3.5 mg/L: (3.5 - 3.0) / 2.0 = 0.25
    factor_low = calculate_do_factor(3.5, "tilapia")
    assert factor_low == 0.25

    # At 4.5 mg/L: (4.5 - 3.0) / 2.0 = 0.75
    factor_high = calculate_do_factor(4.5, "tilapia")
    assert factor_high == 0.75


def test_shrimp_higher_do_threshold():
    # Shrimp critical is 3.5 mg/L
    assert calculate_do_factor(3.2, "shrimp") == 0.0
    assert calculate_do_factor(3.5, "shrimp") == 0.0
    assert calculate_do_factor(5.0, "shrimp") == 1.0
    # At 4.25 mg/L: (4.25 - 3.5) / 1.5 = 0.5
    assert calculate_do_factor(4.25, "shrimp") == 0.5
