from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Contrat(Base):
    __tablename__ = "contrats"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    numero_contrat: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    devis_id: Mapped[int] = mapped_column(
        ForeignKey("devis.id"),
        unique=True,
        nullable=False,
        index=True
    )

    client_id: Mapped[int] = mapped_column(
        ForeignKey("clients.id"),
        nullable=False,
        index=True
    )

    produit: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    montant: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    statut: Mapped[str] = mapped_column(
        String(30),
        default="ACTIF",
        nullable=False
    )

    date_debut: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    date_fin: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )