from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base


class Pond(Base):
    __tablename__ = "ponds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    species = Column(String(50), nullable=False)  # 'tilapia', 'rohu', 'shrimp'
    fish_count = Column(Integer, nullable=False)
    avg_weight_g = Column(Float, nullable=False)
    area_ha = Column(Float, nullable=False)
    stocking_date = Column(Date, nullable=False, default=date.today)
    survival_rate = Column(Float, nullable=False, default=0.90)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    readings = relationship("Reading", back_populates="pond", cascade="all, delete-orphan", order_by="Reading.timestamp.desc()")
    feed_plans = relationship("FeedPlan", back_populates="pond", cascade="all, delete-orphan")
    feed_logs = relationship("FeedLog", back_populates="pond", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="pond", cascade="all, delete-orphan", order_by="Alert.created_at.desc()")
    metrics = relationship("DailyMetric", back_populates="pond", cascade="all, delete-orphan")
