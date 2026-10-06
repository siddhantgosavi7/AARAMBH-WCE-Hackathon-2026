from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class PondBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: str = Field(..., description="Species: tilapia, rohu, or shrimp")
    fish_count: int = Field(..., gt=0)
    avg_weight_g: float = Field(..., gt=0.0)
    area_ha: float = Field(..., gt=0.0)
    stocking_date: date = Field(default_factory=date.today)
    survival_rate: float = Field(default=0.90, ge=0.0, le=1.0)


class PondCreate(PondBase):
    pass


class PondUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    fish_count: Optional[int] = Field(None, gt=0)
    avg_weight_g: Optional[float] = Field(None, gt=0.0)
    area_ha: Optional[float] = Field(None, gt=0.0)
    survival_rate: Optional[float] = Field(None, ge=0.0, le=1.0)


class PondRead(PondBase):
    id: int
    current_stage: str
    biomass_kg: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
