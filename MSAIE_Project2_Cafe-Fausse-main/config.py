"""
Configuration for the Café Fausse Flask app.

Reads settings from environment variables (see .env.example) so that
credentials never live in source code. python-dotenv loads a local
.env file automatically when present.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class BaseConfig:
    """Shared settings for all environments."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Comma-separated list in .env, e.g. CORS_ORIGINS=http://localhost:3000
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

    # Total physical tables in the restaurant (FR-8, FR-18).
    TOTAL_TABLES = int(os.environ.get("TOTAL_TABLES", 30))


class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://cafe_user:cafe_password@localhost:5432/cafe_fausse_dev",
    )


class TestingConfig(BaseConfig):
    DEBUG = True
    TESTING = True
    # SQLite in-memory DB keeps tests fast and isolated from real data.
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL", "sqlite:///:memory:"
    )


class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")


_CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name: str = None):
    """Return the config class for `name`, falling back to FLASK_ENV/default."""
    name = name or os.environ.get("FLASK_ENV", "development")
    return _CONFIGS.get(name, DevelopmentConfig)
