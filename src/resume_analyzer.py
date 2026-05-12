"""
src/resume_analyzer.py

PDF resume → role detection + dynamic ATS score + section detection +
action verb analysis + quantification check + contact info detection +
Gemini-generated feedback.

Returns a flat dict matching backend.schemas.ResumeAnalysisOut.
"""

import re
import json
from typing import IO, List, Dict, Any

import pdfplumber

from src.gemini_advisor import _safe_generate


# ── Config ────────────────────────────────────────────────────────────

TEXT_PREVIEW_LIMIT = 8000


# Fallback keywords if Gemini fails or API key is missing.
FALLBACK_ATS_KEYWORDS = [
    "python", "java", "javascript", "typescript", "c++", "sql", "nosql",
    "react", "node", "django", "flask", "fastapi", "aws", "azure", "gcp",
    "docker", "kubernetes", "git", "linux", "rest api", "graphql",
    "machine learning", "deep learning", "data structures", "algorithms",
    "tensorflow", "pytorch", "agile", "scrum", "ci/cd",
    "pandas", "numpy", "scikit-learn", "mysql", "postgresql",
    "html", "css", "next.js", "tailwind", "api", "backend",
]


STRONG_VERBS = {
    "achieved", "architected", "built", "created", "delivered", "designed",
    "developed", "engineered", "implemented", "improved", "increased", "led",
    "launched", "managed", "optimized", "reduced", "spearheaded", "streamlined",
    "automated", "deployed", "integrated", "migrated", "scaled", "shipped",
    "founded", "negotiated", "presented", "published", "researched",
}


WEAK_VERBS = {
    "did", "made", "worked", "helped", "assisted", "responsible", "involved",
    "participated", "handled",
}


SECTION_HEADERS = {
    "education": ["education", "academic", "qualifications"],
    "experience": ["experience", "work experience", "professional experience", "employment", "internship"],
    "skills": ["skills", "technical skills", "core competencies"],
    "projects": ["projects", "personal projects", "academic projects"],
    "certifications": ["certifications", "certificates", "achievements"],
    "summary": ["summary", "objective", "profile", "about"],
}


# ── Helpers ───────────────────────────────────────────────────────────

