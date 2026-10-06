from datetime import date

from pydantic import BaseModel, Field, field_validator

SUPPORTED_CROPS = {"wheat", "soybean"}


class FarmAnalysisRequest(BaseModel):
    farm_name: str = Field(min_length=2, max_length=128)
    field_name: str = Field(min_length=2, max_length=128)
    location: str = Field(min_length=2, max_length=128)
    crop: str = Field(min_length=2, max_length=64)
    area_acres: float = Field(gt=0, le=10_000)
    sowing_date: date
    storage_days: int = Field(default=0, ge=0, le=365)

    @field_validator("crop")
    @classmethod
    def normalize_crop(cls, value: str) -> str:
        crop = value.strip().lower()
        if crop not in SUPPORTED_CROPS:
            raise ValueError(f"Supported crops: {', '.join(sorted(SUPPORTED_CROPS))}")
        return crop

    @field_validator("sowing_date")
    @classmethod
    def validate_sowing_date(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("Sowing date cannot be in the future")
        return value
