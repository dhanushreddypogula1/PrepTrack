from fastapi import APIRouter, Depends
from backend.schemas import ProfileInput, PredictionOut, ScenarioRequest, ScenarioResult, AssessmentOut
from backend.routers.auth import current_user
from src.predict import predict, get_scenario_predictions
from src.database import get_session, Assessment
from typing import List

router = APIRouter()

def _profile_dict(p: ProfileInput) -> dict:
    return p.model_dump()

@router.post("/", response_model=PredictionOut)
def run_prediction(body: ProfileInput, user=Depends(current_user)):
    result = predict(_profile_dict(body))
    db = get_session()
    try:
        db.add(Assessment(
            user_id=user["user_id"], **body.model_dump(),
            placement_probability=result["placement_probability"],
            predicted_ctc=result["predicted_ctc"]
        ))
        db.commit()
    finally:
        db.close()
    return PredictionOut(**result)

@router.post("/scenarios", response_model=List[ScenarioResult])
def run_scenarios(body: ScenarioRequest):
    base = _profile_dict(body.profile)
    scenarios = [{**base, **s.changes} for s in body.scenarios]
    raw = get_scenario_predictions(base, [{**base, **s.changes} for s in body.scenarios])
    base_prob = predict(base)["placement_probability"]
    return [
        ScenarioResult(
            label=body.scenarios[i].label,
            placement_probability=r["placement_probability"],
            predicted_ctc=r["predicted_ctc"],
            gain=r["placement_probability"] - base_prob
        )
        for i, r in enumerate(raw)
    ]

@router.get("/history", response_model=List[AssessmentOut])
def history(user=Depends(current_user)):
    db = get_session()
    try:
        rows = db.query(Assessment)\
                 .filter(Assessment.user_id == user["user_id"])\
                 .order_by(Assessment.created_at.desc()).limit(20).all()
        return rows
    finally:
        db.close()
