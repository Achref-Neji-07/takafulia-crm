from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Produit(Base):
    __tablename__ = "produits"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    nom: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    actif: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )