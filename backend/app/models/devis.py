from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Devis(Base):
    __tablename__ = "devis"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    numero_devis: Mapped[str] = mapped_column(
        String(50),
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
        default="EN_ATTENTE",
        nullable=False
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    date_expiration: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )