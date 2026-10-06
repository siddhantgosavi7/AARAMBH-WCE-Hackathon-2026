from typing import List
from pydantic import BaseModel


class PondSavingsSummary(BaseModel):
    pond_id: int
    pond_name: str
    feed_saved_kg: float
    cost_saved_inr: float
    current_risk_score: float


class SavingsReportResponse(BaseModel):
    total_feed_saved_kg: float
    total_cost_saved_inr: float
    nitrogen_avoided_kg: float
    phosphorus_avoided_kg: float
    average_fcr: float
    baseline_fcr: float
    pollution_risk_score: float
    ponds_summary: List[PondSavingsSummary]
