from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class ClientBase(BaseModel):
    nom: str
    prenom: str
    telephone: str
    email: EmailStr | None = None
    adresse: str | None = None
    cin: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    nom: str | None = None
    prenom: str | None = None
    telephone: str | None = None
    email: EmailStr | None = None
    adresse: str | None = None
    cin: str | None = None
    actif: bool | None = None


class ClientResponse(ClientBase):
    id: int
    actif: bool
    date_creation: datetime

    model_config = ConfigDict(from_attributes=True)