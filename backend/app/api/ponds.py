from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.pond import Pond
from app.schemas.pond import PondCreate, PondRead, PondUpdate
from app.core.growth import calculate_biomass, determine_stage_name

router = APIRouter(prefix="/ponds", tags=["Ponds"])


def enrich_pond_read(p: Pond) -> PondRead:
    stage = determine_stage_name(p.species, p.avg_weight_g)
    biomass = calculate_biomass(p.fish_count, p.avg_weight_g, p.survival_rate)
    return PondRead(
        id=p.id,
        name=p.name,
        species=p.species,
        fish_count=p.fish_count,
        avg_weight_g=p.avg_weight_g,
        area_ha=p.area_ha,
        stocking_date=p.stocking_date,
        survival_rate=p.survival_rate,
        current_stage=stage,
        biomass_kg=biomass,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@router.get("", response_model=List[PondRead])
def list_ponds(db: Session = Depends(get_db)):
    ponds = db.query(Pond).order_by(Pond.id.asc()).all()
    return [enrich_pond_read(p) for p in ponds]


@router.post("", response_model=PondRead, status_code=status.HTTP_201_CREATED)
def create_pond(payload: PondCreate, db: Session = Depends(get_db)):
    pond = Pond(
        name=payload.name,
        species=payload.species.lower().strip(),
        fish_count=payload.fish_count,
        avg_weight_g=payload.avg_weight_g,
        area_ha=payload.area_ha,
        stocking_date=payload.stocking_date,
        survival_rate=payload.survival_rate,
    )
    db.add(pond)
    db.commit()
    db.refresh(pond)
    return enrich_pond_read(pond)


@router.get("/{pond_id}", response_model=PondRead)
def get_pond(pond_id: int, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail=f"Pond with ID {pond_id} not found")
    return enrich_pond_read(pond)


@router.put("/{pond_id}", response_model=PondRead)
def update_pond(pond_id: int, payload: PondUpdate, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail=f"Pond with ID {pond_id} not found")

    if payload.name is not None:
        pond.name = payload.name
    if payload.species is not None:
        pond.species = payload.species.lower().strip()
    if payload.fish_count is not None:
        pond.fish_count = payload.fish_count
    if payload.avg_weight_g is not None:
        pond.avg_weight_g = payload.avg_weight_g
    if payload.area_ha is not None:
        pond.area_ha = payload.area_ha
    if payload.survival_rate is not None:
        pond.survival_rate = payload.survival_rate

    db.commit()
    db.refresh(pond)
    return enrich_pond_read(pond)


@router.delete("/{pond_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pond(pond_id: int, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail=f"Pond with ID {pond_id} not found")
    db.delete(pond)
    db.commit()
    return None
