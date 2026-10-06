from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReadingBase(BaseModel):
    pond_id: int
    temperature: float = Field(..., ge=-5.0, le=55.0, description="Temperature in Celsius")
    dissolved_oxygen: float = Field(..., ge=0.0, le=25.0, description="Dissolved Oxygen in mg/L")
    ph: Optional[float] = Field(None, ge=0.0, le=14.0, description="pH level")
    ammonia: Optional[float] = Field(None, ge=0.0, le=50.0, description="Ammonia in mg/L")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ReadingCreate(ReadingBase):
    pass


class ReadingRead(ReadingBase):
    id: int

    class Config:
        from_attributes = True
