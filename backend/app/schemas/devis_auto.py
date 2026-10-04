from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class DevisAutoBase(BaseModel):
    immatriculation: str
    marque: str
    modele: str
    annee: int | None = None
    puissance_fiscale: int | None = None
    valeur_vehicule: float | None = None
    date_premiere_mise_circulation: date | None = None
    usage_vehicule: str | None = None


class DevisAutoCreate(DevisAutoBase):
    devis_id: int


class DevisAutoUpdate(BaseModel):
    immatriculation: str | None = None
    marque: str | None = None
    modele: str | None = None
    annee: int | None = None
    puissance_fiscale: int | None = None
    valeur_vehicule: float | None = None
    date_premiere_mise_circulation: date | None = None
    usage_vehicule: str | None = None


class DevisAutoResponse(DevisAutoBase):
    id: int
    devis_id: int
    date_creation: datetime

    model_config = ConfigDict(from_attributes=True)