"""
Creates all database tables defined in app/models.py.

Run once after setting up PostgreSQL and configuring .env:

    python init_db.py
"""

from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()
    print("Database tables created successfully.")
