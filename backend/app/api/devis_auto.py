from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.devis import Devis
from app.models.devis_auto import DevisAuto
from app.schemas.devis_auto import (
    DevisAutoCreate,
    DevisAutoUpdate,
    DevisAutoResponse,
)


router = APIRouter(
    prefix="/devis-auto",
    tags=["Devis Auto"]
)


@router.get("", response_model=list[DevisAutoResponse])
def get_devis_auto(db: Session = Depends(get_db)):
    return (
        db.query(DevisAuto)
        .order_by(DevisAuto.id.desc())
        .all()
    )


@router.get("/{devis_auto_id}", response_model=DevisAutoResponse)
def get_devis_auto_by_id(
    devis_auto_id: int,
    db: Session = Depends(get_db)
):
    devis_auto = (
        db.query(DevisAuto)
        .filter(DevisAuto.id == devis_auto_id)
        .first()
    )

    if not devis_auto:
        raise HTTPException(
            status_code=404,
            detail="Devis Auto introuvable."
        )

    return devis_auto


@router.post(
    "",
    response_model=DevisAutoResponse,
    status_code=status.HTTP_201_CREATED
)
def create_devis_auto(
    data: DevisAutoCreate,
    db: Session = Depends(get_db)
):
    # Vérifier que le devis principal existe
    devis = (
        db.query(Devis)
        .filter(Devis.id == data.devis_id)
        .first()
    )

    if not devis:
        raise HTTPException(
            status_code=404,
            detail="Le devis associé n'existe pas."
        )

    # Un devis ne peut avoir qu'une fiche Auto
    existing = (
        db.query(DevisAuto)
        .filter(DevisAuto.devis_id == data.devis_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Une fiche Auto existe déjà pour ce devis."
        )

    devis_auto = DevisAuto(
        **data.model_dump()
    )

    db.add(devis_auto)
    db.commit()
    db.refresh(devis_auto)

    return devis_auto


@router.put("/{devis_auto_id}", response_model=DevisAutoResponse)
def update_devis_auto(
    devis_auto_id: int,
    data: DevisAutoUpdate,
    db: Session = Depends(get_db)
):
    devis_auto = (
        db.query(DevisAuto)
        .filter(DevisAuto.id == devis_auto_id)
        .first()
    )

    if not devis_auto:
        raise HTTPException(
            status_code=404,
            detail="Devis Auto introuvable."
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(devis_auto, field, value)

    db.commit()
    db.refresh(devis_auto)

    return devis_auto


@router.delete(
    "/{devis_auto_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_devis_auto(
    devis_auto_id: int,
    db: Session = Depends(get_db)
):
    devis_auto = (
        db.query(DevisAuto)
        .filter(DevisAuto.id == devis_auto_id)
        .first()
    )

    if not devis_auto:
        raise HTTPException(
            status_code=404,
            detail="Devis Auto introuvable."
        )

    db.delete(devis_auto)
    db.commit()

    return None