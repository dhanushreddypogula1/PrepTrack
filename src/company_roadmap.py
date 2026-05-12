"""
src/company_roadmap.py
Gemini-powered:
  - generate_company_roadmap : detailed prep plan for ONE company
  - generate_skill_gap_plan  : focused fix plan for the listed skill gaps
  - compare_companies        : side-by-side comparison of multiple targets

All functions return markdown strings.
"""
import json
from typing import List, Dict
from src.gemini_advisor import _safe_generate
from src.company_data import get_company


# ── 1. Single-company roadmap ─────────────────────────────────────────
def generate_company_roadmap(profile: dict, company_name: str, match) -> str:
    """
    Build a personalized roadmap for ONE company.
    `match` is a CompanyMatch dataclass instance.
    """
    company = get_company(company_name) or {}

    skill_gaps_str = "\n".join(
        f"  - {g.skill} ({g.importance}, ~{g.fix_effort_weeks}w): {g.description}"
        for g in match.skill_gaps
    ) or "  (none — strong fit!)"

    prompt = f"""You are a placement coach building a focused roadmap for one specific company.

Student Profile:
{json.dumps(profile, indent=2)}

Target Company: {company_name}
- Tier: {match.tier_label}
- Domain: {company.get('domain', '')}
- CTC Range: {match.ctc_range}
- Hiring Format: {match.hiring_format_summary}
- Hiring Difficulty: {match.hiring_difficulty}
- Key Skills Required: {', '.join(company.get('key_skills', []))}

Current Match Status:
- Eligibility: {match.eligibility}
- Fit Score: {match.fit_score}/100
- Calibrated Hire Probability: {match.calibrated_probability * 100:.1f}%

Identified Skill Gaps:
{skill_gaps_str}

Build a markdown roadmap with these sections:

## 🎯 Goal
1-line description of what we're aiming at (role + CTC).

## 📊 Current Standing
2-3 sentences honestly assessing where the student is vs. {company_name}'s bar.

## 📅 Phase 1 — Close Critical Gaps (Weeks 1-{max(4, match.prep_timeline_weeks // 3)})
Concrete weekly tasks targeting the listed skill gaps. Mention specific resources.

## 📈 Phase 2 — Skill Building (Weeks {max(5, match.prep_timeline_weeks // 3 + 1)}-{max(8, 2 * match.prep_timeline_weeks // 3)})
DSA, projects, mock contests focused on {company_name} interview style.

## 🏁 Phase 3 — Interview Sprint (Weeks {max(9, 2 * match.prep_timeline_weeks // 3 + 1)}-{match.prep_timeline_weeks})
Mock interviews, behavioral prep, system design (if applicable).

## 📚 Recommended Resources
Books/sites/YouTube specific to {company_name}'s style.

## ✅ Weekly KPIs
Trackable goals (e.g., 'Solve 25 LeetCode mediums/week').

## 💡 {company_name}-specific Tips
{chr(10).join('  - ' + t for t in match.top_tips[:4])}

Be specific. Use real platforms. Reference Indian campus context."""
    return _safe_generate(prompt, f"Could not generate roadmap for {company_name}.")


# ── 2. Skill-gap fix plan ─────────────────────────────────────────────
def generate_skill_gap_plan(profile: dict, skill_gaps: List, company_name: str) -> str:
    """Focused plan to close ONLY the listed skill gaps."""
    if not skill_gaps:
        return f"## 🎉 No major gaps for {company_name}!\n\nYou're well-positioned. Focus on interview prep and consolidating your strengths."

    gaps_str = "\n".join(
        f"  {i+1}. {g.skill} (importance: {g.importance}, est. {g.fix_effort_weeks} weeks)\n     {g.description}"
        for i, g in enumerate(skill_gaps)
    )

    prompt = f"""You are a placement coach. Build a tactical plan to close these specific skill gaps for {company_name}.

Student Profile:
{json.dumps(profile, indent=2)}

Skill Gaps to Close (in priority order):
{gaps_str}

Output a markdown plan with these sections:

## 🎯 Mission
1-line summary.

## 🚨 Priority Order
Which gap to attack first and why.

## 📅 Week-by-Week Action Plan
For each gap, give:
  - **Week range**
  - **Daily time commitment**
  - **Specific resources** (LeetCode lists, books, YouTube channels)
  - **Trackable milestone** (e.g., "Solve 50 medium-level array problems")

## 🛠️ Tools & Resources
Concrete platforms, books, mock interview sites.

## 🚦 Stop-Loss Checkpoints
At weeks 4, 8, 12 — what should you have completed?

## 💡 Pro Tips
3-5 high-leverage habits.

Be tactical. Use Indian engineering campus context."""
    return _safe_generate(prompt, "Could not generate skill-gap plan.")


