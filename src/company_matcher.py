"""
src/company_matcher.py
Eligibility check + fit-score + skill-gap analysis for the 14 companies.

Returns CompanyMatch dataclass instances — the router unpacks them
into the CompanyMatchOut Pydantic schema.
"""
from dataclasses import dataclass, field
from typing import List, Dict
from src.company_data import COMPANY_DB, get_company


# ── Dataclasses ───────────────────────────────────────────────────────
@dataclass
class SkillGap:
    skill: str
    importance: str          # "High" | "Medium" | "Low"
    description: str
    fix_effort_weeks: int


@dataclass
class CompanyMatch:
    company_name: str
    tier: str                                # "1" | "2" | "3"
    tier_label: str
    domain: str
    eligibility: str                         # "Eligible" | "Stretch" | "Not Eligible"
    eligibility_reasons: List[str]
    fit_score: float                         # 0-100
    fit_breakdown: Dict[str, float]          # contributions
    calibrated_probability: float            # 0-1
    skill_gaps: List[SkillGap]
    matched_factors: List[str]
    missing_factors: List[str]
    hiring_format_summary: str
    ctc_range: str
    hiring_difficulty: str
    prep_timeline_weeks: int
    top_tips: List[str]
    confidence_note: str


# ── Helpers ───────────────────────────────────────────────────────────
def _check_eligibility(profile: dict, company: dict) -> tuple[str, List[str]]:
    """Returns (status, reasons). status ∈ {Eligible, Stretch, Not Eligible}."""
    reasons = []
    cgpa = float(profile.get("cgpa", 0))
    backlogs = int(profile.get("backlogs", 0))
    branch = profile.get("branch", "")
    dsa = int(profile.get("dsa_score", 0))
    apti = int(profile.get("aptitude_score", 0))

    hard_fails = 0
    soft_fails = 0

    # CGPA
    if cgpa < company["min_cgpa"] - 0.5:
        reasons.append(f"CGPA {cgpa} is well below minimum {company['min_cgpa']}")
        hard_fails += 1
    elif cgpa < company["min_cgpa"]:
        reasons.append(f"CGPA {cgpa} is just below minimum {company['min_cgpa']} (stretch zone)")
        soft_fails += 1
    else:
        reasons.append(f"✅ CGPA {cgpa} meets minimum {company['min_cgpa']}")

    # Backlogs
    if backlogs > company["max_backlogs"] + 1:
        reasons.append(f"{backlogs} backlogs exceeds limit ({company['max_backlogs']})")
        hard_fails += 1
    elif backlogs > company["max_backlogs"]:
        reasons.append(f"{backlogs} backlogs is above limit {company['max_backlogs']} (stretch)")
        soft_fails += 1
    else:
        reasons.append(f"✅ Backlogs ({backlogs}) within limit")

    # Branch
    if branch and branch not in company["preferred_branches"]:
        reasons.append(f"Branch {branch} is not in preferred list")
        soft_fails += 1
    else:
        reasons.append(f"✅ Branch {branch} accepted")

    # DSA / Aptitude soft checks
    if dsa < company["min_dsa"] - 15:
        reasons.append(f"DSA {dsa} far below expected {company['min_dsa']}")
        soft_fails += 1
    if apti < company["min_aptitude"] - 15:
        reasons.append(f"Aptitude {apti} far below expected {company['min_aptitude']}")
        soft_fails += 1

    # Verdict
    if hard_fails >= 1:
        status = "Not Eligible"
    elif soft_fails >= 2:
        status = "Stretch"
    elif soft_fails == 1:
        status = "Stretch"
    else:
        status = "Eligible"
    return status, reasons


