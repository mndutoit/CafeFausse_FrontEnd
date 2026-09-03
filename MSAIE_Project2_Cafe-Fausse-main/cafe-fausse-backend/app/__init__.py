"""
Café Fausse Backend
--------------------
Flask application factory. Sets up the Flask app, connects it to
PostgreSQL via SQLAlchemy, enables CORS for the React front-end,
and registers the API routes (blueprints).
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from config import get_config

# SQLAlchemy database instance. Created here (outside create_app) so
# models.py can import `db` without circular-import issues.
db = SQLAlchemy()


def create_app(config_name: str = None) -> Flask:
    """
    Application factory. Creates and configures the Flask app.

    Using a factory (instead of a single global `app` object) makes it
    easy to spin up separate instances for testing vs. production, each
    with their own config/database.
    """
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    # Allow the React dev server (and later, the deployed front-end) to
    # call this API from a different origin.
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    db.init_app(app)

    # Import models here so SQLAlchemy is aware of them before create_all().
    from app import models  # noqa: F401

    # Register API routes.
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    # Simple health check — useful for confirming the server + DB are up.
    @app.route("/api/health")
    def health_check():
        return {"status": "ok", "service": "cafe-fausse-backend"}, 200

    return app