# ── 3. Compare multiple companies ─────────────────────────────────────
def compare_companies(profile: dict, company_names: List[str], match_result: Dict) -> str:
    """
    Side-by-side comparison of multiple target companies.
    `match_result` is the dict from match_student_to_companies().
    """
    if not company_names:
        return "Please select at least 2 companies to compare."

    # Flatten all matches into a lookup
    all_matches = {}
    for bucket in ("eligible", "stretch", "not_eligible"):
        for m in match_result.get(bucket, []):
            all_matches[m.company_name] = (m, bucket)

    # Build a comparison table block for the prompt
    rows = []
    for name in company_names:
        if name not in all_matches:
            continue
        m, bucket = all_matches[name]
        rows.append({
            "company": name,
            "tier": m.tier_label,
            "eligibility": m.eligibility,
            "fit_score": m.fit_score,
            "calibrated_prob_percent": round(m.calibrated_probability * 100, 1),
            "ctc_range": m.ctc_range,
            "difficulty": m.hiring_difficulty,
            "prep_weeks": m.prep_timeline_weeks,
            "key_gaps": [g.skill for g in m.skill_gaps[:3]],
            "top_strengths": m.matched_factors[:3],
        })

    if not rows:
        return "None of the selected companies were found in the analysis."

    prompt = f"""You are a placement coach helping a student choose between multiple target companies.

Student Profile:
{json.dumps(profile, indent=2)}

Comparison Data:
{json.dumps(rows, indent=2)}

Write a markdown comparison report with these sections:

## 📊 At-a-Glance Comparison Table
A markdown table comparing: Company | Tier | Eligibility | Fit | Hire Prob | CTC | Prep Weeks

## 🥇 Best Fit Right Now
Which company gives the highest realistic chance + reasoning.

## 🚀 Best Long-Term Stretch Goal
Which one is worth working hard for.

## ⚖️ Trade-offs
Honest pros/cons of each (CTC vs difficulty vs prep time vs domain interest).

## 🎯 Recommended Application Strategy
How to allocate effort across these companies (e.g., "Apply to TCS and Wipro as safety, Flipkart as primary, Google as stretch").

## 💡 Final Verdict
A 2-3 sentence direct recommendation.

Be honest, balanced, and Indian-campus-context aware."""
    return _safe_generate(prompt, "Could not generate company comparison.")


if __name__ == "__main__":
    # Smoke test
    from src.company_matcher import match_student_to_companies, match_student_to_one_company

    sample = {
        "branch": "CSE", "cgpa": 8.0, "dsa_score": 70,
        "projects": 3, "internships": 1, "certifications": 3,
        "hackathons": 2, "backlogs": 0,
        "aptitude_score": 75, "communication_score": 70, "resume_score": 65,
    }

    print("=== Roadmap for TCS ===")
    m = match_student_to_one_company(sample, "TCS", 0.72)
    print(generate_company_roadmap(sample, "TCS", m)[:500], "...\n")

    print("=== Compare TCS vs Infosys vs Flipkart ===")
    result = match_student_to_companies(sample, 0.72)
    print(compare_companies(sample, ["TCS", "Infosys", "Flipkart"], result)[:500])