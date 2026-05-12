"""
src/gemini_advisor.py
Gemini 1.5 Flash wrappers for: career advisor report, roadmap,
resume bullet improvement, mock interview Q&A.

All functions have safe fallbacks if the API key is missing or fails,
so the app keeps working even without a key.
"""
import os
import json
import google.generativeai as genai

# ── Config ────────────────────────────────────────────────────────────
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "").strip()
MODEL_NAME = "gemini-2.5-flash"

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)


def _model():
    return genai.GenerativeModel(MODEL_NAME)


def _safe_generate(prompt: str, fallback: str = "AI service is currently unavailable. Please try again later.") -> str:
    """Run a Gemini prompt with graceful failure."""
    if not GEMINI_KEY:
        return "⚠️ GEMINI_API_KEY is not configured. Add it to backend/.env to enable AI features."
    try:
        resp = _model().generate_content(prompt)
        return (resp.text or "").strip() or fallback
    except Exception as e:
        return f"{fallback}\n\n(Error: {str(e)[:120]})"


def _safe_generate_json(prompt: str, fallback: dict) -> dict:
    """Run a Gemini prompt expecting JSON output. Strips markdown fences."""
    if not GEMINI_KEY:
        return fallback
    try:
        resp = _model().generate_content(prompt)
        text = (resp.text or "").strip()
        # Strip ```json ... ``` fences
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip("` \n")
        return json.loads(text)
    except Exception:
        return fallback


# ── 1. Career Advisor Report ──────────────────────────────────────────
def get_gemini_suggestions(profile: dict, placement_probability: float, predicted_ctc: float) -> str:
    """Generate a personalized placement readiness report."""
    prompt = f"""You are a career counselor for Indian engineering students preparing for campus placements.

Student Profile:
- Branch: {profile.get('branch')}
- CGPA: {profile.get('cgpa')}
- DSA Score: {profile.get('dsa_score')}/100
- Projects: {profile.get('projects')}
- Internships: {profile.get('internships')}
- Certifications: {profile.get('certifications')}
- Hackathons: {profile.get('hackathons')}
- Backlogs: {profile.get('backlogs')}
- Aptitude Score: {profile.get('aptitude_score')}/100
- Communication: {profile.get('communication_score')}/100
- Resume Score: {profile.get('resume_score')}/100

ML Predictions:
- Placement Probability: {placement_probability * 100:.1f}%
- Predicted CTC: ₹{predicted_ctc:.2f} LPA

Write a personalized, encouraging placement readiness report in markdown with these sections:

## 🎯 Placement Readiness Snapshot
2-3 sentences summarizing where they stand.

## 💪 Top 3 Strengths
Bulleted list with brief reasoning.

## ⚠️ Top 3 Improvement Areas
Bulleted list, prioritized by impact.

## 🚀 Action Plan (Next 30 / 60 / 90 Days)
Concrete, week-by-week actionable steps.

## 🏢 Realistic Company Targets
Suggest 2-3 tier ranges (Service, Product Mid, Top Product).

Be specific, motivating, and use concrete numbers/resources."""
    return _safe_generate(prompt, "Could not generate advisor report.")


# ── 2. Roadmap ────────────────────────────────────────────────────────
def get_roadmap(profile: dict, target_company: str = "top product companies") -> str:
    """Generate a study roadmap toward a target company."""
    prompt = f"""You are a placement coach. Build a focused preparation roadmap.

Student profile: {json.dumps(profile, indent=2)}
Target: {target_company}

Output a markdown roadmap with these sections:

## 🎯 Goal
One-line target.

## 📅 Phase 1 — Foundation (Weeks 1-4)
Specific topics, daily time, and resources.

## 📈 Phase 2 — Skill Building (Weeks 5-8)
Projects, advanced DSA, mock contests.

## 🏁 Phase 3 — Interview Sprint (Weeks 9-12)
Mock interviews, system design, behavioral prep.

## 📚 Recommended Resources
Books, websites, YouTube channels (Indian context preferred).

## ✅ Weekly Milestones
Clear KPIs to track progress.

Be specific. Use exact platforms (LeetCode, Striver SDE Sheet, GFG, etc.)."""
    return _safe_generate(prompt, "Could not generate roadmap.")


