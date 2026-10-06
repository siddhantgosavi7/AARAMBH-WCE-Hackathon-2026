"""
Alert Rules & Evaluation Engine.

Pure deterministic functions evaluating biological, thermal, and chemical telemetry
against species-specific risk envelopes and issuing categorized severity alerts.
"""

from dataclasses import dataclass
from typing import List
from app.core.species_profiles import get_species_config


@dataclass(frozen=True)
class AlertEvaluation:
    severity: str    # "INFO", "WARNING", "CRITICAL"
    alert_type: str  # "LOW_DO_HYPOXIA", "HEAT_STRESS", "COLD_STRESS", "HIGH_POLLUTION_RISK", "FEEDING_SUSPENDED"
    message: str


def evaluate_reading_alerts(
    species: str,
    temperature: float,
    dissolved_oxygen: float,
) -> List[AlertEvaluation]:
    """
    Evaluate immediate sensor telemetry for thermal and dissolved oxygen safety.
    """
    cfg = get_species_config(species)
    alerts: List[AlertEvaluation] = []

    # 1. Dissolved Oxygen Checks
    if dissolved_oxygen < cfg.oxygen.critical_halt:
        alerts.append(AlertEvaluation(
            severity="CRITICAL",
            alert_type="LOW_DO_HYPOXIA",
            message=(
                f"Lethal hypoxia detected! Dissolved oxygen dropped to {dissolved_oxygen:.1f} mg/L "
                f"(below species critical limit of {cfg.oxygen.critical_halt:.1f} mg/L). "
                f"Feeding immediately suspended. Start emergency aerators!"
            ),
        ))
    elif dissolved_oxygen < cfg.oxygen.stress_threshold:
        alerts.append(AlertEvaluation(
            severity="WARNING",
            alert_type="LOW_DO_HYPOXIA",
            message=(
                f"Depressed dissolved oxygen ({dissolved_oxygen:.1f} mg/L < {cfg.oxygen.stress_threshold:.1f} mg/L). "
                f"Feeding rate curtailed to prevent oxygen debt."
            ),
        ))

    # 2. Temperature Checks
    if temperature >= cfg.thermal.max_lethal:
        alerts.append(AlertEvaluation(
            severity="CRITICAL",
            alert_type="HEAT_STRESS",
            message=(
                f"Lethal water temperature ({temperature:.1f}°C >= max {cfg.thermal.max_lethal:.1f}°C). "
                f"Feeding suspended to prevent severe mortality."
            ),
        ))
    elif temperature > cfg.thermal.opt_high:
        alerts.append(AlertEvaluation(
            severity="WARNING",
            alert_type="HEAT_STRESS",
            message=(
                f"Elevated water temperature ({temperature:.1f}°C > optimal {cfg.thermal.opt_high:.1f}°C). "
                f"Feeding reduced to minimize metabolic heat load."
            ),
        ))
    elif temperature <= cfg.thermal.min_lethal:
        alerts.append(AlertEvaluation(
            severity="CRITICAL",
            alert_type="COLD_STRESS",
            message=(
                f"Critical cold stress ({temperature:.1f}°C <= min {cfg.thermal.min_lethal:.1f}°C). "
                f"Digestive enzymes dormant; feeding ceased."
            ),
        ))
    elif temperature < cfg.thermal.opt_low:
        alerts.append(AlertEvaluation(
            severity="WARNING",
            alert_type="COLD_STRESS",
            message=(
                f"Low water temperature ({temperature:.1f}°C < optimal {cfg.thermal.opt_low:.1f}°C). "
                f"Digestion slowed; feeding ration reduced."
            ),
        ))

    return alerts


def evaluate_risk_alerts(
    pollution_risk_score: float,
    adjusted_feed_kg: float,
    unadjusted_feed_kg: float,
) -> List[AlertEvaluation]:
    """
    Evaluate system-level operational risks (eutrophication score, feeding suspension).
    """
    alerts: List[AlertEvaluation] = []

    if pollution_risk_score >= 70.0:
        alerts.append(AlertEvaluation(
            severity="CRITICAL",
            alert_type="HIGH_POLLUTION_RISK",
            message=(
                f"Severe pollution index ({pollution_risk_score:.1f}/100). High organic loading "
                f"and low oxygen saturation create imminent eutrophication risk."
            ),
        ))
    elif pollution_risk_score >= 45.0:
        alerts.append(AlertEvaluation(
            severity="WARNING",
            alert_type="HIGH_POLLUTION_RISK",
            message=(
                f"Elevated pollution risk ({pollution_risk_score:.1f}/100). Monitor ammonia and organic sediment."
            ),
        ))

    if unadjusted_feed_kg > 0.0 and adjusted_feed_kg == 0.0:
        alerts.append(AlertEvaluation(
            severity="CRITICAL",
            alert_type="FEEDING_SUSPENDED",
            message="Daily feeding suspended (0.0 kg ration) due to environmental stress thresholds.",
        ))

    return alerts
