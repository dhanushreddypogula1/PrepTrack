"""
src/database.py
SQLAlchemy ORM models + session factory for PrepTrack.
All tables: users, assessments, chat_history, progress_logs.
Exam + OAuth tables are added by backend/db_migrate.py.
"""
import os
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# ── Engine ────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///preptrack.db")

# SQLite needs check_same_thread=False for FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_session():
    """Returns a new SQLAlchemy session. Caller must close it."""
    return SessionLocal()


# ── Models ────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, autoincrement=True)
    username      = Column(String(50), unique=True, nullable=False, index=True)
    email         = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url    = Column(String(500), nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    assessments   = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    chats         = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    progress      = relationship("ProgressLog", back_populates="user", cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"
    id                    = Column(Integer, primary_key=True, autoincrement=True)
    user_id               = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    branch                = Column(String(20))
    cgpa                  = Column(Float)
    dsa_score             = Column(Integer)
    projects              = Column(Integer)
    internships           = Column(Integer)
    certifications        = Column(Integer)
    hackathons            = Column(Integer)
    backlogs              = Column(Integer)
    aptitude_score        = Column(Integer)
    communication_score   = Column(Integer)
    resume_score          = Column(Integer)
    placement_probability = Column(Float)
    predicted_ctc         = Column(Float)
    created_at            = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")


class ChatHistory(Base):
    __tablename__ = "chat_history"
    id        = Column(Integer, primary_key=True, autoincrement=True)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role      = Column(String(20))   # "user" | "assistant"
    message   = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chats")


class ProgressLog(Base):
    __tablename__ = "progress_logs"
    id               = Column(Integer, primary_key=True, autoincrement=True)
    user_id          = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_type    = Column(String(50))   # "DSA" | "Project" | "Mock Interview" | etc.
    description      = Column(String(500))
    duration_minutes = Column(Integer)
    logged_at        = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")


# ── Init ──────────────────────────────────────────────────────────────
def init_db():
    """Create all tables. Idempotent — safe to run repeatedly."""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("✅ Database initialized at:", DATABASE_URL)