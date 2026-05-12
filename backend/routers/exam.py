import json
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from backend.schemas import ExamConfig, ExamAttemptOut, AnswerSubmission, ExamResult, ExamQuestion
from backend.routers.auth import current_user
from backend.services.exam_engine import generate_exam, score_exam
from backend.db_migrate import ExamAttempt
from src.database import get_session

router = APIRouter()

@router.post("/start", response_model=ExamAttemptOut)
def start_exam(config: ExamConfig, user=Depends(current_user)):
    questions, expires_at = generate_exam(config)
    questions_with_correct = [q.model_dump() for q in questions]
    questions_without_correct = [{**q, "correct_key": None} for q in questions_with_correct]

    db = get_session()
    try:
        attempt = ExamAttempt(
            user_id=user["user_id"],
            config=config.model_dump(),
            questions=questions_with_correct,
            status="pending",
            expires_at=expires_at,
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        return ExamAttemptOut(
            attempt_id=attempt.id,
            questions=[ExamQuestion(**q) for q in questions_without_correct],
            expires_at=expires_at,
        )
    finally:
        db.close()

@router.post("/submit", response_model=ExamResult)
def submit_exam(body: AnswerSubmission, user=Depends(current_user)):
    db = get_session()
    try:
        attempt = db.query(ExamAttempt).filter(
            ExamAttempt.id == body.attempt_id,
            ExamAttempt.user_id == user["user_id"],
        ).first()
        if not attempt:
            raise HTTPException(404, "Attempt not found")
        if attempt.status == "completed":
            raise HTTPException(400, "Already submitted")
        if datetime.utcnow() > attempt.expires_at:
            raise HTTPException(400, "Exam time expired")

        result = score_exam(attempt.questions, body.answers, body.time_taken_seconds, body.tab_switches)
        result.attempt_id = attempt.id

        attempt.answers = body.answers
        attempt.score = result.score
        attempt.correct = result.correct
        attempt.total = result.total
        attempt.time_taken_secs = body.time_taken_seconds
        attempt.tab_switches = body.tab_switches
        attempt.domain_breakdown = result.domain_breakdown
        attempt.status = "completed"
        db.commit()
        return result
    finally:
        db.close()

@router.get("/history")
def exam_history(user=Depends(current_user)):
    db = get_session()
    try:
        attempts = db.query(ExamAttempt)\
            .filter(ExamAttempt.user_id == user["user_id"], ExamAttempt.status == "completed")\
            .order_by(ExamAttempt.created_at.desc()).limit(10).all()
        return [{
            "id": a.id, "score": a.score, "correct": a.correct, "total": a.total,
            "domain_breakdown": a.domain_breakdown, "created_at": a.created_at.isoformat(),
        } for a in attempts]
    finally:
        db.close()
