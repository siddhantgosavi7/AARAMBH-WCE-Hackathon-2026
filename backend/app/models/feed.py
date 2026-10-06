from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class FeedPlan(Base):
    __tablename__ = "feed_plans"

    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_date = Column(Date, nullable=False, default=date.today, index=True)
    stage = Column(String(30), nullable=False)
    biomass_kg = Column(Float, nullable=False)
    base_rate_pct = Column(Float, nullable=False)
    unadjusted_feed_kg = Column(Float, nullable=False)
    adjusted_daily_feed_kg = Column(Float, nullable=False)
    temp_factor = Column(Float, nullable=False)
    do_factor = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    pond = relationship("Pond", back_populates="feed_plans")
    meals = relationship("FeedMeal", back_populates="feed_plan", cascade="all, delete-orphan", order_by="FeedMeal.meal_number.asc()")


class FeedMeal(Base):
    __tablename__ = "feed_meals"

    id = Column(Integer, primary_key=True, index=True)
    feed_plan_id = Column(Integer, ForeignKey("feed_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_number = Column(Integer, nullable=False)
    scheduled_time = Column(String(10), nullable=False)  # HH:MM
    planned_feed_kg = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, completed, skipped
    why = Column(Text, nullable=False)

    # Relationships
    feed_plan = relationship("FeedPlan", back_populates="meals")
    logs = relationship("FeedLog", back_populates="meal")


class FeedLog(Base):
    __tablename__ = "feed_logs"

    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id", ondelete="CASCADE"), nullable=False, index=True)
    feed_meal_id = Column(Integer, ForeignKey("feed_meals.id", ondelete="SET NULL"), nullable=True)
    feed_given_kg = Column(Float, nullable=False)
    feed_response = Column(String(30), nullable=False)  # eaten_fully, normal, leftovers, refused
    leftover_pct = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    pond = relationship("Pond", back_populates="feed_logs")
    meal = relationship("FeedMeal", back_populates="logs")
