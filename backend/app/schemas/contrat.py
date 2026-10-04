from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ContratBase(BaseModel):
    devis_id: int
    client_id: int
    produit: str
    montant: float
    date_fin: datetime | None = None


class ContratCreate(ContratBase):
    pass


class ContratUpdate(BaseModel):
    statut: str | None = None
    date_fin: datetime | None = None


class ContratResponse(ContratBase):
    id: int
    numero_contrat: str
    statut: str
    date_debut: datetime
    date_creation: datetime

    model_config = ConfigDict(from_attributes=True)