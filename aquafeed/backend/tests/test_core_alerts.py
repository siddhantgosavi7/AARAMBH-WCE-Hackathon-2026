"""
Unit tests for Alert Rules Engine.
"""

from app.core.alerts import (
    evaluate_reading_alerts,
    evaluate_risk_alerts,
)


def test_evaluate_reading_alerts_critical_do_crash():
    # DO 2.1 mg/L < 3.0 mg/L for Tilapia
    alerts = evaluate_reading_alerts("tilapia", 28.0, 2.1)
    critical_alerts = [a for a in alerts if a.severity == "CRITICAL" and a.alert_type == "LOW_DO_HYPOXIA"]
    assert len(critical_alerts) == 1
    assert "Lethal hypoxia detected" in critical_alerts[0].message


def test_evaluate_reading_alerts_warning_do():
    # DO 4.2 mg/L (between 3.0 and 5.0)
    alerts = evaluate_reading_alerts("tilapia", 28.0, 4.2)
    warning_alerts = [a for a in alerts if a.severity == "WARNING" and a.alert_type == "LOW_DO_HYPOXIA"]
    assert len(warning_alerts) == 1


def test_evaluate_reading_alerts_heat_stress():
    # Temp 35.0°C for Tilapia (> 31.0 opt_high, < 38.0 max_lethal)
    alerts = evaluate_reading_alerts("tilapia", 35.0, 5.5)
    heat_warnings = [a for a in alerts if a.severity == "WARNING" and a.alert_type == "HEAT_STRESS"]
    assert len(heat_warnings) == 1

    # Lethal temperature >= 38.0
    alerts_lethal = evaluate_reading_alerts("tilapia", 38.5, 5.5)
    heat_crit = [a for a in alerts_lethal if a.severity == "CRITICAL" and a.alert_type == "HEAT_STRESS"]
    assert len(heat_crit) == 1


def test_evaluate_reading_alerts_cold_stress():
    # Temp 10.0°C for Tilapia (<= 12.0 min_lethal)
    alerts = evaluate_reading_alerts("tilapia", 10.0, 6.0)
    cold_crit = [a for a in alerts if a.severity == "CRITICAL" and a.alert_type == "COLD_STRESS"]
    assert len(cold_crit) == 1


def test_evaluate_risk_alerts():
    # High pollution risk score
    alerts_poll = evaluate_risk_alerts(75.0, 10.0, 15.0)
    poll_crit = [a for a in alerts_poll if a.severity == "CRITICAL" and a.alert_type == "HIGH_POLLUTION_RISK"]
    assert len(poll_crit) == 1

    # Feeding suspended alert
    alerts_susp = evaluate_risk_alerts(30.0, adjusted_feed_kg=0.0, unadjusted_feed_kg=15.0)
    susp_crit = [a for a in alerts_susp if a.severity == "CRITICAL" and a.alert_type == "FEEDING_SUSPENDED"]
    assert len(susp_crit) == 1