def _compute_fit_score(profile: dict, company: dict) -> tuple[float, Dict[str, float]]:
    """Weighted fit score 0-100 with per-component breakdown."""
    cgpa = float(profile.get("cgpa", 0))
    dsa = int(profile.get("dsa_score", 0))
    apti = int(profile.get("aptitude_score", 0))
    comm = int(profile.get("communication_score", 0))
    resume = int(profile.get("resume_score", 0))
    projects = int(profile.get("projects", 0))
    internships = int(profile.get("internships", 0))
    backlogs = int(profile.get("backlogs", 0))

    tier = company["tier"]

    # Weight profile per tier (top product weighs DSA more, service weighs aptitude more)
    if tier == 1:
        weights = {"cgpa": 0.10, "dsa": 0.30, "apti": 0.10, "comm": 0.10,
                   "resume": 0.10, "projects": 0.15, "internships": 0.10, "backlog_pen": 0.05}
    elif tier == 2:
        weights = {"cgpa": 0.10, "dsa": 0.25, "apti": 0.15, "comm": 0.10,
                   "resume": 0.10, "projects": 0.15, "internships": 0.10, "backlog_pen": 0.05}
    else:
        weights = {"cgpa": 0.15, "dsa": 0.10, "apti": 0.30, "comm": 0.20,
                   "resume": 0.10, "projects": 0.05, "internships": 0.05, "backlog_pen": 0.05}

    breakdown = {
        "CGPA": weights["cgpa"] * (cgpa / 10) * 100,
        "DSA": weights["dsa"] * (dsa / 100) * 100,
        "Aptitude": weights["apti"] * (apti / 100) * 100,
        "Communication": weights["comm"] * (comm / 100) * 100,
        "Resume": weights["resume"] * (resume / 100) * 100,
        "Projects": weights["projects"] * min(projects, 5) / 5 * 100,
        "Internships": weights["internships"] * min(internships, 3) / 3 * 100,
    }
    backlog_penalty = weights["backlog_pen"] * min(backlogs, 5) / 5 * 100
    breakdown["Backlog Penalty"] = -backlog_penalty

    total = sum(breakdown.values())
    return round(max(0, min(100, total)), 1), {k: round(v, 1) for k, v in breakdown.items()}


