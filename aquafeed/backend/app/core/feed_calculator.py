"""
Feed Calculator Engine.

Pure deterministic bioenergetics functions:
- Smooth Bell-shaped Temperature factor f_T(T)
- Linear/Piecewise Dissolved Oxygen factor f_DO(DO)
- Daily ration computation with biological FCR caps
- Transparent explainability reasoning generation
"""

import math
from dataclasses import dataclass
from typing import Dict, Any
from app.core.species_profiles import get_species_config, get_stage_config


@dataclass(frozen=True)
class FeedCalculationResult:
    species: str
    stage: str
    biomass_kg: float
    base_rate_pct: float
    unadjusted_feed_kg: float
    adjusted_daily_feed_kg: float
    temp_factor: float
    do_factor: float
    recent_crash_penalty: float
    hunger_feedback_factor: float
    explanation: str


def calculate_temp_factor(temp_celsius: float, species: str) -> float:
    """
    Calculate thermal feeding modulator f_T(T) using a smooth bell curve.
    Returns: float in range [0.0, 1.0].
    """
    cfg = get_species_config(species).thermal

    # Lethal bounds: 0 feed
    if temp_celsius <= cfg.min_lethal or temp_celsius >= cfg.max_lethal:
        return 0.0

    # Optimal range plateau: 100% feed
    if cfg.opt_low <= temp_celsius <= cfg.opt_high:
        return 1.0

    # Sub-optimal warm taper: opt_high < T < max_lethal
    if temp_celsius > cfg.opt_high:
        span = cfg.max_lethal - cfg.opt_high
        ratio = (temp_celsius - cfg.opt_high) / span
        # Smooth cosine taper from 1.0 to 0.0
        val = math.cos(0.5 * math.pi * ratio) ** 2
        return round(max(0.0, min(1.0, val)), 3)

    # Sub-optimal cool taper: min_lethal < T < opt_low
    span = cfg.opt_low - cfg.min_lethal
    ratio = (cfg.opt_low - temp_celsius) / span
    val = math.cos(0.5 * math.pi * ratio) ** 2
    return round(max(0.0, min(1.0, val)), 3)


def calculate_do_factor(do_mg_l: float, species: str) -> float:
    """
    Calculate dissolved oxygen feeding modulator f_DO(DO).
    Returns: float in range [0.0, 1.0].
    - At or above stress_threshold (e.g. 5.0 mg/L) -> 1.0
    - Between critical_halt and stress_threshold -> linear reduction
    - Below critical_halt (e.g. 3.0 mg/L) -> 0.0 (STOP FEEDING)
    """
    cfg = get_species_config(species).oxygen

    if do_mg_l < cfg.critical_halt:
        return 0.0

    if do_mg_l >= cfg.stress_threshold:
        return 1.0

    # Linear interpolation between critical_halt and stress_threshold
    slope = 1.0 / (cfg.stress_threshold - cfg.critical_halt)
    factor = (do_mg_l - cfg.critical_halt) * slope
    return round(max(0.0, min(1.0, factor)), 3)


