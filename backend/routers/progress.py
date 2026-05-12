from fastapi import APIRouter, Depends
from backend.schemas import ProgressLogCreate, ProgressLogOut
from backend.routers.auth import current_user
from src.database import get_session, ProgressLog
from typing import List

router = APIRouter()

@router.post("/", response_model=ProgressLogOut)
def log_activity(body: ProgressLogCreate, user=Depends(current_user)):
    db = get_session()
    try:
        log = ProgressLog(user_id=user["user_id"], **body.model_dump())
        db.add(log); db.commit(); db.refresh(log)
        return log
    finally:
        db.close()

@router.get("/", response_model=List[ProgressLogOut])
def get_logs(user=Depends(current_user)):
    db = get_session()
    try:
        return db.query(ProgressLog)\
            .filter(ProgressLog.user_id == user["user_id"])\
            .order_by(ProgressLog.logged_at.desc()).limit(50).all()
    finally:
        db.close()
