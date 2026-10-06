"""
Circadian Meal Scheduler Engine.

Pure deterministic functions for scheduling discrete meals across safe daylight windows,
avoiding nocturnal hypoxia and midday thermal stress, and adapting dynamically
to real-time water conditions and appetite feedback.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from datetime import datetime, time
from app.core.species_profiles import get_stage_config, get_species_config
from app.core.feed_calculator import calculate_temp_factor, calculate_do_factor


@dataclass(frozen=True)
class ScheduledMeal:
    meal_number: int
    scheduled_time: str   # "HH:MM"
    planned_feed_kg: float
    status: str           # "pending", "completed", "skipped"
    why: str


# Preset daylight windows mapped by meal counts to ensure safe limnological timing
TIMING_WINDOWS: Dict[int, List[str]] = {
    2: ["08:00", "16:30"],
    3: ["08:00", "12:30", "17:00"],
    4: ["07:30", "11:00", "14:30", "17:30"],
    5: ["07:00", "09:30", "12:00", "15:00", "17:30"],
    6: ["07:00", "09:00", "11:00", "13:30", "15:30", "17:30"],
    8: ["07:00", "08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30"],
}


def get_daylight_windows(meal_count: int) -> List[str]:
    """Retrieve optimal diurnal feeding timestamps for a given meal count."""
    if meal_count in TIMING_WINDOWS:
        return TIMING_WINDOWS[meal_count]
    if meal_count <= 2:
        return TIMING_WINDOWS[2]
    # Fallback interpolation between 07:00 and 18:00
    start_hour = 7.0
    end_hour = 17.5
    step = (end_hour - start_hour) / max(1, meal_count - 1)
    windows = []
    for i in range(meal_count):
        cur = start_hour + i * step
        h = int(cur)
        m = int(round((cur - h) * 60))
        windows.append(f"{h:02d}:{m:02d}")
    return windows


def evaluate_appetite_modifier(last_feed_response: Optional[str], last_leftover_pct: float = 0.0) -> float:
    """
    Compute appetite feedback multiplier for the subsequent meal.
    - If leftovers observed (> 15%): curtail next meal by 40% (multiplier = 0.60)
    - If moderate leftovers (5% - 15%): curtail next meal by 20% (multiplier = 0.80)
    - If completely refused: curtail by 70% (multiplier = 0.30)
    - If eaten eagerly / fully (< 3% leftovers): maintain or slight boost (multiplier = 1.05)
    - Default: 1.0
    """
    if not last_feed_response:
        return 1.0

    resp = last_feed_response.lower().strip()
    if resp == "refused" or last_leftover_pct >= 40.0:
        return 0.30
    if last_leftover_pct >= 15.0:
        return 0.60
    if 5.0 <= last_leftover_pct < 15.0:
        return 0.80
    if resp == "leftovers":
        return 0.60
    if resp == "eaten_fully" and last_leftover_pct <= 2.0:
        return 1.05

    return 1.0


def check_recent_crash_history(readings_24h: List[Dict[str, Any]], species: str) -> float:
    """
    Check if a DO crash or severe thermal spike occurred in the preceding 24 hours.
    Returns: Penalty modifier between 0.50 (severe crash) and 1.0 (no crash).
    """
    if not readings_24h:
        return 1.0

    cfg = get_species_config(species)
    critical_do = cfg.oxygen.critical_halt

    # Find minimum DO in past 24 hours
    min_do = min((r.get("dissolved_oxygen", 10.0) for r in readings_24h), default=10.0)

    if min_do < critical_do:
        # Severe crash occurred: reduce daily feeding by 40% (multiplier 0.60)
        return 0.60
    elif min_do < (critical_do + 0.5):
        # Near-crash episode: reduce daily feeding by 20% (multiplier 0.80)
        return 0.80

    return 1.0


def schedule_meals(
    daily_feed_kg: float,
    species: str,
    avg_weight_g: float,
    current_temp: float,
    current_do: float,
    appetite_multiplier: float = 1.0,
    recent_crash_multiplier: float = 1.0,
) -> List[ScheduledMeal]:
    """
    Partition the modulated daily feed ration into scheduled diurnal meals.
    Assigns situational rationales and applies safety statuses.
    """
    stage_cfg = get_stage_config(species, avg_weight_g)
    meal_count = stage_cfg.default_meals_per_day
    times = get_daylight_windows(meal_count)

    # Check immediate conditions for safety
    do_f = calculate_do_factor(current_do, species)
    temp_f = calculate_temp_factor(current_temp, species)

    is_lethal = (do_f == 0.0 or temp_f == 0.0 or daily_feed_kg <= 0.0)

    portion_kg = round(daily_feed_kg / max(1, meal_count), 3) if not is_lethal else 0.0

    meals: List[ScheduledMeal] = []
    for idx, t_str in enumerate(times, start=1):
        if is_lethal:
            status = "skipped"
            if do_f == 0.0:
                why = f"SKIPPED: Ambient DO ({current_do:.1f} mg/L) is below safe survival limit. Feeding suspended."
            elif temp_f == 0.0:
                why = f"SKIPPED: Thermal extreme ({current_temp:.1f}°C) is outside viable metabolic limits."
            else:
                why = "SKIPPED: Zero feed allowance allocated."
        else:
            status = "pending"
            # Build meal-specific rationale
            if idx == 1:
                why = f"Morning meal: Natural photosynthesis active, DO rising safely ({current_do:.1f} mg/L)."
            elif idx == meal_count:
                why = f"Evening meal: Final diurnal feeding before nocturnal respiration trough."
            elif "12:" in t_str or "13:" in t_str:
                if current_temp > 32.0:
                    why = f"Midday meal: Water is warm ({current_temp:.1f}°C); monitored closely."
                else:
                    why = "Midday meal: Optimal digestion temperature."
            else:
                why = f"Diurnal meal #{idx}: Fraction of daily modulated ration ({portion_kg:.2f} kg)."

        meals.append(ScheduledMeal(
            meal_number=idx,
            scheduled_time=t_str,
            planned_feed_kg=portion_kg,
            status=status,
            why=why,
        ))

    return meals