def build_explanation(
    species: str,
    temp_celsius: float,
    temp_f: float,
    do_mg_l: float,
    do_f: float,
    crash_penalty: float,
    hunger_factor: float,
) -> str:
    """Generate transparent, human-readable explainability text."""
    species_cfg = get_species_config(species)
    reasons = []

    # 1. Hypoxia assessment
    if do_f == 0.0:
        return (
            f"CRITICAL HYPOXIA ALERT: Dissolved oxygen is {do_mg_l:.1f} mg/L, falling below the safe threshold of "
            f"{species_cfg.oxygen.critical_halt:.1f} mg/L. All feeding is suspended immediately to prevent suffocation "
            f"and toxic ammonia spikes."
        )
    elif do_f < 1.0:
        pct_cut = round((1.0 - do_f) * 100)
        reasons.append(
            f"Low DO ({do_mg_l:.1f} mg/L vs optimal {species_cfg.oxygen.stress_threshold:.1f} mg/L) reduces intake by {pct_cut}%"
        )

    # 2. Temperature assessment
    if temp_f == 0.0:
        return (
            f"LETHAL THERMAL EXTREME: Water temperature is {temp_celsius:.1f}°C, beyond the biological survival envelope "
            f"({species_cfg.thermal.min_lethal}°C – {species_cfg.thermal.max_lethal}°C). Feeding is suspended."
        )
    elif temp_f < 1.0:
        pct_cut = round((1.0 - temp_f) * 100)
        if temp_celsius > species_cfg.thermal.opt_high:
            reasons.append(
                f"Elevated temperature ({temp_celsius:.1f}°C > optimal {species_cfg.thermal.opt_high:.1f}°C) reduces appetite by {pct_cut}%"
            )
        else:
            reasons.append(
                f"Low temperature ({temp_celsius:.1f}°C < optimal {species_cfg.thermal.opt_low:.1f}°C) slows digestion rate by {pct_cut}%"
            )

    # 3. Post-crash or hunger adjustments
    if crash_penalty < 1.0:
        pct_cut = round((1.0 - crash_penalty) * 100)
        reasons.append(f"Recent hypoxia recovery penalty applied (-{pct_cut}%)")

    if hunger_factor < 1.0:
        pct_cut = round((1.0 - hunger_factor) * 100)
        reasons.append(f"Unconsumed leftovers from prior meal curtailed ration (-{pct_cut}%)")
    elif hunger_factor > 1.0:
        pct_boost = round((hunger_factor - 1.0) * 100)
        reasons.append(f"Vigorous appetite observed (+{pct_boost}%)")

    if not reasons:
        return (
            f"Optimal environmental conditions (Temp: {temp_celsius:.1f}°C, DO: {do_mg_l:.1f} mg/L). "
            f"Full 100% nominal feeding allowance allocated."
        )

    return " | ".join(reasons) + "."


def calculate_daily_feed(
    biomass_kg: float,
    species: str,
    avg_weight_g: float,
    temperature: float,
    dissolved_oxygen: float,
    recent_crash_penalty: float = 1.0,
    hunger_feedback_factor: float = 1.0,
) -> FeedCalculationResult:
    """
    Calculate the exact adjusted daily feed allowance (in kg) along with explainability factors.
    """
    if biomass_kg <= 0.0 or avg_weight_g <= 0.0:
        return FeedCalculationResult(
            species=species,
            stage="unknown",
            biomass_kg=0.0,
            base_rate_pct=0.0,
            unadjusted_feed_kg=0.0,
            adjusted_daily_feed_kg=0.0,
            temp_factor=0.0,
            do_factor=0.0,
            recent_crash_penalty=1.0,
            hunger_feedback_factor=1.0,
            explanation="Zero active biomass or weight recorded.",
        )

    stage_cfg = get_stage_config(species, avg_weight_g)
    base_rate = stage_cfg.base_feeding_rate_pct

    # Unadjusted nominal baseline feed (kg)
    unadjusted_feed_kg = round(biomass_kg * (base_rate / 100.0), 3)

    # Modulator factors
    temp_factor = calculate_temp_factor(temperature, species)
    do_factor = calculate_do_factor(dissolved_oxygen, species)

    combined_factor = temp_factor * do_factor * recent_crash_penalty * hunger_feedback_factor

    # If DO is critical or temp is lethal, feed is strictly 0.0
    if do_factor == 0.0 or temp_factor == 0.0:
        adjusted_feed_kg = 0.0
    else:
        raw_feed_kg = unadjusted_feed_kg * combined_factor
        # Cap by maximum daily biological rate
        max_feed_kg = biomass_kg * (stage_cfg.max_daily_rate_pct / 100.0)
        adjusted_feed_kg = min(raw_feed_kg, max_feed_kg)

    adjusted_feed_kg = round(max(0.0, adjusted_feed_kg), 3)

    explanation = build_explanation(
        species=species,
        temp_celsius=temperature,
        temp_f=temp_factor,
        do_mg_l=dissolved_oxygen,
        do_f=do_factor,
        crash_penalty=recent_crash_penalty,
        hunger_factor=hunger_feedback_factor,
    )

    return FeedCalculationResult(
        species=species,
        stage=stage_cfg.name,
        biomass_kg=biomass_kg,
        base_rate_pct=base_rate,
        unadjusted_feed_kg=unadjusted_feed_kg,
        adjusted_daily_feed_kg=adjusted_feed_kg,
        temp_factor=temp_factor,
        do_factor=do_factor,
        recent_crash_penalty=recent_crash_penalty,
        hunger_feedback_factor=hunger_feedback_factor,
        explanation=explanation,
    )
