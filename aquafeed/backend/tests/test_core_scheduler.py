"""
Unit tests for Circadian Meal Scheduler.
"""

from app.core.scheduler import (
    get_daylight_windows,
    evaluate_appetite_modifier,
    check_recent_crash_history,
    schedule_meals,
)


def test_get_daylight_windows():
    w2 = get_daylight_windows(2)
    assert len(w2) == 2
    assert "08:00" in w2

    w6 = get_daylight_windows(6)
    assert len(w6) == 6
    assert w6[0] == "07:00"
    assert w6[-1] == "17:30"


def test_evaluate_appetite_modifier():
    # Eaten fully with minimal leftovers -> slight boost
    assert evaluate_appetite_modifier("eaten_fully", 1.0) == 1.05

    # Moderate leftovers -> 20% cut
    assert evaluate_appetite_modifier("leftovers", 10.0) == 0.80

    # Significant leftovers (>15%) -> 40% cut
    assert evaluate_appetite_modifier("leftovers", 25.0) == 0.60

    # Completely refused -> 70% cut
    assert evaluate_appetite_modifier("refused", 80.0) == 0.30

    # None / neutral
    assert evaluate_appetite_modifier(None) == 1.0


def test_check_recent_crash_history():
    # Healthy readings
    readings_healthy = [
        {"dissolved_oxygen": 5.5},
        {"dissolved_oxygen": 6.2},
        {"dissolved_oxygen": 4.8},
    ]
    assert check_recent_crash_history(readings_healthy, "tilapia") == 1.0

    # Reading with severe DO crash (< 3.0 for tilapia)
    readings_crash = [
        {"dissolved_oxygen": 5.5},
        {"dissolved_oxygen": 2.3},
        {"dissolved_oxygen": 4.1},
    ]
    assert check_recent_crash_history(readings_crash, "tilapia") == 0.60

    # Near crash (between 3.0 and 3.5)
    readings_near = [
        {"dissolved_oxygen": 5.0},
        {"dissolved_oxygen": 3.3},
    ]
    assert check_recent_crash_history(readings_near, "tilapia") == 0.80


def test_schedule_meals_fry_vs_grower():
    # Fry Tilapia (0.5g) should receive 6 meals
    meals_fry = schedule_meals(
        daily_feed_kg=12.0,
        species="tilapia",
        avg_weight_g=0.5,
        current_temp=28.5,
        current_do=6.0,
    )
    assert len(meals_fry) == 6
    assert all(m.status == "pending" for m in meals_fry)
    assert sum(m.planned_feed_kg for m in meals_fry) == 12.0

    # Grower Tilapia (200g) should receive 2 meals
    meals_grower = schedule_meals(
        daily_feed_kg=20.0,
        species="tilapia",
        avg_weight_g=200.0,
        current_temp=28.5,
        current_do=6.0,
    )
    assert len(meals_grower) == 2
    assert meals_grower[0].scheduled_time == "08:00"
    assert meals_grower[1].scheduled_time == "16:30"
    assert sum(m.planned_feed_kg for m in meals_grower) == 20.0


def test_schedule_meals_under_lethal_conditions_skipped():
    # When DO is 2.2 mg/L, all meals must be marked 'skipped' and feed 0.0
    meals_hypoxia = schedule_meals(
        daily_feed_kg=0.0,
        species="tilapia",
        avg_weight_g=200.0,
        current_temp=28.5,
        current_do=2.2,
    )
    assert len(meals_hypoxia) == 2
    assert all(m.status == "skipped" for m in meals_hypoxia)
    assert all(m.planned_feed_kg == 0.0 for m in meals_hypoxia)
    assert "Ambient DO" in meals_hypoxia[0].why
