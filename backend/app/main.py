from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.clients import router as clients_router
from app.api.devis import router as devis_router
from app.db.database import engine


app = FastAPI(
    title="Takafulia CRM API",
    description="API backend de la plateforme CRM Takafulia",
    version="1.0.0"
)


# Autoriser le frontend Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
app.include_router(clients_router)
app.include_router(devis_router)

@app.get("/")
def root():
    return {
        "message": "Bienvenue sur Takafulia CRM API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "application": "Takafulia CRM API"
    }


@app.get("/database-health")
def database_health():
    with engine.connect() as connection:
        database_name = connection.execute(
            text("SELECT current_database()")
        ).scalar()

    return {
        "status": "connected",
        "database": database_name
    }