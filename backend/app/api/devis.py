from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.client import Client
from app.models.devis import Devis
from app.schemas.devis import (
    DevisCreate,
    DevisResponse,
    DevisUpdate,
)


router = APIRouter(
    prefix="/devis",
    tags=["Devis"]
)


# CREATE
@router.post(
    "",
    response_model=DevisResponse,
    status_code=status.HTTP_201_CREATED
)
def create_devis(
    data: DevisCreate,
    db: Session = Depends(get_db)
):
    # Vérifier que le client existe
    client = db.get(Client, data.client_id)

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    # Création temporaire pour obtenir un ID
    devis = Devis(
        numero_devis="TEMP",
        **data.model_dump()
    )

    db.add(devis)
    db.flush()

    devis.numero_devis = (
        f"DEV-{datetime.now().year}-{devis.id:05d}"
    )

    db.commit()
    db.refresh(devis)

    return devis


# READ ALL
@router.get(
    "",
    response_model=list[DevisResponse]
)
def get_devis(
    db: Session = Depends(get_db)
):
    devis = db.scalars(
        select(Devis).order_by(Devis.id.desc())
    ).all()

    return devis


# READ ONE
@router.get(
    "/{devis_id}",
    response_model=DevisResponse
)
def get_devis_by_id(
    devis_id: int,
    db: Session = Depends(get_db)
):
    devis = db.get(Devis, devis_id)

    if devis is None:
        raise HTTPException(
            status_code=404,
            detail="Devis introuvable"
        )

    return devis


# UPDATE
@router.put(
    "/{devis_id}",
    response_model=DevisResponse
)
def update_devis(
    devis_id: int,
    data: DevisUpdate,
    db: Session = Depends(get_db)
):
    devis = db.get(Devis, devis_id)

    if devis is None:
        raise HTTPException(
            status_code=404,
            detail="Devis introuvable"
        )

    updates = data.model_dump(exclude_unset=True)

    if "client_id" in updates:
        client = db.get(Client, updates["client_id"])

        if client is None:
            raise HTTPException(
                status_code=404,
                detail="Client introuvable"
            )

    for field, value in updates.items():
        setattr(devis, field, value)

    db.commit()
    db.refresh(devis)

    return devis


# DELETE
@router.delete("/{devis_id}")
def delete_devis(
    devis_id: int,
    db: Session = Depends(get_db)
):
    devis = db.get(Devis, devis_id)

    if devis is None:
        raise HTTPException(
            status_code=404,
            detail="Devis introuvable"
        )

    db.delete(devis)
    db.commit()

    return {
        "message": "Devis supprimé avec succès"
    }