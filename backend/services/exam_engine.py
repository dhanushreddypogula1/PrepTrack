"""Adaptive MCQ exam engine — Gemini question generation + scoring."""
import json, os, random
from typing import List, Dict, Any
from datetime import datetime, timedelta
import google.generativeai as genai
from backend.schemas import ExamConfig, ExamQuestion, MCQOption, ExamResult

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

DOMAIN_TOPICS = {
    "DSA": ["Arrays", "Linked Lists", "Trees", "Graphs", "DP", "Sorting", "Hashing", "Recursion"],
    "OOPS/DBMS/OS": ["Inheritance", "Polymorphism", "Normalization", "SQL", "Process Scheduling", "Memory Management"],
    "Aptitude": ["Time-Speed-Distance", "Percentages", "Profit-Loss", "Permutations", "Series"],
    "Verbal": ["Reading Comprehension", "Error Spotting", "Synonyms", "Fill in Blanks"],
    "System Design": ["Load Balancing", "Caching", "Database Sharding", "Microservices", "CAP Theorem"],
    "HR Behavioral": ["STAR Method", "Leadership", "Conflict Resolution", "Teamwork", "Failure Handling"],
}

def _generate_questions_batch(domain: str, difficulty: str, count: int, company: str = "") -> List[Dict]:
    topics = random.sample(DOMAIN_TOPICS.get(domain, ["General"]), min(3, len(DOMAIN_TOPICS.get(domain, ["General"]))))
    company_ctx = f"tailored for a {company} interview" if company else "for Indian engineering placements"
    prompt = f"""Generate exactly {count} multiple-choice questions for {domain} domain, difficulty: {difficulty}, {company_ctx}.
Topics to cover: {', '.join(topics)}.

Return ONLY a JSON array with this exact structure:
[
  {{
    "question": "...",
    "options": [{{"key": "A", "text": "..."}}, {{"key": "B", "text": "..."}}, {{"key": "C", "text": "..."}}, {{"key": "D", "text": "..."}}],
    "correct": "A",
    "explanation": "..."
  }}
]

Rules: No markdown, no prose, ONLY valid JSON array. Each question must have exactly 4 options A/B/C/D."""
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        return _fallback_questions(domain, count)

def _fallback_questions(domain: str, count: int) -> List[Dict]:
    """Simple fallback if Gemini fails."""
    return [{
        "question": f"Sample {domain} question {i+1}: What is the time complexity of binary search?",
        "options": [{"key": "A", "text": "O(n)"}, {"key": "B", "text": "O(log n)"}, {"key": "C", "text": "O(n²)"}, {"key": "D", "text": "O(1)"}],
        "correct": "B",
        "explanation": "Binary search divides the search space in half each iteration."
    } for i in range(count)]

def generate_exam(config: ExamConfig) -> tuple[List[ExamQuestion], datetime]:
    """Returns (questions_with_correct, expiry_datetime)."""
    per_domain = max(1, config.num_questions // len(config.domains))
    all_questions: List[ExamQuestion] = []
    qid = 1

    for domain in config.domains:
        diff = config.difficulty if config.difficulty != "mixed" else random.choice(["easy", "medium", "hard"])
        raw = _generate_questions_batch(domain.value, diff, per_domain, config.company_context or "")
        for q in raw:
            all_questions.append(ExamQuestion(
                id=qid,
                domain=domain.value,
                difficulty=diff,
                question=q["question"],
                options=[MCQOption(**o) for o in q["options"]],
                explanation=q.get("explanation"),
                correct_key=q["correct"],
            ))
            qid += 1

    random.shuffle(all_questions)
    expires_at = datetime.utcnow() + timedelta(minutes=config.duration_minutes + 2)
    return all_questions[:config.num_questions], expires_at


def score_exam(
    questions: List[Dict],  # stored with correct_key
    answers: Dict[int, str],
    time_taken: int,
    tab_switches: int
) -> ExamResult:
    domain_stats: Dict[str, Dict[str, int]] = {}
    question_results = []
    correct_count = 0

    for q in questions:
        qid = q["id"]
        domain = q["domain"]
        selected = answers.get(qid, "")
        is_correct = selected == q.get("correct_key", "")
        if is_correct:
            correct_count += 1

        if domain not in domain_stats:
            domain_stats[domain] = {"correct": 0, "total": 0}
        domain_stats[domain]["total"] += 1
        if is_correct:
            domain_stats[domain]["correct"] += 1

        question_results.append({
            "id": qid,
            "question": q["question"],
            "selected": selected,
            "correct": q.get("correct_key"),
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
        })

    total = len(questions)
    score = (correct_count / total * 100) if total else 0

    # Tab-switch penalty
    if tab_switches > 3:
        score = max(0, score - tab_switches * 2)

    weak_areas = [d for d, s in domain_stats.items() if s["total"] > 0 and s["correct"] / s["total"] < 0.5]

    percentile = score  # simplified estimate
    if score >= 90: rank = "Top 5% — Excellent"
    elif score >= 75: rank = "Top 20% — Good"
    elif score >= 60: rank = "Top 40% — Average"
    elif score >= 45: rank = "Bottom 40% — Needs Work"
    else: rank = "Bottom 20% — Significant Study Needed"

    return ExamResult(
        attempt_id=0,  # filled by router
        score=round(score, 1),
        correct=correct_count,
        total=total,
        time_taken_seconds=time_taken,
        domain_breakdown=domain_stats,
        weak_areas=weak_areas,
        rank_estimate=rank,
        question_results=question_results,
    )
