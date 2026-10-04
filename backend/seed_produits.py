from app.db.database import SessionLocal
from app.models.produit import Produit


produits = [
    {
        "nom": "Assurance Auto",
        "description": "Assurance destinée aux véhicules automobiles."
    },
    {
        "nom": "Assurance Habitation",
        "description": "Assurance destinée à protéger les logements et les biens."
    },
    {
        "nom": "Assurance Santé",
        "description": "Couverture des frais de santé et des dépenses médicales."
    },
    {
        "nom": "Assistance Voyage",
        "description": "Assistance et couverture lors des déplacements et voyages."
    },
    {
        "nom": "Assurance Incendie",
        "description": "Protection des biens contre les dommages causés par un incendie."
    },
    {
        "nom": "Responsabilité Civile",
        "description": "Couverture des dommages causés involontairement à des tiers."
    },
    {
        "nom": "Multirisques Professionnels",
        "description": "Protection des locaux, équipements et activités professionnelles."
    },
    {
        "nom": "Temporaire Décès",
        "description": "Protection financière des bénéficiaires en cas de décès de l'assuré."
    },
    {
        "nom": "Épargne Prévoyance",
        "description": "Solution d'épargne et de prévoyance pour préparer l'avenir."
    },
    {
        "nom": "Assurance Transport",
        "description": "Couverture des marchandises et des risques liés au transport."
    }
]


db = SessionLocal()

try:
    for data in produits:

        existe = (
            db.query(Produit)
            .filter(Produit.nom == data["nom"])
            .first()
        )

        if existe:
            print(f"Déjà présent : {data['nom']}")
            continue

        produit = Produit(
            nom=data["nom"],
            description=data["description"],
            actif=True
        )

        db.add(produit)

        print(f"Ajout : {data['nom']}")

    db.commit()

    print("\nTous les produits ont été ajoutés avec succès.")

except Exception as e:
    db.rollback()
    print("Erreur :", e)

finally:
    db.close()