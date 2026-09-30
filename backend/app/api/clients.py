from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.client import Client
from app.schemas.client import (
    ClientCreate,
    ClientResponse,
    ClientUpdate,
)


router = APIRouter(
    prefix="/clients",
    tags=["Clients"]
)


# CREATE
@router.post(
    "",
    response_model=ClientResponse,
    status_code=status.HTTP_201_CREATED
)
def create_client(
    data: ClientCreate,
    db: Session = Depends(get_db)
):
    client = Client(**data.model_dump())

    db.add(client)
    db.commit()
    db.refresh(client)

    return client


# READ ALL
@router.get("", response_model=list[ClientResponse])
def get_clients(db: Session = Depends(get_db)):
    clients = db.scalars(
        select(Client).order_by(Client.id.desc())
    ).all()

    return clients


# READ ONE
@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db)
):
    client = db.get(Client, client_id)

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    return client


# UPDATE
@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    data: ClientUpdate,
    db: Session = Depends(get_db)
):
    client = db.get(Client, client_id)

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    updates = data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)

    return client


# DELETE
@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db)
):
    client = db.get(Client, client_id)

    if client is None:
        raise HTTPException(
            status_code=404,
            detail="Client introuvable"
        )

    db.delete(client)
    db.commit()

    return {
        "message": "Client supprimé avec succès"
    }