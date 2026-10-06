"""
Pollution Accounting & Environmental Savings Engine.

Pure deterministic functions calculating nutrient loads (Nitrogen and Phosphorus),
the 0–100 Pollution Risk Index, and economic/environmental dividends vs static feeding baselines.
"""

from dataclasses import dataclass
from typing import Dict, Any
from app.core.species_profiles import get_species_config, get_stage_config


@dataclass(frozen=True)
class NutrientMassBalance:
    nitrogen_load_kg: float
    phosphorus_load_kg: float
    nitrogen_avoided_kg: float
    phosphorus_avoided_kg: float


@dataclass(frozen=True)
class SavingsResult:
    feed_saved_kg: float
    cost_saved_inr: float
    nitrogen_avoided_kg: float
    phosphorus_avoided_kg: float
    pollution_risk_score: float


def calculate_nitrogen_load(
    feed_kg: float,
    crude_protein_pct: float,
    retention_fraction: float,
) -> float:
    """
    Calculate unassimilated nitrogen discharge in kilograms.
    N_load = feed_kg × (protein% / 100) × 0.16 × (1 - retention)
    - 0.16 represents the standard Kjeldahl nitrogen fraction in crude protein.
    """
    if feed_kg <= 0.0:
        return 0.0
    safe_protein = max(0.0, min(100.0, crude_protein_pct))
    safe_retention = max(0.0, min(1.0, retention_fraction))
    n_load = feed_kg * (safe_protein / 100.0) * 0.16 * (1.0 - safe_retention)
    return round(max(0.0, n_load), 4)


def calculate_phosphorus_load(
    feed_kg: float,
    dietary_phosphorus_pct: float = 1.1,
    retention_fraction: float = 0.25,
) -> float:
    """
    Calculate unassimilated phosphorus discharge in kilograms.
    P_load = feed_kg × (dietary_P% / 100) × (1 - retention)
    """
    if feed_kg <= 0.0:
        return 0.0
    p_load = feed_kg * (dietary_phosphorus_pct / 100.0) * (1.0 - retention_fraction)
    return round(max(0.0, p_load), 4)


def calculate_pollution_risk_score(
    n_load_kg: float,
    area_ha: float,
    do_factor: float,
    leftover_pct: float = 0.0,
) -> float:
    """
    Compute unified Pollution Risk Score on a 0–100 scale:
    - 40% based on areal nitrogen loading intensity (kg N / ha / day)
    - 40% based on respiratory hypoxia vulnerability (1 - do_factor)
    - 20% based on unconsumed uneaten feed sedimentation penalty
    """
    safe_area = max(0.01, area_ha)
    # Baseline benchmark: 2.0 kg N/ha/day is considered high load threshold
    n_intensity = n_load_kg / safe_area
    n_component = min(40.0, (n_intensity / 2.0) * 40.0)

    # Hypoxia component: low DO leaves water unable to oxidise organic matter
    hypoxia_component = (1.0 - max(0.0, min(1.0, do_factor))) * 40.0

    # Leftover waste component (0 to 20 points)
    leftover_component = min(20.0, (max(0.0, leftover_pct) / 25.0) * 20.0)

    score = n_component + hypoxia_component + leftover_component
    return round(min(100.0, max(0.0, score)), 1)


def calculate_savings_vs_baseline(
    actual_feed_kg: float,
    baseline_feed_kg: float,
    species: str,
    avg_weight_g: float,
    area_ha: float,
    do_factor: float,
    cost_per_kg_inr: float = 75.0,
    leftover_pct: float = 0.0,
) -> SavingsResult:
    """
    Calculate ecological and economic dividends compared to a rigid static feeding baseline.
    """
    feed_saved_kg = round(max(0.0, baseline_feed_kg - actual_feed_kg), 2)
    cost_saved_inr = round(feed_saved_kg * cost_per_kg_inr, 2)

    stage_cfg = get_stage_config(species, avg_weight_g)
    species_cfg = get_species_config(species)

    n_actual = calculate_nitrogen_load(actual_feed_kg, stage_cfg.crude_protein_pct, species_cfg.nitrogen_retention)
    n_baseline = calculate_nitrogen_load(baseline_feed_kg, stage_cfg.crude_protein_pct, species_cfg.nitrogen_retention)
    n_avoided = round(max(0.0, n_baseline - n_actual), 3)

    p_actual = calculate_phosphorus_load(actual_feed_kg)
    p_baseline = calculate_phosphorus_load(baseline_feed_kg)
    p_avoided = round(max(0.0, p_baseline - p_actual), 3)

    risk_score = calculate_pollution_risk_score(
        n_load_kg=n_actual,
        area_ha=area_ha,
        do_factor=do_factor,
        leftover_pct=leftover_pct,
    )

    return SavingsResult(
        feed_saved_kg=feed_saved_kg,
        cost_saved_inr=cost_saved_inr,
        nitrogen_avoided_kg=n_avoided,
        phosphorus_avoided_kg=p_avoided,
        pollution_risk_score=risk_score,
    )
