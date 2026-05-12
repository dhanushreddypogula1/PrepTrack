// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User { id: number; username: string; email: string; avatar_url?: string }
export interface AuthToken { access_token: string; token_type: string; user: User }

// ── Assessment ────────────────────────────────────────────────────────────────
export interface Profile {
  branch: "CSE"|"ECE"|"IT"|"MECH"|"CIVIL"|"EEE"
  cgpa: number; dsa_score: number; projects: number; internships: number
  certifications: number; hackathons: number; backlogs: number
  aptitude_score: number; communication_score: number; resume_score: number
}
export interface Prediction {
  placement_probability: number; predicted_ctc: number
  feature_importances: [string, number][]
}
export interface ScenarioResult { label: string; placement_probability: number; predicted_ctc: number; gain: number }
export interface AssessmentRecord {
  id: number; branch: string; cgpa: number; dsa_score: number
  placement_probability: number; predicted_ctc: number; created_at: string
}

// ── Companies ─────────────────────────────────────────────────────────────────
export interface SkillGap { skill: string; importance: string; description: string; fix_effort_weeks: number }
export interface CompanyMatch {
  company_name: string; tier: string; tier_label: string; domain: string
  eligibility: "eligible"|"stretch"|"not_eligible"
  eligibility_reasons: string[]; fit_score: number; fit_breakdown: Record<string, number>
  calibrated_probability: number; skill_gaps: SkillGap[]; matched_factors: string[]
  missing_factors: string[]; hiring_format_summary: string; ctc_range: string
  hiring_difficulty: string; prep_timeline_weeks: number; top_tips: string[]; confidence_note: string
}
export interface MatchResult { eligible: CompanyMatch[]; stretch: CompanyMatch[]; not_eligible: CompanyMatch[] }

// ── Exam ──────────────────────────────────────────────────────────────────────
export type ExamDomain = "DSA"|"OOPS/DBMS/OS"|"Aptitude"|"Verbal"|"System Design"|"HR Behavioral"
export interface ExamConfig {
  domains: ExamDomain[]; num_questions: number; duration_minutes: number
  difficulty: "easy"|"medium"|"hard"|"mixed"; company_context?: string
}
export interface MCQOption { key: string; text: string }
export interface ExamQuestion {
  id: number; domain: string; difficulty: string; question: string
  options: MCQOption[]; explanation?: string; correct_key?: string
}
export interface ExamAttempt { attempt_id: number; questions: ExamQuestion[]; expires_at: string }
export interface QuestionResult {
  id: number; question: string; selected: string; correct: string
  is_correct: boolean; explanation: string
}
export interface ExamResult {
  attempt_id: number; score: number; correct: number; total: number
  time_taken_seconds: number; domain_breakdown: Record<string, {correct: number; total: number}>
  weak_areas: string[]; rank_estimate: string; question_results: QuestionResult[]
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage { role: "user"|"assistant"; content: string }

// ── Resume ────────────────────────────────────────────────────────────────────
export interface ResumeAnalysis {
  overall_score: number; detected_role: string; role_confidence: number; suggested_roles: string[]
  sections: Record<string, any>; ats: Record<string, any>
  verbs: Record<string, any>; contact: { email: boolean; phone: boolean; linkedin: boolean; github: boolean; score: number }
  quantification: Record<string, any>; gemini_feedback: string; text_preview: string
}

// ── Progress ──────────────────────────────────────────────────────────────────
export interface ProgressLog {
  id: number; activity_type: string; description: string; duration_minutes: number; logged_at: string
}

// ── Store ─────────────────────────────────────────────────────────────────────
export interface AppStore {
  user: User | null; token: string | null
  lastProfile: Profile | null; lastPrediction: Prediction | null
  setUser: (u: User | null, t: string | null) => void
  setAssessment: (p: Profile, pred: Prediction) => void
}
