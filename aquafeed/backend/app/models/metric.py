from datetime import date
from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class DailyMetric(Base):
    __tablename__ = "daily_metrics"

    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_date = Column(Date, nullable=False, default=date.today, index=True)
    feed_actual_kg = Column(Float, nullable=False, default=0.0)
    feed_baseline_kg = Column(Float, nullable=False, default=0.0)
    feed_saved_kg = Column(Float, nullable=False, default=0.0)
    cost_saved_inr = Column(Float, nullable=False, default=0.0)
    nitrogen_load_kg = Column(Float, nullable=False, default=0.0)
    nitrogen_avoided_kg = Column(Float, nullable=False, default=0.0)
    pollution_risk_score = Column(Float, nullable=False, default=0.0)

    # Relationships
    pond = relationship("Pond", back_populates="metrics")
