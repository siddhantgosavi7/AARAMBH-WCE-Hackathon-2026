from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class FactorsBreakdown(BaseModel):
    temp_celsius: float
    temp_factor: float
    do_mg_l: float
    do_factor: float
    recent_crash_penalty: float = 1.0
    hunger_feedback_factor: float = 1.0


class FeedMealRead(BaseModel):
    meal_number: int
    scheduled_time: str
    planned_feed_kg: float
    status: str  # pending, completed, skipped
    why: str

    class Config:
        from_attributes = True


class FeedPlanRead(BaseModel):
    pond_id: int
    pond_name: str
    species: str
    stage: str
    biomass_kg: float
    base_rate_pct: float
    unadjusted_feed_kg: float
    adjusted_daily_feed_kg: float
    factors: FactorsBreakdown
    explanation: str
    meals: List[FeedMealRead]
    plan_date: date = Field(default_factory=date.today)


class FeedLogCreate(BaseModel):
    pond_id: int
    meal_number: Optional[int] = None
    feed_given_kg: float = Field(..., ge=0.0)
    feed_response: str = Field(..., description="eaten_fully, normal, leftovers, or refused")
    leftover_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    notes: Optional[str] = None


class FeedLogRead(BaseModel):
    id: int
    pond_id: int
    feed_meal_id: Optional[int] = None
    feed_given_kg: float
    feed_response: str
    leftover_pct: float
    notes: Optional[str] = None
    logged_at: datetime

    class Config:
        from_attributes = True
