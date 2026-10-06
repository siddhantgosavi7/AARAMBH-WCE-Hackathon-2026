#!/usr/bin/env python3
"""
AquaFeed Optimizer Database Seeding Script.
Seeds 3 realistic demo ponds representing distinct biological and limnological states:
  1. Pond Alpha: Healthy / Optimal Nile Tilapia (Temp: 28.5°C, DO: 5.8 mg/L, 100% feeding)
  2. Pond Beta: Heat Stressed Rohu Carp (Temp: 34.2°C, DO: 4.2 mg/L, feed throttled ~40%)
  3. Pond Gamma: Lethal DO Crash Shrimp (Temp: 29.0°C, DO: 2.4 mg/L, feed suspended 0kg, CRITICAL ALERT)
Also generates 24-hour historical time-series readings, alerts, and cumulative savings records.
"""

import sys
import os
import math
from datetime import datetime, date, timedelta

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import init_db, SessionLocal
from app.models.pond import Pond
from app.models.reading import Reading
from app.models.feed import FeedPlan, FeedMeal, FeedLog
from app.models.alert import Alert
from app.models.metric import DailyMetric


def seed_database():
    print("Initializing database tables...")
    init_db()
    session = SessionLocal()

    try:
        # Check if already seeded
        existing_ponds = session.query(Pond).count()
        if existing_ponds > 0:
            print(f"Database already contains {existing_ponds} ponds. Clearing existing demo records for a clean reset...")
            session.query(DailyMetric).delete()
            session.query(Alert).delete()
            session.query(FeedLog).delete()
            session.query(FeedMeal).delete()
            session.query(FeedPlan).delete()
            session.query(Reading).delete()
            session.query(Pond).delete()
            session.commit()

        print("Seeding 3 demo ponds...")
        now = datetime.utcnow()
        today = date.today()

        # 1. Pond Alpha: Healthy Tilapia
        pond1 = Pond(
            name="Pond Alpha (Optimal Tilapia)",
            species="tilapia",
            fish_count=5000,
            avg_weight_g=180.0,  # Grower stage (100g - 400g)
            area_ha=0.5,
            stocking_date=today - timedelta(days=45),
            survival_rate=0.92,
        )

        # 2. Pond Beta: Heat Wave Rohu
        pond2 = Pond(
            name="Pond Beta (Heat Stressed Rohu)",
            species="rohu",
            fish_count=4000,
            avg_weight_g=250.0,  # Grower stage (150g - 600g)
            area_ha=0.6,
            stocking_date=today - timedelta(days=60),
            survival_rate=0.88,
        )

        # 3. Pond Gamma: DO Crash Shrimp
        pond3 = Pond(
            name="Pond Gamma (DO Crash Shrimp)",
            species="shrimp",
            fish_count=25000,
            avg_weight_g=12.0,  # Grower stage (5g - 18g)
            area_ha=0.4,
            stocking_date=today - timedelta(days=35),
            survival_rate=0.85,
        )

        session.add_all([pond1, pond2, pond3])
        session.commit()
        session.refresh(pond1)
        session.refresh(pond2)
        session.refresh(pond3)

        print(f"Created ponds: {pond1.name} (ID: {pond1.id}), {pond2.name} (ID: {pond2.id}), {pond3.name} (ID: {pond3.id})")

        # Generate 24 hours of historical time-series readings for each pond
        print("Generating 24-hour diurnal water quality series...")
        readings = []

        # Pond 1: Healthy Diurnal Sine Wave (DO 5.2 - 6.8, Temp 27.5 - 29.5)
        for hours_ago in range(24, -1, -1):
            ts = now - timedelta(hours=hours_ago)
            hour_of_day = ts.hour
            # Diurnal solar cycle: peak DO at 15:00, trough at 05:00
            phase = (hour_of_day - 5) / 24.0 * 2.0 * math.pi
            do_val = round(5.5 + 1.2 * math.sin(phase), 2)
            temp_val = round(28.0 + 1.2 * math.sin((hour_of_day - 8) / 24.0 * 2.0 * math.pi), 1)
            # Latest reading for Pond 1
            if hours_ago == 0:
                do_val, temp_val = 5.8, 28.5

            readings.append(Reading(
                pond_id=pond1.id,
                temperature=temp_val,
                dissolved_oxygen=do_val,
                ph=7.6,
                ammonia=0.03,
                timestamp=ts,
            ))

        # Pond 2: Heat Stressed (Temp 32.5 - 35.0, DO 3.8 - 4.5)
        for hours_ago in range(24, -1, -1):
            ts = now - timedelta(hours=hours_ago)
            hour_of_day = ts.hour
            phase = (hour_of_day - 5) / 24.0 * 2.0 * math.pi
            do_val = round(4.2 + 0.6 * math.sin(phase), 2)
            temp_val = round(33.5 + 1.5 * math.sin((hour_of_day - 8) / 24.0 * 2.0 * math.pi), 1)
            if hours_ago == 0:
                do_val, temp_val = 4.2, 34.2

            readings.append(Reading(
                pond_id=pond2.id,
                temperature=temp_val,
                dissolved_oxygen=do_val,
                ph=8.1,
                ammonia=0.08,
                timestamp=ts,
            ))

        # Pond 3: Severe Nocturnal DO Crash (DO crashes below 3.0 down to 2.4 mg/L)
        for hours_ago in range(24, -1, -1):
            ts = now - timedelta(hours=hours_ago)
            hour_of_day = ts.hour
            if hours_ago <= 4:
                # Active crash in recent hours
                do_val = round(2.4 + 0.2 * (4 - hours_ago), 2)
            else:
                do_val = round(3.8 + 0.8 * math.sin((hour_of_day - 5) / 24.0 * 2.0 * math.pi), 2)
            temp_val = round(29.0 + 0.8 * math.sin((hour_of_day - 8) / 24.0 * 2.0 * math.pi), 1)
            if hours_ago == 0:
                do_val, temp_val = 2.4, 29.0

            readings.append(Reading(
                pond_id=pond3.id,
                temperature=temp_val,
                dissolved_oxygen=do_val,
                ph=7.3,
                ammonia=0.15,
                timestamp=ts,
            ))

        session.add_all(readings)
        session.commit()

        # Seed Feed Plans and Meals
        print("Seeding feed plans and scheduled meals...")
        # Pond 1 Plan
        plan1 = FeedPlan(
            pond_id=pond1.id,
            plan_date=today,
            stage="grower",
            biomass_kg=828.0,
            base_rate_pct=2.5,
            unadjusted_feed_kg=20.7,
            adjusted_daily_feed_kg=20.7,
            temp_factor=1.0,
            do_factor=1.0,
            explanation="Pond conditions are optimal (Temp: 28.5°C, DO: 5.8 mg/L). 100% nominal ration approved.",
        )
        session.add(plan1)
        session.commit()
        session.refresh(plan1)

        meal1_1 = FeedMeal(
            feed_plan_id=plan1.id,
            meal_number=1,
            scheduled_time="08:00",
            planned_feed_kg=10.35,
            status="completed",
            why="Morning feeding: DO robust after solar dawn.",
        )
        meal1_2 = FeedMeal(
            feed_plan_id=plan1.id,
            meal_number=2,
            scheduled_time="16:30",
            planned_feed_kg=10.35,
            status="pending",
            why="Late afternoon feeding: Peak thermal assimilation.",
        )
        session.add_all([meal1_1, meal1_2])

        # Feed log for completed morning meal
        log1 = FeedLog(
            pond_id=pond1.id,
            feed_meal_id=meal1_1.id,
            feed_given_kg=10.3,
            feed_response="eaten_fully",
            leftover_pct=1.5,
            notes="Active surface feeding observed.",
            logged_at=now - timedelta(hours=3),
        )
        session.add(log1)

        # Pond 2 Plan (Heat throttled)
        plan2 = FeedPlan(
            pond_id=pond2.id,
            plan_date=today,
            stage="grower",
            biomass_kg=880.0,
            base_rate_pct=2.2,
            unadjusted_feed_kg=19.36,
            adjusted_daily_feed_kg=11.62,
            temp_factor=0.60,
            do_factor=1.0,
            explanation="High water temperature (34.2°C) causes thermal stress. Ration reduced by 40% to prevent metabolic exhaustion.",
        )
        session.add(plan2)
        session.commit()
        session.refresh(plan2)

        meal2_1 = FeedMeal(
            feed_plan_id=plan2.id,
            meal_number=1,
            scheduled_time="07:30",
            planned_feed_kg=5.81,
            status="completed",
            why="Early morning cooler window before heat peak.",
        )
        meal2_2 = FeedMeal(
            feed_plan_id=plan2.id,
            meal_number=2,
            scheduled_time="17:30",
            planned_feed_kg=5.81,
            status="pending",
            why="Dusk window when temperature cools below 33°C.",
        )
        session.add_all([meal2_1, meal2_2])

        # Pond 3 Plan (DO Crash - ZERO FEEDING)
        plan3 = FeedPlan(
            pond_id=pond3.id,
            plan_date=today,
            stage="grower",
            biomass_kg=255.0,
            base_rate_pct=3.8,
            unadjusted_feed_kg=9.69,
            adjusted_daily_feed_kg=0.0,
            temp_factor=1.0,
            do_factor=0.0,
            explanation="CRITICAL HYPOXIA: DO is 2.4 mg/L (< 3.0 mg/L minimum). Feeding is 100% SUSPENDED to prevent suffocation.",
        )
        session.add(plan3)
        session.commit()
        session.refresh(plan3)

        meal3_1 = FeedMeal(
            feed_plan_id=plan3.id,
            meal_number=1,
            scheduled_time="08:00",
            planned_feed_kg=0.0,
            status="skipped",
            why="SKIPPED: Dissolved oxygen 2.4 mg/L is lethal for digestion.",
        )
        meal3_2 = FeedMeal(
            feed_plan_id=plan3.id,
            meal_number=2,
            scheduled_time="12:00",
            planned_feed_kg=0.0,
            status="skipped",
            why="SKIPPED: Awaiting mechanical aeration recovery.",
        )
        meal3_3 = FeedMeal(
            feed_plan_id=plan3.id,
            meal_number=3,
            scheduled_time="16:00",
            planned_feed_kg=0.0,
            status="skipped",
            why="SKIPPED: Feeding suspended pending re-oxygenation.",
        )
        session.add_all([meal3_1, meal3_2, meal3_3])

        # Alerts
        print("Seeding alerts...")
        alert1 = Alert(
            pond_id=pond2.id,
            severity="WARNING",
            alert_type="HEAT_STRESS",
            message="Water temperature reached 34.2°C (exceeds Rohu optimal 30.0°C). Feeding rate reduced by 40%.",
            is_resolved=False,
            created_at=now - timedelta(hours=2),
        )
        alert2 = Alert(
            pond_id=pond3.id,
            severity="CRITICAL",
            alert_type="LOW_DO_HYPOXIA",
            message="Lethal hypoxia detected! DO dropped to 2.4 mg/L. All feeding immediately halted; turn on aerators!",
            is_resolved=False,
            created_at=now - timedelta(minutes=45),
        )
        session.add_all([alert1, alert2])

        # Historical Daily Metrics (for Savings & ROI Reports)
        print("Seeding historical savings & pollution metrics...")
        for days_ago in range(14, 0, -1):
            m_date = today - timedelta(days=days_ago)
            # Pond 1: consistent mild optimization
            session.add(DailyMetric(
                pond_id=pond1.id,
                metric_date=m_date,
                feed_actual_kg=19.2,
                feed_baseline_kg=22.0,
                feed_saved_kg=2.8,
                cost_saved_inr=round(2.8 * 75.0, 2),
                nitrogen_load_kg=0.62,
                nitrogen_avoided_kg=0.09,
                pollution_risk_score=18.5,
            ))
            # Pond 2: heat wave savings
            session.add(DailyMetric(
                pond_id=pond2.id,
                metric_date=m_date,
                feed_actual_kg=12.4,
                feed_baseline_kg=20.5,
                feed_saved_kg=8.1,
                cost_saved_inr=round(8.1 * 75.0, 2),
                nitrogen_load_kg=0.48,
                nitrogen_avoided_kg=0.29,
                pollution_risk_score=28.0,
            ))
            # Pond 3: crash avoidance savings
            session.add(DailyMetric(
                pond_id=pond3.id,
                metric_date=m_date,
                feed_actual_kg=6.5,
                feed_baseline_kg=10.2,
                feed_saved_kg=3.7,
                cost_saved_inr=round(3.7 * 75.0, 2),
                nitrogen_load_kg=0.35,
                nitrogen_avoided_kg=0.15,
                pollution_risk_score=42.0,
            ))

        session.commit()
        print("Successfully seeded all demo data! Ready for demonstration.")

    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
