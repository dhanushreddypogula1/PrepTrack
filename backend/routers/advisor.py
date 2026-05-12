from fastapi import APIRouter, Depends
from backend.schemas import AdvisorRequest, RoadmapRequest, BulletRequest, TextOut, InterviewQuestionRequest, InterviewAnswerRequest
from backend.routers.auth import current_user
from src.gemini_advisor import (
    get_gemini_suggestions, get_roadmap,
    improve_resume_bullet, get_mock_interview_question, evaluate_interview_answer
)

router = APIRouter()

@router.post("/report", response_model=TextOut)
def report(body: AdvisorRequest, _=Depends(current_user)):
    text = get_gemini_suggestions(body.profile.model_dump(), body.placement_probability, body.predicted_ctc)
    return TextOut(text=text)

@router.post("/roadmap", response_model=TextOut)
def roadmap(body: RoadmapRequest, _=Depends(current_user)):
    return TextOut(text=get_roadmap(body.profile.model_dump(), body.target_company))

@router.post("/bullet", response_model=TextOut)
def bullet(body: BulletRequest, _=Depends(current_user)):
    return TextOut(text=improve_resume_bullet(body.bullet))

@router.post("/interview/question")
def interview_q(body: InterviewQuestionRequest, _=Depends(current_user)):
    return get_mock_interview_question(body.domain, body.company, body.difficulty)

@router.post("/interview/evaluate")
def interview_eval(body: InterviewAnswerRequest, _=Depends(current_user)):
    return evaluate_interview_answer(body.question, body.answer, body.domain)