# ── 3. Resume Bullet Improver ─────────────────────────────────────────
def improve_resume_bullet(bullet: str) -> str:
    """Rewrite a resume bullet using strong action verbs + quantification."""
    prompt = f"""You are an expert resume coach. Rewrite this resume bullet point to be more impactful.

Original bullet:
"{bullet}"

Requirements:
- Start with a strong action verb (Built, Architected, Optimized, Reduced, Led, etc.)
- Add quantification (numbers, %, time saved, users, performance gains) — invent realistic metrics if needed and clearly mark them as [example metric]
- Highlight technologies/tools used
- Keep it concise (1-2 lines)
- Use the STAR pattern implicitly (Situation/Task → Action → Result)

Output exactly this format:

**Improved Bullet:**
<rewritten bullet>

**Why It's Better:**
- <reason 1>
- <reason 2>
- <reason 3>

**Variations:**
1. <alternative 1>
2. <alternative 2>"""
    return _safe_generate(prompt, "Could not improve bullet.")


# ── 4. Mock Interview Question ────────────────────────────────────────
def get_mock_interview_question(domain: str, company: str = "", difficulty: str = "Medium") -> dict:
    """Generate a single mock interview question with structured fields."""
    company_ctx = f" for a {company} interview" if company else ""
    prompt = f"""Generate ONE realistic {difficulty}-difficulty {domain} interview question{company_ctx}.

Return ONLY valid JSON (no markdown, no prose):
{{
  "question": "...",
  "category": "{domain}",
  "difficulty": "{difficulty}",
  "expected_topics": ["topic1", "topic2", "topic3"],
  "hints": ["hint1", "hint2"],
  "follow_ups": ["follow-up question 1", "follow-up question 2"],
  "ideal_approach": "2-3 sentence summary of how to solve/answer it"
}}"""
    fallback = {
        "question": f"Sample {domain} question: Explain a concept you find interesting in {domain}.",
        "category": domain,
        "difficulty": difficulty,
        "expected_topics": ["fundamentals"],
        "hints": ["Think about real-world applications"],
        "follow_ups": ["Can you give an example?"],
        "ideal_approach": "Structure your answer using STAR or topic → example → impact.",
    }
    return _safe_generate_json(prompt, fallback)


# ── 5. Evaluate Interview Answer ──────────────────────────────────────
def evaluate_interview_answer(question: str, answer: str, domain: str) -> dict:
    """Score an interview answer and give detailed feedback."""
    prompt = f"""You are an interview coach evaluating a candidate's answer.

Domain: {domain}
Question: {question}
Candidate Answer: {answer}

Evaluate and return ONLY valid JSON (no markdown):
{{
  "score": <int 0-100>,
  "verdict": "Excellent" | "Good" | "Average" | "Needs Work" | "Poor",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "missing_points": ["..."],
  "improved_answer": "A model answer in 3-5 sentences",
  "tips": ["tip 1", "tip 2", "tip 3"]
}}"""
    fallback = {
        "score": 50,
        "verdict": "Average",
        "strengths": ["Attempt was made"],
        "weaknesses": ["Could not auto-evaluate"],
        "missing_points": [],
        "improved_answer": "Unable to generate model answer right now.",
        "tips": ["Practice using the STAR framework", "Add specific examples"],
    }
    return _safe_generate_json(prompt, fallback)


if __name__ == "__main__":
    # Smoke test (requires GEMINI_API_KEY in env)
    sample = {
        "branch": "CSE", "cgpa": 8.2, "dsa_score": 70,
        "projects": 3, "internships": 1, "certifications": 3,
        "hackathons": 2, "backlogs": 0,
        "aptitude_score": 75, "communication_score": 70, "resume_score": 65,
    }
    print("=== Advisor Report ===")
    print(get_gemini_suggestions(sample, 0.78, 9.5)[:400], "...\n")
    print("=== Bullet Improver ===")
    print(improve_resume_bullet("Made a website using React")[:400])