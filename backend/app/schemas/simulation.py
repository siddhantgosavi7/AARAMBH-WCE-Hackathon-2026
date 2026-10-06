from typing import Optional
from pydantic import BaseModel, Field


class SimulationStartRequest(BaseModel):
    scenario: str = Field(default="normal", description="normal, heat_wave, algal_bloom, do_crash")
    tick_interval_seconds: int = Field(default=5, ge=1, le=60)
    speed_multiplier: int = Field(default=60, ge=1, le=3600)


class SimulationStatusResponse(BaseModel):
    is_running: bool
    current_scenario: Optional[str] = None
    tick_interval_seconds: int
    last_tick_at: Optional[str] = None
    readings_generated: int = 0
