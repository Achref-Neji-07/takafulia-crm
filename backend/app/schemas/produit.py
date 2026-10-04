from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProduitBase(BaseModel):
    nom: str
    description: str | None = None
    actif: bool = True


class ProduitCreate(ProduitBase):
    pass


class ProduitUpdate(BaseModel):
    nom: str | None = None
    description: str | None = None
    actif: bool | None = None


class ProduitResponse(ProduitBase):
    id: int
    date_creation: datetime

    model_config = ConfigDict(from_attributes=True)