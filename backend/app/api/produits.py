from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.produit import Produit
from app.schemas.produit import (
    ProduitCreate,
    ProduitResponse,
    ProduitUpdate,
)


router = APIRouter(
    prefix="/produits",
    tags=["Produits"]
)


# CREATE
@router.post(
    "",
    response_model=ProduitResponse,
    status_code=status.HTTP_201_CREATED
)
def create_produit(
    data: ProduitCreate,
    db: Session = Depends(get_db)
):
    # Vérifier qu'un produit avec le même nom n'existe pas
    existing = db.scalar(
        select(Produit).where(Produit.nom == data.nom)
    )

    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail="Un produit avec ce nom existe déjà"
        )

    produit = Produit(
        **data.model_dump()
    )

    db.add(produit)
    db.commit()
    db.refresh(produit)

    return produit


# READ ALL
@router.get(
    "",
    response_model=list[ProduitResponse]
)
def get_produits(
    db: Session = Depends(get_db)
):
    produits = db.scalars(
        select(Produit).order_by(Produit.id.desc())
    ).all()

    return produits


# READ ONE
@router.get(
    "/{produit_id}",
    response_model=ProduitResponse
)
def get_produit(
    produit_id: int,
    db: Session = Depends(get_db)
):
    produit = db.get(Produit, produit_id)

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    return produit


# UPDATE
@router.put(
    "/{produit_id}",
    response_model=ProduitResponse
)
def update_produit(
    produit_id: int,
    data: ProduitUpdate,
    db: Session = Depends(get_db)
):
    produit = db.get(Produit, produit_id)

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    updates = data.model_dump(exclude_unset=True)

    # Vérifier le nom si celui-ci est modifié
    if "nom" in updates:
        existing = db.scalar(
            select(Produit).where(
                Produit.nom == updates["nom"],
                Produit.id != produit_id
            )
        )

        if existing is not None:
            raise HTTPException(
                status_code=400,
                detail="Un produit avec ce nom existe déjà"
            )

    for field, value in updates.items():
        setattr(produit, field, value)

    db.commit()
    db.refresh(produit)

    return produit


# DELETE
@router.delete("/{produit_id}")
def delete_produit(
    produit_id: int,
    db: Session = Depends(get_db)
):
    produit = db.get(Produit, produit_id)

    if produit is None:
        raise HTTPException(
            status_code=404,
            detail="Produit introuvable"
        )

    db.delete(produit)
    db.commit()

    return {
        "message": "Produit supprimé avec succès"
    }