def _identify_skill_gaps(profile: dict, company: dict) -> List[SkillGap]:
    """Identify the top skill gaps for this company."""
    gaps = []
    cgpa = float(profile.get("cgpa", 0))
    dsa = int(profile.get("dsa_score", 0))
    apti = int(profile.get("aptitude_score", 0))
    comm = int(profile.get("communication_score", 0))
    projects = int(profile.get("projects", 0))
    internships = int(profile.get("internships", 0))
    backlogs = int(profile.get("backlogs", 0))

    if dsa < company["min_dsa"]:
        delta = company["min_dsa"] - dsa
        gaps.append(SkillGap(
            skill="DSA Proficiency",
            importance="High" if company["tier"] <= 2 else "Medium",
            description=f"Need to improve DSA score by ~{delta} points (current {dsa}, target {company['min_dsa']}+).",
            fix_effort_weeks=max(4, delta // 5),
        ))
    if apti < company["min_aptitude"]:
        delta = company["min_aptitude"] - apti
        gaps.append(SkillGap(
            skill="Aptitude",
            importance="High" if company["tier"] == 3 else "Medium",
            description=f"Aptitude score needs ~{delta}-point improvement (target {company['min_aptitude']}+).",
            fix_effort_weeks=max(2, delta // 8),
        ))
    if cgpa < company["min_cgpa"]:
        gaps.append(SkillGap(
            skill="Academic CGPA",
            importance="Medium",
            description=f"CGPA below cutoff. If possible, improve via remaining semesters or backlog clearance.",
            fix_effort_weeks=12,
        ))
    if comm < 60 and company["tier"] == 3:
        gaps.append(SkillGap(
            skill="Communication",
            importance="High",
            description="Service companies heavily test communication. Practice mock HR rounds.",
            fix_effort_weeks=4,
        ))
    if projects < 2 and company["tier"] <= 2:
        gaps.append(SkillGap(
            skill="Projects",
            importance="High",
            description=f"Need at least 2-3 substantial projects. You have {projects}.",
            fix_effort_weeks=6,
        ))
    if internships < 1 and company["tier"] == 1:
        gaps.append(SkillGap(
            skill="Industry Experience",
            importance="Medium",
            description="Top product companies favor candidates with internships/research experience.",
            fix_effort_weeks=8,
        ))
    if backlogs > company["max_backlogs"]:
        gaps.append(SkillGap(
            skill="Active Backlogs",
            importance="High",
            description=f"You have {backlogs} backlog(s). Clear them before applying.",
            fix_effort_weeks=8,
        ))

    if "System Design" in company["key_skills"] and company["tier"] == 1 and projects < 4:
        gaps.append(SkillGap(
            skill="System Design",
            importance="Medium",
            description="Top product roles ask LLD/HLD. Study scalability patterns.",
            fix_effort_weeks=6,
        ))
    return gaps


def _matched_and_missing(profile: dict, company: dict) -> tuple[List[str], List[str]]:
    """Plain-text strengths/gaps for UI badges."""
    matched, missing = [], []
    cgpa = float(profile.get("cgpa", 0))
    dsa = int(profile.get("dsa_score", 0))
    apti = int(profile.get("aptitude_score", 0))
    backlogs = int(profile.get("backlogs", 0))
    branch = profile.get("branch", "")
    projects = int(profile.get("projects", 0))
    internships = int(profile.get("internships", 0))

    if cgpa >= company["min_cgpa"]:
        matched.append(f"CGPA {cgpa} meets bar")
    else:
        missing.append("CGPA below cutoff")
    if dsa >= company["min_dsa"]:
        matched.append(f"DSA {dsa}/100 meets bar")
    else:
        missing.append("DSA below expected")
    if apti >= company["min_aptitude"]:
        matched.append(f"Aptitude {apti}/100 meets bar")
    else:
        missing.append("Aptitude below expected")
    if backlogs <= company["max_backlogs"]:
        matched.append("No blocking backlogs")
    else:
        missing.append("Active backlogs")
    if branch in company["preferred_branches"]:
        matched.append(f"Branch {branch} preferred")
    else:
        missing.append("Branch not preferred")
    if projects >= 2:
        matched.append(f"{projects} projects")
    else:
        missing.append("Need more projects")
    if internships >= 1:
        matched.append(f"{internships} internship(s)")
    elif company["tier"] <= 2:
        missing.append("No internship experience")
    return matched, missing


def _calibrate_probability(base_prob: float, fit_score: float, eligibility: str) -> float:
    """Adjust the global ML probability for this specific company."""
    fit_factor = fit_score / 100.0
    if eligibility == "Not Eligible":
        return round(max(0.02, base_prob * 0.15 * fit_factor), 4)
    if eligibility == "Stretch":
        return round(max(0.05, base_prob * 0.55 * (0.5 + fit_factor / 2)), 4)
    return round(min(0.97, base_prob * (0.6 + 0.6 * fit_factor)), 4)


def _build_match(profile: dict, company: dict, base_probability: float) -> CompanyMatch:
    eligibility, reasons = _check_eligibility(profile, company)
    fit_score, breakdown = _compute_fit_score(profile, company)
    skill_gaps = _identify_skill_gaps(profile, company)
    matched, missing = _matched_and_missing(profile, company)
    calibrated = _calibrate_probability(base_probability, fit_score, eligibility)

    if eligibility == "Eligible":
        confidence_note = "Strong fit. Apply with confidence; focus on interview prep."
    elif eligibility == "Stretch":
        confidence_note = "Borderline fit. Apply, but prioritize closing the listed gaps first."
    else:
        confidence_note = "Currently below cutoff. Treat as a long-term goal — fix gaps to qualify."

    return CompanyMatch(
        company_name=company["name"],
        tier=str(company["tier"]),
        tier_label=company["tier_label"],
        domain=company["domain"],
        eligibility=eligibility,
        eligibility_reasons=reasons,
        fit_score=fit_score,
        fit_breakdown=breakdown,
        calibrated_probability=calibrated,
        skill_gaps=skill_gaps,
        matched_factors=matched,
        missing_factors=missing,
        hiring_format_summary=company["hiring_format"],
        ctc_range=company["ctc_range"],
        hiring_difficulty=company["hiring_difficulty"],
        prep_timeline_weeks=company["prep_weeks"],
        top_tips=company["tips"],
        confidence_note=confidence_note,
    )


# ── Public API ────────────────────────────────────────────────────────
def match_student_to_one_company(profile: dict, company_name: str, base_probability: float) -> CompanyMatch:
    company = get_company(company_name)
    if not company:
        raise ValueError(f"Unknown company: {company_name}")
    return _build_match(profile, company, base_probability)


def match_student_to_companies(profile: dict, base_probability: float) -> Dict[str, List[CompanyMatch]]:
    """Run matcher across all 14 companies, bucket into eligible/stretch/not_eligible."""
    eligible, stretch, not_eligible = [], [], []
    for company in COMPANY_DB.values():
        m = _build_match(profile, company, base_probability)
        if m.eligibility == "Eligible":
            eligible.append(m)
        elif m.eligibility == "Stretch":
            stretch.append(m)
        else:
            not_eligible.append(m)

    eligible.sort(key=lambda m: m.fit_score, reverse=True)
    stretch.sort(key=lambda m: m.fit_score, reverse=True)
    not_eligible.sort(key=lambda m: m.fit_score, reverse=True)
    return {"eligible": eligible, "stretch": stretch, "not_eligible": not_eligible}


if __name__ == "__main__":
    sample = {
        "branch": "CSE", "cgpa": 8.0, "dsa_score": 70,
        "projects": 3, "internships": 1, "certifications": 3,
        "hackathons": 2, "backlogs": 0,
        "aptitude_score": 75, "communication_score": 70, "resume_score": 65,
    }
    result = match_student_to_companies(sample, base_probability=0.72)
    print(f"Eligible: {len(result['eligible'])}")
    print(f"Stretch:  {len(result['stretch'])}")
    print(f"Not Eligible: {len(result['not_eligible'])}")
    print("\nTop Eligible matches:")
    for m in result["eligible"][:5]:
        print(f"  {m.company_name:12s} | Fit: {m.fit_score:5.1f} | Prob: {m.calibrated_probability:.2f}")