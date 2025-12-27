#!/usr/bin/env python3
"""
Initialize the database with tables
Usage: python init_db.py
"""
from app.core.database import engine, Base
from app.models.item import Item  # Import all models

def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    init_db()
