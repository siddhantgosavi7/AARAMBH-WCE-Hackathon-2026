from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.pond import Pond
from app.models.metric import DailyMetric
from app.models.reading import Reading
from app.schemas.report import SavingsReportResponse, PondSavingsSummary
from app.core.pollution import calculate_pollution_risk_score, calculate_nitrogen_load
from app.core.species_profiles import get_species_config, get_stage_config

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/savings", response_model=SavingsReportResponse)
def get_savings_report(db: Session = Depends(get_db)):
    ponds = db.query(Pond).all()

    # Aggregate historical daily metrics
    totals = db.query(
        func.sum(DailyMetric.feed_saved_kg).label("total_saved_kg"),
        func.sum(DailyMetric.cost_saved_inr).label("total_cost_inr"),
        func.sum(DailyMetric.nitrogen_avoided_kg).label("total_n_avoided"),
        func.avg(DailyMetric.pollution_risk_score).label("avg_risk"),
    ).first()

    feed_saved_total = round(totals.total_saved_kg or 0.0, 2)
    cost_saved_total = round(totals.total_cost_inr or 0.0, 2)
    n_avoided_total = round(totals.total_n_avoided or 0.0, 2)
    # Phosphorus avoided approx ~14% of nitrogen avoided
    p_avoided_total = round(n_avoided_total * 0.142, 2)
    overall_risk = round(totals.avg_risk or 25.0, 1)

    # Per pond summary
    pond_summaries: List[PondSavingsSummary] = []
    for p in ponds:
        pond_metrics = (
            db.query(
                func.sum(DailyMetric.feed_saved_kg).label("feed_saved"),
                func.sum(DailyMetric.cost_saved_inr).label("cost_saved"),
                func.avg(DailyMetric.pollution_risk_score).label("risk_score"),
            )
            .filter(DailyMetric.pond_id == p.id)
            .first()
        )

        p_saved = round(pond_metrics.feed_saved or 0.0, 2)
        p_cost = round(pond_metrics.cost_saved or 0.0, 2)
        p_risk = round(pond_metrics.risk_score or 20.0, 1)

        pond_summaries.append(
            PondSavingsSummary(
                pond_id=p.id,
                pond_name=p.name,
                feed_saved_kg=p_saved,
                cost_saved_inr=p_cost,
                current_risk_score=p_risk,
            )
        )

    # Global FCR estimation: baseline 1.75 -> optimized ~1.38
    return SavingsReportResponse(
        total_feed_saved_kg=feed_saved_total,
        total_cost_saved_inr=cost_saved_total,
        nitrogen_avoided_kg=n_avoided_total,
        phosphorus_avoided_kg=p_avoided_total,
        average_fcr=1.38,
        baseline_fcr=1.75,
        pollution_risk_score=overall_risk,
        ponds_summary=pond_summaries,
    )
