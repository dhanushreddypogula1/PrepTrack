from fastapi import APIRouter, Depends, HTTPException
from backend.schemas import CompanyMatchRequest, MatchResultOut, CompanyMatchOut, CompareRequest, TextOut, RoadmapRequest
from backend.routers.auth import current_user
from src.company_matcher import match_student_to_companies, match_student_to_one_company
from src.company_roadmap import generate_company_roadmap, generate_skill_gap_plan, compare_companies
from src.company_data import get_all_companies, COMPANY_DB
from dataclasses import asdict
import dataclasses

router = APIRouter()

def _match_to_dict(m) -> dict:
    return {
        "company_name": m.company_name, "tier": m.tier, "tier_label": m.tier_label,
        "domain": m.domain, "eligibility": m.eligibility, "eligibility_reasons": m.eligibility_reasons,
        "fit_score": m.fit_score, "fit_breakdown": m.fit_breakdown,
        "calibrated_probability": m.calibrated_probability,
        "skill_gaps": [{"skill": g.skill, "importance": g.importance, "description": g.description, "fix_effort_weeks": g.fix_effort_weeks} for g in m.skill_gaps],
        "matched_factors": m.matched_factors, "missing_factors": m.missing_factors,
        "hiring_format_summary": m.hiring_format_summary, "ctc_range": m.ctc_range,
        "hiring_difficulty": m.hiring_difficulty, "prep_timeline_weeks": m.prep_timeline_weeks,
        "top_tips": m.top_tips, "confidence_note": m.confidence_note,
    }

@router.get("/list")
def list_companies(_=Depends(current_user)):
    return {"companies": get_all_companies()}

@router.post("/match", response_model=MatchResultOut)
def match_all(body: CompanyMatchRequest, _=Depends(current_user)):
    result = match_student_to_companies(body.profile.model_dump(), body.base_probability)
    return MatchResultOut(
        eligible=[_match_to_dict(m) for m in result["eligible"]],
        stretch=[_match_to_dict(m) for m in result["stretch"]],
        not_eligible=[_match_to_dict(m) for m in result["not_eligible"]],
    )

@router.post("/match/{company_name}", response_model=CompanyMatchOut)
def match_one(company_name: str, body: CompanyMatchRequest, _=Depends(current_user)):
    if company_name not in COMPANY_DB:
        raise HTTPException(404, f"{company_name} not in database")
    m = match_student_to_one_company(body.profile.model_dump(), company_name, body.base_probability)
    return _match_to_dict(m)

@router.post("/roadmap/{company_name}", response_model=TextOut)
def company_roadmap(company_name: str, body: CompanyMatchRequest, _=Depends(current_user)):
    m = match_student_to_one_company(body.profile.model_dump(), company_name, body.base_probability)
    text = generate_company_roadmap(body.profile.model_dump(), company_name, m)
    return TextOut(text=text)

@router.post("/gaps/plan", response_model=TextOut)
def gap_plan(body: CompanyMatchRequest, company_name: str, _=Depends(current_user)):
    m = match_student_to_one_company(body.profile.model_dump(), company_name, body.base_probability)
    text = generate_skill_gap_plan(body.profile.model_dump(), m.skill_gaps, company_name)
    return TextOut(text=text)

@router.post("/compare", response_model=TextOut)
def compare(body: CompareRequest, _=Depends(current_user)):
    result = match_student_to_companies(body.profile.model_dump(), body.base_probability)
    text = compare_companies(body.profile.model_dump(), body.company_names, result)
    return TextOut(text=text)
