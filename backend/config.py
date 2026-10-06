import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    # En tu ordenador se usa la base de datos del .env (MySQL).
    # En Vercel, si no hay DATABASE_URL, se usa una base temporal para que la app arranque.
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or "sqlite:////tmp/ballonette.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
