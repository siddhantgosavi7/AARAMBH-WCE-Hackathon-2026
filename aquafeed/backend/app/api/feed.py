from datetime import date, datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.pond import Pond
from app.models.reading import Reading
from app.models.feed import FeedPlan, FeedMeal, FeedLog
from app.schemas.feed import (
    FeedPlanRead,
    FeedMealRead,
    FactorsBreakdown,
    FeedLogCreate,
    FeedLogRead,
)
from app.core.growth import calculate_biomass, get_stage_config
from app.core.feed_calculator import calculate_daily_feed
from app.core.scheduler import (
    schedule_meals,
    evaluate_appetite_modifier,
    check_recent_crash_history,
)

router = APIRouter(tags=["Feeding Engine"])


@router.get("/ponds/{pond_id}/feed-plan", response_model=FeedPlanRead)
def get_pond_feed_plan(
    pond_id: int,
    target_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail=f"Pond with ID {pond_id} not found")

    plan_date = target_date or date.today()

    # Get latest reading for immediate water conditions
    latest_reading = (
        db.query(Reading)
        .filter(Reading.pond_id == pond_id)
        .order_by(Reading.timestamp.desc())
        .first()
    )

    current_temp = latest_reading.temperature if latest_reading else 28.0
    current_do = latest_reading.dissolved_oxygen if latest_reading else 5.5

    # Get readings from past 24 hours to check for crash history
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    past_24h_readings = (
        db.query(Reading)
        .filter(Reading.pond_id == pond_id, Reading.timestamp >= twenty_four_hours_ago)
        .all()
    )
    readings_dict_list = [{"dissolved_oxygen": r.dissolved_oxygen} for r in past_24h_readings]
    crash_penalty = check_recent_crash_history(readings_dict_list, pond.species)

    # Get latest feed log to evaluate hunger feedback
    latest_log = (
        db.query(FeedLog)
        .filter(FeedLog.pond_id == pond_id)
        .order_by(FeedLog.logged_at.desc())
        .first()
    )
    hunger_factor = 1.0
    if latest_log:
        hunger_factor = evaluate_appetite_modifier(latest_log.feed_response, latest_log.leftover_pct)

    # Compute biomass
    biomass_kg = calculate_biomass(pond.fish_count, pond.avg_weight_g, pond.survival_rate)

    # Run pure feed calculation
    calc_res = calculate_daily_feed(
        biomass_kg=biomass_kg,
        species=pond.species,
        avg_weight_g=pond.avg_weight_g,
        temperature=current_temp,
        dissolved_oxygen=current_do,
        recent_crash_penalty=crash_penalty,
        hunger_feedback_factor=hunger_factor,
    )

    # Schedule discrete meals
    scheduled_meals = schedule_meals(
        daily_feed_kg=calc_res.adjusted_daily_feed_kg,
        species=pond.species,
        avg_weight_g=pond.avg_weight_g,
        current_temp=current_temp,
        current_do=current_do,
        appetite_multiplier=hunger_factor,
        recent_crash_multiplier=crash_penalty,
    )

    # Upsert FeedPlan record in database
    existing_plan = (
        db.query(FeedPlan)
        .filter(FeedPlan.pond_id == pond_id, FeedPlan.plan_date == plan_date)
        .first()
    )

    if not existing_plan:
        existing_plan = FeedPlan(
            pond_id=pond_id,
            plan_date=plan_date,
            stage=calc_res.stage,
            biomass_kg=calc_res.biomass_kg,
            base_rate_pct=calc_res.base_rate_pct,
            unadjusted_feed_kg=calc_res.unadjusted_feed_kg,
            adjusted_daily_feed_kg=calc_res.adjusted_daily_feed_kg,
            temp_factor=calc_res.temp_factor,
            do_factor=calc_res.do_factor,
            explanation=calc_res.explanation,
        )
        db.add(existing_plan)
        db.commit()
        db.refresh(existing_plan)

        for m in scheduled_meals:
            db_meal = FeedMeal(
                feed_plan_id=existing_plan.id,
                meal_number=m.meal_number,
                scheduled_time=m.scheduled_time,
                planned_feed_kg=m.planned_feed_kg,
                status=m.status,
                why=m.why,
            )
            db.add(db_meal)
        db.commit()
    else:
        # Update existing plan with fresh real-time calculations
        existing_plan.stage = calc_res.stage
        existing_plan.biomass_kg = calc_res.biomass_kg
        existing_plan.base_rate_pct = calc_res.base_rate_pct
        existing_plan.unadjusted_feed_kg = calc_res.unadjusted_feed_kg
        existing_plan.adjusted_daily_feed_kg = calc_res.adjusted_daily_feed_kg
        existing_plan.temp_factor = calc_res.temp_factor
        existing_plan.do_factor = calc_res.do_factor
        existing_plan.explanation = calc_res.explanation
        db.commit()

    meals_read = [
        FeedMealRead(
            meal_number=m.meal_number,
            scheduled_time=m.scheduled_time,
            planned_feed_kg=m.planned_feed_kg,
            status=m.status,
            why=m.why,
        )
        for m in scheduled_meals
    ]

    return FeedPlanRead(
        pond_id=pond.id,
        pond_name=pond.name,
        species=pond.species,
        stage=calc_res.stage,
        biomass_kg=calc_res.biomass_kg,
        base_rate_pct=calc_res.base_rate_pct,
        unadjusted_feed_kg=calc_res.unadjusted_feed_kg,
        adjusted_daily_feed_kg=calc_res.adjusted_daily_feed_kg,
        factors=FactorsBreakdown(
            temp_celsius=current_temp,
            temp_factor=calc_res.temp_factor,
            do_mg_l=current_do,
            do_factor=calc_res.do_factor,
            recent_crash_penalty=crash_penalty,
            hunger_feedback_factor=hunger_factor,
        ),
        explanation=calc_res.explanation,
        meals=meals_read,
        plan_date=plan_date,
    )


@router.post("/ponds/{pond_id}/feed-log", response_model=FeedLogRead, status_code=status.HTTP_201_CREATED)
def create_feed_log(
    pond_id: int,
    payload: FeedLogCreate,
    db: Session = Depends(get_db),
):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail=f"Pond with ID {pond_id} not found")

    feed_meal_id = None
    if payload.meal_number:
        # Match today's meal
        today = date.today()
        today_plan = (
            db.query(FeedPlan)
            .filter(FeedPlan.pond_id == pond_id, FeedPlan.plan_date == today)
            .first()
        )
        if today_plan:
            matching_meal = (
                db.query(FeedMeal)
                .filter(
                    FeedMeal.feed_plan_id == today_plan.id,
                    FeedMeal.meal_number == payload.meal_number,
                )
                .first()
            )
            if matching_meal:
                feed_meal_id = matching_meal.id
                matching_meal.status = "completed"

    feed_log = FeedLog(
        pond_id=pond_id,
        feed_meal_id=feed_meal_id,
        feed_given_kg=payload.feed_given_kg,
        feed_response=payload.feed_response.lower().strip(),
        leftover_pct=payload.leftover_pct,
        notes=payload.notes,
        logged_at=datetime.utcnow(),
    )
    db.add(feed_log)
    db.commit()
    db.refresh(feed_log)
    return feed_log
