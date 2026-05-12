from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ── Auth ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ── Assessment ────────────────────────────────────────────────────────────────
class ProfileInput(BaseModel):
    branch: str = Field(..., pattern="^(CSE|ECE|IT|MECH|CIVIL|EEE)$")
    cgpa: float = Field(..., ge=5.0, le=10.0)
    dsa_score: int = Field(..., ge=0, le=100)
    projects: int = Field(..., ge=0, le=15)
    internships: int = Field(..., ge=0, le=5)
    certifications: int = Field(..., ge=0, le=10)
    hackathons: int = Field(..., ge=0, le=10)
    backlogs: int = Field(..., ge=0, le=10)
    aptitude_score: int = Field(..., ge=0, le=100)
    communication_score: int = Field(..., ge=0, le=100)
    resume_score: int = Field(..., ge=0, le=100)

class PredictionOut(BaseModel):
    placement_probability: float
    predicted_ctc: float
    feature_importances: List[List[Any]]

class ScenarioItem(BaseModel):
    label: str
    changes: Dict[str, Any]

class ScenarioRequest(BaseModel):
    profile: ProfileInput
    scenarios: List[ScenarioItem]

class ScenarioResult(BaseModel):
    label: str
    placement_probability: float
    predicted_ctc: float
    gain: float

# ── Advisor ───────────────────────────────────────────────────────────────────
class AdvisorRequest(BaseModel):
    profile: ProfileInput
    placement_probability: float
    predicted_ctc: float

class RoadmapRequest(BaseModel):
    profile: ProfileInput
    target_company: str = "top product companies"

class BulletRequest(BaseModel):
    bullet: str

class TextOut(BaseModel):
    text: str

# ── Companies ─────────────────────────────────────────────────────────────────
class CompanyMatchRequest(BaseModel):
    profile: ProfileInput
    base_probability: float

class SkillGapOut(BaseModel):
    skill: str
    importance: str
    description: str
    fix_effort_weeks: int

class CompanyMatchOut(BaseModel):
    company_name: str
    tier: str
    tier_label: str
    domain: str
    eligibility: str
    eligibility_reasons: List[str]
    fit_score: float
    fit_breakdown: Dict[str, float]
    calibrated_probability: float
    skill_gaps: List[SkillGapOut]
    matched_factors: List[str]
    missing_factors: List[str]
    hiring_format_summary: str
    ctc_range: str
    hiring_difficulty: str
    prep_timeline_weeks: int
    top_tips: List[str]
    confidence_note: str

class MatchResultOut(BaseModel):
    eligible: List[CompanyMatchOut]
    stretch: List[CompanyMatchOut]
    not_eligible: List[CompanyMatchOut]

class CompareRequest(BaseModel):
    profile: ProfileInput
    company_names: List[str]
    base_probability: float

class RoadmapOut(BaseModel):
    company_name: str
    text: str

# ── Exam ──────────────────────────────────────────────────────────────────────
class ExamDomain(str, Enum):
    dsa = "DSA"
    oops = "OOPS/DBMS/OS"
    aptitude = "Aptitude"
    verbal = "Verbal"
    system_design = "System Design"
    hr = "HR Behavioral"

class ExamConfig(BaseModel):
    domains: List[ExamDomain]
    num_questions: int = Field(default=20, ge=5, le=50)
    duration_minutes: int = Field(default=30, ge=5, le=120)
    difficulty: str = Field(default="mixed", pattern="^(easy|medium|hard|mixed)$")
    company_context: Optional[str] = None

class MCQOption(BaseModel):
    key: str
    text: str

class ExamQuestion(BaseModel):
    id: int
    domain: str
    difficulty: str
    question: str
    options: List[MCQOption]
    explanation: Optional[str] = None
    correct_key: Optional[str] = None  # only sent after exam ends

class ExamAttemptCreate(BaseModel):
    config: ExamConfig
    questions: List[ExamQuestion]

class ExamAttemptOut(BaseModel):
    attempt_id: int
    questions: List[ExamQuestion]
    expires_at: datetime

class AnswerSubmission(BaseModel):
    attempt_id: int
    answers: Dict[int, str]  # question_id -> selected_key
    time_taken_seconds: int
    tab_switches: int = 0

class ExamResult(BaseModel):
    attempt_id: int
    score: float
    correct: int
    total: int
    time_taken_seconds: int
    domain_breakdown: Dict[str, Dict[str, int]]
    weak_areas: List[str]
    rank_estimate: str
    question_results: List[Dict[str, Any]]

# ── Chat ──────────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

# ── Resume ────────────────────────────────────────────────────────────────────
class ContactInfo(BaseModel):
    email: bool
    phone: bool
    linkedin: bool
    github: bool
    score: int

class ResumeAnalysisOut(BaseModel):
    overall_score: float

    # Gemini role intelligence
    detected_role: str
    role_confidence: float
    suggested_roles: List[str]

    sections: Dict[str, Any]
    ats: Dict[str, Any]
    verbs: Dict[str, Any]
    contact: ContactInfo
    quantification: Dict[str, Any]
    gemini_feedback: str
    text_preview: str

# ── Interview ─────────────────────────────────────────────────────────────────
class InterviewQuestionRequest(BaseModel):
    domain: str
    company: str = ""
    difficulty: str = "Medium"

class InterviewAnswerRequest(BaseModel):
    question: str
    answer: str
    domain: str

# ── Progress ──────────────────────────────────────────────────────────────────
class ProgressLogCreate(BaseModel):
    activity_type: str
    description: str
    duration_minutes: int = Field(..., ge=1, le=480)

class ProgressLogOut(BaseModel):
    id: int
    activity_type: str
    description: str
    duration_minutes: int
    logged_at: datetime
    model_config = {"from_attributes": True}

# ── Assessment history ────────────────────────────────────────────────────────
class AssessmentOut(BaseModel):
    id: int
    branch: str
    cgpa: float
    dsa_score: int
    placement_probability: float
    predicted_ctc: float
    created_at: datetime
    model_config = {"from_attributes": True}
