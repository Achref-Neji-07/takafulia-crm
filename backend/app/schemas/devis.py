
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DevisBase(BaseModel):
    client_id: int
    produit: str
    montant: float
    date_expiration: datetime | None = None


class DevisCreate(DevisBase):
    pass


class DevisUpdate(BaseModel):
    client_id: int | None = None
    produit: str | None = None
    montant: float | None = None
    statut: str | None = None
    date_expiration: datetime | None = None


class DevisResponse(DevisBase):
    id: int
    numero_devis: str
    statut: str
    date_creation: datetime

    model_config = ConfigDict(from_attributes=True)