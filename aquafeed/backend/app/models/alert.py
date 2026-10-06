from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id", ondelete="CASCADE"), nullable=False, index=True)
    severity = Column(String(20), nullable=False)  # INFO, WARNING, CRITICAL
    alert_type = Column(String(50), nullable=False)  # LOW_DO_HYPOXIA, HEAT_STRESS, COLD_STRESS, HIGH_POLLUTION_RISK, FEEDING_SUSPENDED
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    pond = relationship("Pond", back_populates="alerts")