def _clean_text(text: str) -> str:
    """
    Normalize some PDF extraction artifacts.
    Example: (cid:127) often appears instead of bullets/separators.
    """
    if not text:
        return ""

    replacements = {
        "(cid:127)": "•",
        "(cid:8226)": "•",
        "\x00": "",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Normalize too many blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def _extract_json_object(raw: str) -> Dict[str, Any]:
    """
    Gemini may return JSON inside markdown fences.
    This safely extracts the first JSON object.
    """
    if not raw:
        return {}

    cleaned = raw.strip()

    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1 or end <= start:
        return {}

    json_text = cleaned[start:end + 1]

    try:
        return json.loads(json_text)
    except Exception:
        return {}


def _normalize_keywords(keywords: List[str]) -> List[str]:
    cleaned = []

    for kw in keywords or []:
        if not isinstance(kw, str):
            continue

        item = kw.strip().lower()

        if not item:
            continue

        if item not in cleaned:
            cleaned.append(item)

    return cleaned


# ── PDF text extraction ───────────────────────────────────────────────

def _extract_text(file_obj: IO) -> str:
    """
    Extracts visible PDF text.

    Also tries to extract hidden hyperlink URLs from PDF annotations.
    This helps detect GitHub/LinkedIn when the PDF only shows visible text like:
    'GitHub | LinkedIn'
    but the real URLs are embedded as hyperlinks.
    """
    text_parts = []
    link_parts = []

    try:
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text_parts.append(page_text)

                # Try pdfplumber hyperlink extraction
                try:
                    hyperlinks = getattr(page, "hyperlinks", []) or []
                    for link in hyperlinks:
                        uri = link.get("uri") or link.get("url")
                        if uri:
                            link_parts.append(uri)
                except Exception:
                    pass

                # Try annotation extraction fallback
                try:
                    annots = getattr(page, "annots", []) or []
                    for annot in annots:
                        uri = None

                        if isinstance(annot, dict):
                            uri = (
                                annot.get("uri")
                                or annot.get("url")
                                or annot.get("URI")
                            )

                            data = annot.get("data")
                            if not uri and isinstance(data, dict):
                                action = data.get("A")
                                if isinstance(action, dict):
                                    uri = action.get("URI") or action.get("uri")

                        if uri:
                            link_parts.append(str(uri))
                except Exception:
                    pass

    except Exception:
        return ""

    combined = "\n".join(text_parts)

    if link_parts:
        unique_links = []
        for link in link_parts:
            if link not in unique_links:
                unique_links.append(link)

        combined += "\n\nExtracted Links:\n" + "\n".join(unique_links)

    return _clean_text(combined)


# ── Gemini role intelligence ──────────────────────────────────────────

def _detect_role_and_keywords(text: str) -> dict:
    """
    Uses Gemini to detect the candidate's target role and generate role-specific ATS keywords.
    Falls back to a safe default if Gemini fails.
    """
    preview = text[:3500]

    prompt = f"""
You are an expert technical recruiter and ATS resume evaluator.

Analyze this resume text and infer the best target role for the candidate.

Resume text:
---
{preview}
---

Return ONLY valid JSON. Do not use markdown.

Schema:
{{
  "detected_role": "string",
  "role_confidence": 0.0,
  "suggested_roles": ["string", "string", "string"],
  "ats_keywords": ["keyword1", "keyword2", "keyword3"]
}}

Rules:
- detected_role should be specific, for example:
  "Backend Developer", "ML Engineer", "Full Stack Developer", "Data Analyst", "Frontend Developer".
- role_confidence must be a number between 0 and 1.
- suggested_roles should contain 3 to 5 realistic roles.
- ats_keywords should contain 20 to 35 ATS keywords relevant to the detected role.
- Include programming languages, frameworks, databases, tools, CS concepts, and domain skills.
- Keep keywords short and searchable.
"""

    raw = _safe_generate(prompt, "")
    parsed = _extract_json_object(raw)

    detected_role = parsed.get("detected_role", "Software Developer")
    role_confidence = parsed.get("role_confidence", 0.5)
    suggested_roles = parsed.get("suggested_roles", [])
    ats_keywords = parsed.get("ats_keywords", [])

    if not isinstance(detected_role, str) or not detected_role.strip():
        detected_role = "Software Developer"

    try:
        role_confidence = float(role_confidence)
    except Exception:
        role_confidence = 0.5

    role_confidence = max(0.0, min(1.0, role_confidence))

    if not isinstance(suggested_roles, list) or not suggested_roles:
        suggested_roles = [
            "Backend Developer",
            "Full Stack Developer",
            "ML Engineer",
        ]

    suggested_roles = [
        str(role).strip()
        for role in suggested_roles
        if str(role).strip()
    ][:5]

    ats_keywords = _normalize_keywords(ats_keywords)

    if len(ats_keywords) < 8:
        ats_keywords = FALLBACK_ATS_KEYWORDS

    return {
        "detected_role": detected_role.strip(),
        "role_confidence": role_confidence,
        "suggested_roles": suggested_roles,
        "ats_keywords": ats_keywords,
    }


# ── Section detection ─────────────────────────────────────────────────

def _detect_sections(text: str) -> dict:
    text_lower = text.lower()

    found = {}

    for canonical, variants in SECTION_HEADERS.items():
        found[canonical] = any(
            re.search(rf"\b{re.escape(v)}\b", text_lower)
            for v in variants
        )

    score = round(sum(found.values()) / len(SECTION_HEADERS) * 100, 1)

    return {
        "detected": found,
        "found_sections": [name for name, exists in found.items() if exists],
        "missing_sections": [name for name, exists in found.items() if not exists],
        "score": score,
    }


# ── ATS keyword matching ──────────────────────────────────────────────

def _ats_analysis(text: str, ats_keywords: List[str]) -> dict:
    text_lower = text.lower()

    keywords = _normalize_keywords(ats_keywords)

    if not keywords:
        keywords = FALLBACK_ATS_KEYWORDS

    matched = []
    missing = []

    for kw in keywords:
        # Simple phrase search. Good enough for ATS-style matching.
        if kw in text_lower:
            matched.append(kw)
        else:
            missing.append(kw)

    score = round((len(matched) / max(1, len(keywords))) * 100, 1)

    return {
        "role_based_keywords": keywords,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "matched_count": len(matched),
        "total_checked": len(keywords),
        "score": score,
    }


# ── Action verb analysis ──────────────────────────────────────────────

def _verb_analysis(text: str) -> dict:
    words = re.findall(r"\b[A-Za-z]+\b", text.lower())

    strong_used = sorted({w for w in words if w in STRONG_VERBS})
    weak_used = sorted({w for w in words if w in WEAK_VERBS})

    strong_count = sum(1 for w in words if w in STRONG_VERBS)
    weak_count = sum(1 for w in words if w in WEAK_VERBS)

    if strong_count + weak_count == 0:
        score = 50.0
    else:
        ratio = strong_count / (strong_count + weak_count)
        score = round(ratio * 100, 1)

    return {
        "strong_verbs_used": strong_used,
        "weak_verbs_used": weak_used,
        "strong_count": strong_count,
        "weak_count": weak_count,
        "score": score,
    }


# ── Quantification analysis ───────────────────────────────────────────

def _quantification_analysis(text: str) -> dict:
    """
    Measures how many meaningful lines contain numeric impact:
    %, x, users, hours, days, months, ms, etc.
    """
    lines = [line.strip() for line in text.split("\n") if len(line.strip()) > 10]

    quantified = 0

    pattern = re.compile(
        r"\b\d+[\.,]?\d*\s*(%|k|m|x|users|hours|days|weeks|months|seconds|ms|gb|mb|tb)\b",
        re.I,
    )

    for line in lines:
        if pattern.search(line) or re.search(r"\$\s?\d|\d{2,}\+", line):
            quantified += 1

    total = max(1, len(lines))
    percentage = quantified / total * 100

    # If 50% of meaningful lines are quantified, give full score.
    score = round(min(100, percentage * 2), 1)

    return {
        "total_lines": total,
        "quantified_lines": quantified,
        "percentage": round(percentage, 1),
        "score": score,
    }


# ── Contact info detection ────────────────────────────────────────────

def _contact_info(text: str) -> dict:
    text_lower = text.lower()

    has_email = bool(
        re.search(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text,
        )
    )

    has_phone = bool(
        re.search(
            r"(\+?\d[\d\-\s]{8,}\d)",
            text,
        )
    )

    # Detect actual URLs OR visible labels.
    has_linkedin = (
        "linkedin.com" in text_lower
        or bool(re.search(r"\blinkedin\b", text, re.I))
    )

    has_github = (
        "github.com" in text_lower
        or bool(re.search(r"\bgithub\b", text, re.I))
    )

    components = [has_email, has_phone, has_linkedin, has_github]

    score = round(sum(components) / 4 * 100, 1)

    return {
        "email": has_email,
        "phone": has_phone,
        "linkedin": has_linkedin,
        "github": has_github,
        "score": int(score),
    }


# ── Gemini feedback ───────────────────────────────────────────────────

def _gemini_feedback(text: str, scores: dict, role_info: dict, ats: dict) -> str:
    preview = text[:3500]

    prompt = f"""You are an expert resume coach for Indian engineering students applying to campus placements.

Detected target role:
{role_info["detected_role"]}

Suggested roles:
{", ".join(role_info["suggested_roles"])}

Resume text:
---
{preview}
---

Computed Scores:
- Sections: {scores["sections"]}
- ATS keywords: {scores["ats"]}
- Action verbs: {scores["verbs"]}
- Quantification: {scores["quantification"]}
- Contact info: {scores["contact"]}
- Overall: {scores["overall"]}

Matched ATS keywords:
{", ".join(ats.get("matched_keywords", []))}

Missing ATS keywords:
{", ".join(ats.get("missing_keywords", [])[:15])}

Write feedback in markdown:

## 📊 Overall Verdict
2-3 sentences.

## 🎯 Best-Fit Role
Mention the detected role and 2 alternate roles.

## ✅ Strengths
3 bullet points.

## ⚠️ Top 3 Improvements
Concrete, actionable. Show before/after examples where possible.

## 🔎 ATS Keyword Gaps
List missing keywords that are relevant to the detected role.

## 💡 Quantification Examples
Take 2 weak bullets from the resume and rewrite them with realistic numbers.
Mark invented metrics as [example].

Be direct, kind, and specific."""

    return _safe_generate(prompt, "Could not generate AI feedback.")


# ── Overall score ─────────────────────────────────────────────────────

def _overall_score(
    sections: dict,
    ats: dict,
    verbs: dict,
    quantification: dict,
    contact: dict,
) -> float:
    return round(
        sections["score"] * 0.20
        + ats["score"] * 0.25
        + verbs["score"] * 0.20
        + quantification["score"] * 0.20
        + contact["score"] * 0.15,
        1,
    )


# ── Main API ──────────────────────────────────────────────────────────

def analyze_resume(file_obj: IO) -> dict:
    """
    Analyze a PDF resume.

    Input:
        open file object in binary mode.

    Output:
        dict matching ResumeAnalysisOut schema,
        or {"error": "..."}.
    """
    text = _extract_text(file_obj)

    if not text or len(text.strip()) < 50:
        return {
            "error": "Could not extract text from PDF. Is it a scanned/image PDF?"
        }

    role_info = _detect_role_and_keywords(text)

    sections = _detect_sections(text)
    ats = _ats_analysis(text, role_info["ats_keywords"])
    verbs = _verb_analysis(text)
    quantification = _quantification_analysis(text)
    contact = _contact_info(text)

    overall = _overall_score(
        sections=sections,
        ats=ats,
        verbs=verbs,
        quantification=quantification,
        contact=contact,
    )

    score_summary = {
        "sections": sections["score"],
        "ats": ats["score"],
        "verbs": verbs["score"],
        "quantification": quantification["score"],
        "contact": contact["score"],
        "overall": overall,
    }

    feedback = _gemini_feedback(
        text=text,
        scores=score_summary,
        role_info=role_info,
        ats=ats,
    )

    return {
        "overall_score": overall,

        "detected_role": role_info["detected_role"],
        "role_confidence": role_info["role_confidence"],
        "suggested_roles": role_info["suggested_roles"],

        "sections": sections,
        "ats": ats,
        "verbs": verbs,
        "contact": contact,
        "quantification": quantification,
        "gemini_feedback": feedback,

        # Was text[:600]. Increased so Projects/Experience can appear.
        "text_preview": text[:TEXT_PREVIEW_LIMIT],
    }


# ── CLI smoke test ────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        with open(sys.argv[1], "rb") as f:
            result = analyze_resume(f)

        print({
            k: v
            for k, v in result.items()
            if k != "gemini_feedback"
        })

        print("\n--- Feedback ---\n")
        print(result.get("gemini_feedback", "")[:1000])
    else:
        print("Usage: python src/resume_analyzer.py path/to/resume.pdf")