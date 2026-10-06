"""
Species and Growth Stage Bioenergetic Profiles.

All physiological thresholds, temperature tolerances, dissolved oxygen requirements,
and base dietary parameters live here as typed configurations with cited scientific assumptions.
NO MAGIC NUMBERS in computation logic.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass(frozen=True)
class ThermalProfile:
    min_lethal: float      # °C - Feeding drops to 0; severe hypothermic mortality risk
    opt_low: float         # °C - Lower bound of 100% feed efficiency plateau
    opt_high: float        # °C - Upper bound of 100% feed efficiency plateau
    max_lethal: float      # °C - Feeding drops to 0; severe hyperthermic mortality risk
    source: str = "FAO Aquaculture / Boyd (1998) Water Quality in Ponds"


@dataclass(frozen=True)
class DOProfile:
    critical_halt: float   # mg/L - Immediate feed suspension threshold (f_DO = 0)
    stress_threshold: float # mg/L - Start of linear feed reduction (f_DO = 1.0 at or above this)
    source: str = "Boyd & Tucker (2012) Pond Aquaculture Water Quality"


@dataclass(frozen=True)
class StageConfig:
    name: str              # fry, fingerling, juvenile, grower, finisher
    min_weight_g: float    # Inclusive lower weight bound
    max_weight_g: float    # Exclusive upper weight bound (float('inf') for finisher)
    base_feeding_rate_pct: float  # % body weight / day under optimum conditions
    crude_protein_pct: float      # Dietary crude protein content
    target_fcr: float             # Feed Conversion Ratio benchmark
    daily_sgr_pct: float          # Nominal Specific Growth Rate (% gain/day)
    default_meals_per_day: int    # Number of meals distributed across daylight hours
    max_daily_rate_pct: float     # Biological maximum feed cap


@dataclass(frozen=True)
class SpeciesConfig:
    common_name: str
    scientific_name: str
    thermal: ThermalProfile
    oxygen: DOProfile
    nitrogen_retention: float     # Fraction of dietary nitrogen assimilated into tissue
    stages: List[StageConfig]


# --- Configuration Matrix ---

SPECIES_REGISTRY: Dict[str, SpeciesConfig] = {
    "tilapia": SpeciesConfig(
        common_name="Nile Tilapia",
        scientific_name="Oreochromis niloticus",
        # Assumptions: Tropical cichlid with high thermal tolerance, low hypoxia tolerance below 3 mg/L
        thermal=ThermalProfile(
            min_lethal=12.0,
            opt_low=27.0,
            opt_high=31.0,
            max_lethal=38.0,
            source="FAO Fisheries Technical Paper 410 (Tilapia Culture)",
        ),
        oxygen=DOProfile(
            critical_halt=3.0,
            stress_threshold=5.0,
            source="Hargreaves & Kucuk (2001) DO dynamics in tilapia ponds",
        ),
        nitrogen_retention=0.30,  # ~30% assimilated, 70% excreted or wasted
        stages=[
            StageConfig(
                name="fry",
                min_weight_g=0.0,
                max_weight_g=1.0,
                base_feeding_rate_pct=15.0,
                crude_protein_pct=42.0,
                target_fcr=1.1,
                daily_sgr_pct=7.5,
                default_meals_per_day=6,
                max_daily_rate_pct=20.0,
            ),
            StageConfig(
                name="fingerling",
                min_weight_g=1.0,
                max_weight_g=20.0,
                base_feeding_rate_pct=8.0,
                crude_protein_pct=36.0,
                target_fcr=1.25,
                daily_sgr_pct=4.5,
                default_meals_per_day=4,
                max_daily_rate_pct=11.0,
            ),
            StageConfig(
                name="juvenile",
                min_weight_g=20.0,
                max_weight_g=100.0,
                base_feeding_rate_pct=4.5,
                crude_protein_pct=32.0,
                target_fcr=1.35,
                daily_sgr_pct=2.5,
                default_meals_per_day=3,
                max_daily_rate_pct=6.5,
            ),
            StageConfig(
                name="grower",
                min_weight_g=100.0,
                max_weight_g=400.0,
                base_feeding_rate_pct=2.5,
                crude_protein_pct=30.0,
                target_fcr=1.45,
                daily_sgr_pct=1.2,
                default_meals_per_day=2,
                max_daily_rate_pct=3.8,
            ),
            StageConfig(
                name="finisher",
                min_weight_g=400.0,
                max_weight_g=float("inf"),
                base_feeding_rate_pct=1.8,
                crude_protein_pct=28.0,
                target_fcr=1.60,
                daily_sgr_pct=0.8,
                default_meals_per_day=2,
                max_daily_rate_pct=2.8,
            ),
        ],
    ),
    "rohu": SpeciesConfig(
        common_name="Rohu / Indian Major Carp",
        scientific_name="Labeo rohita",
        # Assumptions: Subtropical carp, sensitive to extreme heat > 36°C, needs higher DO
        thermal=ThermalProfile(
            min_lethal=14.0,
            opt_low=26.0,
            opt_high=30.0,
            max_lethal=36.0,
            source="ICAR-CIFA Handbook of Freshwater Aquaculture (2018)",
        ),
        oxygen=DOProfile(
            critical_halt=3.2,
            stress_threshold=5.0,
            source="Das et al. (2005) Environmental stress in Indian Major Carps",
        ),
        nitrogen_retention=0.28,
        stages=[
            StageConfig(
                name="fry",
                min_weight_g=0.0,
                max_weight_g=1.0,
                base_feeding_rate_pct=12.0,
                crude_protein_pct=40.0,
                target_fcr=1.2,
                daily_sgr_pct=6.0,
                default_meals_per_day=6,
                max_daily_rate_pct=16.0,
            ),
            StageConfig(
                name="fingerling",
                min_weight_g=1.0,
                max_weight_g=25.0,
                base_feeding_rate_pct=6.5,
                crude_protein_pct=34.0,
                target_fcr=1.35,
                daily_sgr_pct=3.5,
                default_meals_per_day=4,
                max_daily_rate_pct=9.0,
            ),
            StageConfig(
                name="juvenile",
                min_weight_g=25.0,
                max_weight_g=150.0,
                base_feeding_rate_pct=3.5,
                crude_protein_pct=30.0,
                target_fcr=1.50,
                daily_sgr_pct=2.0,
                default_meals_per_day=3,
                max_daily_rate_pct=5.0,
            ),
            StageConfig(
                name="grower",
                min_weight_g=150.0,
                max_weight_g=600.0,
                base_feeding_rate_pct=2.2,
                crude_protein_pct=28.0,
                target_fcr=1.65,
                daily_sgr_pct=1.0,
                default_meals_per_day=2,
                max_daily_rate_pct=3.2,
            ),
            StageConfig(
                name="finisher",
                min_weight_g=600.0,
                max_weight_g=float("inf"),
                base_feeding_rate_pct=1.5,
                crude_protein_pct=26.0,
                target_fcr=1.80,
                daily_sgr_pct=0.6,
                default_meals_per_day=2,
                max_daily_rate_pct=2.4,
            ),
        ],
    ),
    "shrimp": SpeciesConfig(
        common_name="Pacific White Shrimp",
        scientific_name="Litopenaeus vannamei",
        # Assumptions: Benthic feeder, sensitive to low benthic DO, high protein requirement
        thermal=ThermalProfile(
            min_lethal=16.0,
            opt_low=28.0,
            opt_high=32.0,
            max_lethal=35.0,
            source="Wyban & Sweeney (1991) Intensive Shrimp Production Tech",
        ),
        oxygen=DOProfile(
            critical_halt=3.5,
            stress_threshold=5.0,
            source="Boyd (2003) Guidelines for Shrimp Pond Water Quality",
        ),
        nitrogen_retention=0.24,  # Crustaceans excrete higher ammonia fractions
        stages=[
            StageConfig(
                name="fry",  # Post-larvae (PL)
                min_weight_g=0.0,
                max_weight_g=0.5,
                base_feeding_rate_pct=18.0,
                crude_protein_pct=45.0,
                target_fcr=1.05,
                daily_sgr_pct=8.0,
                default_meals_per_day=6,
                max_daily_rate_pct=22.0,
            ),
            StageConfig(
                name="fingerling",  # Nursery / Early juvenile
                min_weight_g=0.5,
                max_weight_g=5.0,
                base_feeding_rate_pct=7.0,
                crude_protein_pct=38.0,
                target_fcr=1.20,
                daily_sgr_pct=4.0,
                default_meals_per_day=5,
                max_daily_rate_pct=9.5,
            ),
            StageConfig(
                name="juvenile",  # Sub-adult
                min_weight_g=5.0,
                max_weight_g=18.0,
                base_feeding_rate_pct=3.8,
                crude_protein_pct=36.0,
                target_fcr=1.35,
                daily_sgr_pct=2.0,
                default_meals_per_day=4,
                max_daily_rate_pct=5.5,
            ),
            StageConfig(
                name="grower",  # Adult harvest weight
                min_weight_g=18.0,
                max_weight_g=float("inf"),
                base_feeding_rate_pct=2.5,
                crude_protein_pct=35.0,
                target_fcr=1.45,
                daily_sgr_pct=1.2,
                default_meals_per_day=3,
                max_daily_rate_pct=3.8,
            ),
        ],
    ),
}


def get_species_config(species: str) -> SpeciesConfig:
    """Retrieve species configuration or raise an explicit ValueError."""
    key = species.lower().strip()
    if key in SPECIES_REGISTRY:
        return SPECIES_REGISTRY[key]
    # Check partial / alias match (e.g. carp -> rohu)
    if "carp" in key:
        return SPECIES_REGISTRY["rohu"]
    if "tilapia" in key:
        return SPECIES_REGISTRY["tilapia"]
    if "shrimp" in key or "vannamei" in key or "prawn" in key:
        return SPECIES_REGISTRY["shrimp"]
    raise ValueError(f"Unknown species '{species}'. Supported species: {list(SPECIES_REGISTRY.keys())}")


def get_stage_config(species: str, weight_g: float) -> StageConfig:
    """Find the specific lifecycle stage config corresponding to the body weight."""
    species_cfg = get_species_config(species)
    safe_weight = max(0.001, weight_g)

    for stage in species_cfg.stages:
        if stage.min_weight_g <= safe_weight < stage.max_weight_g:
            return stage

    # Fallback to the last stage (finisher/largest)
    return species_cfg.stages[-1]
