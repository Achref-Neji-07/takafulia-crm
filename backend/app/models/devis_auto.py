from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class DevisAuto(Base):
    __tablename__ = "devis_auto"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    devis_id: Mapped[int] = mapped_column(
        ForeignKey("devis.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    immatriculation: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    marque: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    modele: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    annee: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    puissance_fiscale: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    valeur_vehicule: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    date_premiere_mise_circulation: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    usage_vehicule: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    date_creation: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )