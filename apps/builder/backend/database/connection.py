"""
Database connection and session management for Boxiii
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from contextlib import contextmanager
from typing import Generator

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://boxiii_user:boxiii_dev_password@localhost:5432/boxiii")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    echo=bool(os.getenv("SQL_ECHO", False))  # Log SQL queries in debug mode
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager for database sessions
    Usage:
        with get_db_session() as db:
            # perform database operations
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables
    This should be called on application startup
    """
    from .models import Base
    Base.metadata.create_all(bind=engine)


def check_db_connection():
    """
    Check if database connection is working
    Returns True if connection is successful, False otherwise
    """
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False