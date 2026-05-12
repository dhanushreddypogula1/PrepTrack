"""
db_migrate.py
Run once: python backend/db_migrate.py
Adds OAuth columns + exam tables to existing preptrack.db
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from sqlalchemy import text
from src.database import engine, Base
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

# ── New ORM models ────────────────────────────────────────────────────────────
from src.database import Base

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    id            = Column(Integer, primary_key=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider      = Column(String(20), nullable=False)   # "google" | "github"
    provider_id   = Column(String(200), nullable=False, unique=True)
    avatar_url    = Column(String(500))
    created_at    = Column(DateTime, default=datetime.utcnow)

class ExamQuestion(Base):
    __tablename__ = "exam_questions"
    id         = Column(Integer, primary_key=True)
    domain     = Column(String(50))
    difficulty = Column(String(10))
    question   = Column(Text)
    options    = Column(JSON)      # [{"key":"A","text":"..."}]
    correct    = Column(String(1))
    explanation= Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"
    id              = Column(Integer, primary_key=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    config          = Column(JSON)
    questions       = Column(JSON)   # list of question dicts with correct key
    answers         = Column(JSON)   # {question_id: selected_key}
    score           = Column(Float)
    correct         = Column(Integer)
    total           = Column(Integer)
    time_taken_secs = Column(Integer)
    tab_switches    = Column(Integer, default=0)
    domain_breakdown= Column(JSON)
    status          = Column(String(20), default="pending")  # pending|completed
    expires_at      = Column(DateTime)
    created_at      = Column(DateTime, default=datetime.utcnow)

def migrate():
    # Add avatar_url to users if missing
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))
            conn.commit()
            print("✅ Added avatar_url to users")
        except Exception:
            print("   avatar_url already exists")

    Base.metadata.create_all(bind=engine)
    print("✅ Exam + OAuth tables created")

if __name__ == "__main__":
    migrate()
