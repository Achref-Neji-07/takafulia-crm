from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.contrat import Contrat
from app.schemas.contrat import (
    ContratCreate,
    ContratUpdate,
    ContratResponse,
)


router = APIRouter(
    prefix="/contrats",
    tags=["Contrats"]
)


@router.get("", response_model=list[ContratResponse])
def get_contrats(db: Session = Depends(get_db)):
    return db.query(Contrat).order_by(Contrat.id.desc()).all()


@router.get("/{contrat_id}", response_model=ContratResponse)
def get_contrat(
    contrat_id: int,
    db: Session = Depends(get_db)
):
    contrat = db.query(Contrat).filter(
        Contrat.id == contrat_id
    ).first()

    if not contrat:
        raise HTTPException(
            status_code=404,
            detail="Contrat introuvable"
        )

    return contrat


@router.post("", response_model=ContratResponse, status_code=201)
def create_contrat(
    data: ContratCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Contrat).filter(
        Contrat.devis_id == data.devis_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Un contrat existe déjà pour ce devis"
        )

    count = db.query(Contrat).count()

    numero = f"CONT-{count + 1:05d}"

    contrat = Contrat(
        numero_contrat=numero,
        devis_id=data.devis_id,
        client_id=data.client_id,
        produit=data.produit,
        montant=data.montant,
        date_fin=data.date_fin,
        statut="ACTIF"
    )

    db.add(contrat)
    db.commit()
    db.refresh(contrat)

    return contrat


@router.put("/{contrat_id}", response_model=ContratResponse)
def update_contrat(
    contrat_id: int,
    data: ContratUpdate,
    db: Session = Depends(get_db)
):
    contrat = db.query(Contrat).filter(
        Contrat.id == contrat_id
    ).first()

    if not contrat:
        raise HTTPException(
            status_code=404,
            detail="Contrat introuvable"
        )

    updates = data.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(contrat, key, value)

    db.commit()
    db.refresh(contrat)

    return contrat


@router.delete("/{contrat_id}")
def delete_contrat(
    contrat_id: int,
    db: Session = Depends(get_db)
):
    contrat = db.query(Contrat).filter(
        Contrat.id == contrat_id
    ).first()

    if not contrat:
        raise HTTPException(
            status_code=404,
            detail="Contrat introuvable"
        )

    db.delete(contrat)
    db.commit()

    return {
        "message": "Contrat supprimé avec succès"
    }