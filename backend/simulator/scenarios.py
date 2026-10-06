"""
Limnological Environmental Scenarios for Sensor Simulation.

Defines the mathematical parameters (baseline, amplitude, phase shifts, anomalies)
for simulating realistic pond sensor dynamics across four distinct environmental states:
  1. normal: healthy diurnal photosynthesis/respiration cycle
  2. heat_wave: sustained high thermal load triggering thermal throttling
  3. algal_bloom: extreme supersaturation by day, severe night respiration drop
  4. do_crash: catastrophic nocturnal dissolved oxygen collapse (lethal hypoxia)
"""

from dataclasses import dataclass
from typing import Dict, Tuple
import math
import random


@dataclass(frozen=True)
class ScenarioParameters:
    name: str
    description: str
    temp_base: float      # Mean diurnal water temperature (°C)
    temp_amp: float       # Diurnal thermal swing amplitude (°C)
    do_base: float        # Mean diurnal dissolved oxygen (mg/L)
    do_amp: float         # Diurnal DO swing amplitude (mg/L)
    ph_base: float        # Baseline pH
    ammonia_base: float   # Baseline Total Ammonia Nitrogen (mg/L)
    noise_temp: float     # Gaussian noise standard deviation for temp
    noise_do: float       # Gaussian noise standard deviation for DO


SCENARIO_CONFIGS: Dict[str, ScenarioParameters] = {
    "normal": ScenarioParameters(
        name="normal",
        description="Balanced tropical pond with active phytoplankton photosynthesis and moderate respiration.",
        temp_base=28.2,
        temp_amp=1.4,
        do_base=5.8,
        do_amp=1.2,
        ph_base=7.6,
        ammonia_base=0.03,
        noise_temp=0.15,
        noise_do=0.18,
    ),
    "heat_wave": ScenarioParameters(
        name="heat_wave",
        description="Severe summer thermal wave with ambient heating pushing pond temperatures to 33–36°C.",
        temp_base=34.0,
        temp_amp=1.8,
        do_base=4.2,
        do_amp=0.7,
        ph_base=8.1,
        ammonia_base=0.08,
        noise_temp=0.2,
        noise_do=0.2,
    ),
    "algal_bloom": ScenarioParameters(
        name="algal_bloom",
        description="Eutrophic algal bloom: intense daytime DO supersaturation (>8 mg/L) collapsing at night to near-hypoxic troughs.",
        temp_base=29.5,
        temp_amp=1.5,
        do_base=5.2,
        do_amp=3.2,
        ph_base=8.6,
        ammonia_base=0.12,
        noise_temp=0.15,
        noise_do=0.35,
    ),
    "do_crash": ScenarioParameters(
        name="do_crash",
        description="Acute nocturnal DO collapse (overturned thermocline / bacterial die-off). DO collapses to lethal < 2.5 mg/L.",
        temp_base=29.0,
        temp_amp=1.0,
        do_base=2.4,
        do_amp=0.4,
        ph_base=7.2,
        ammonia_base=0.22,
        noise_temp=0.15,
        noise_do=0.15,
    ),
}


def generate_scenario_reading(scenario_name: str, hour_of_day: float) -> Tuple[float, float, float, float]:
    """
    Generate (temperature, dissolved_oxygen, ph, ammonia) for a given hour of day [0.0 - 24.0].
    Diurnal models:
      - Solar peak for temperature is around 14:00 (hour 14).
      - Photosynthetic DO peak is around 15:00 (hour 15), lowest at 05:00 (hour 5).
    """
    scen = SCENARIO_CONFIGS.get(scenario_name.lower().strip(), SCENARIO_CONFIGS["normal"])

    # DO sine wave: trough at 05:00, peak at 17:00
    do_phase = ((hour_of_day - 5.0) / 24.0) * 2.0 * math.pi
    do_clean = scen.do_base + scen.do_amp * math.sin(do_phase)
    do_val = round(max(0.2, do_clean + random.gauss(0, scen.noise_do)), 2)

    # Temperature sine wave: trough at 07:00, peak at 15:00
    temp_phase = ((hour_of_day - 7.0) / 24.0) * 2.0 * math.pi
    temp_clean = scen.temp_base + scen.temp_amp * math.sin(temp_phase)
    temp_val = round(max(5.0, temp_clean + random.gauss(0, scen.noise_temp)), 1)

    # pH slightly higher during peak photosynthesis (CO2 uptake)
    ph_val = round(scen.ph_base + 0.3 * math.sin(do_phase) + random.gauss(0, 0.05), 2)
    ammonia_val = round(max(0.01, scen.ammonia_base + random.gauss(0, 0.01)), 3)

    return (temp_val, do_val, ph_val, ammonia_val)
