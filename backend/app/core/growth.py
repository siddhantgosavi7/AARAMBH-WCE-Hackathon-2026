"""
Biomass Estimation & Bioenergetic Growth Model.

Pure functions calculating active cohort biomass and daily weight increments
via Specific Growth Rate (SGR) degraded by water quality stress coefficients.
"""

import math
from app.core.species_profiles import get_stage_config, get_species_config


def calculate_biomass(fish_count: int, avg_weight_g: float, survival_rate: float) -> float:
    """
    Compute total active stock biomass in kilograms.
    biomass_kg = fish_count × avg_weight_g / 1000 × survival_rate
    """
    if fish_count <= 0 or avg_weight_g <= 0.0 or survival_rate <= 0.0:
        return 0.0
    # Clamping survival rate between 0.0 and 1.0
    clamped_survival = min(1.0, max(0.0, survival_rate))
    biomass = (fish_count * avg_weight_g / 1000.0) * clamped_survival
    return round(biomass, 2)


def calculate_sgr(initial_weight_g: float, final_weight_g: float, days: float) -> float:
    """
    Calculate empirical Specific Growth Rate (% weight gain / day).
    SGR = (ln(W_final) - ln(W_initial)) / days × 100
    """
    if initial_weight_g <= 0.0 or final_weight_g <= 0.0 or days <= 0.0:
        return 0.0
    return round(((math.log(final_weight_g) - math.log(initial_weight_g)) / days) * 100.0, 3)


def calculate_daily_weight_gain(
    current_weight_g: float,
    species: str,
    stress_factor: float = 1.0,
    days: float = 1.0
) -> float:
    """
    Predict weight at t + days based on stage SGR modulated by environmental stress.
    W(t+1) = W(t) × (1 + (SGR × stress_factor / 100))^days
    """
    if current_weight_g <= 0.0:
        return 0.0

    stage_cfg = get_stage_config(species, current_weight_g)
    clamped_stress = max(0.0, min(1.0, stress_factor))
    effective_sgr = stage_cfg.daily_sgr_pct * clamped_stress

    daily_multiplier = 1.0 + (effective_sgr / 100.0)
    future_weight = current_weight_g * (daily_multiplier ** days)
    return round(future_weight, 3)


def determine_stage_name(species: str, weight_g: float) -> str:
    """Get the string identifier of the growth stage for a given weight."""
    return get_stage_config(species, weight_g).name
