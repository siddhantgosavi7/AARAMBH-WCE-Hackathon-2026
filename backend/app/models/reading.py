from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id", ondelete="CASCADE"), nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    dissolved_oxygen = Column(Float, nullable=False)
    ph = Column(Float, nullable=True)
    ammonia = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    pond = relationship("Pond", back_populates="readings")
