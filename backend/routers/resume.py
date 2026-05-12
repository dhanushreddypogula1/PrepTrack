from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from backend.schemas import ResumeAnalysisOut
from backend.routers.auth import current_user
from src.resume_analyzer import analyze_resume
import tempfile
import os

router = APIRouter()


@router.post("/analyze", response_model=ResumeAnalysisOut)
async def analyze(file: UploadFile = File(...), _=Depends(current_user)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    content = await file.read()

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as pdf_file:
            result = analyze_resume(pdf_file)

        if "error" in result:
            raise HTTPException(422, result["error"])

        return ResumeAnalysisOut(
            overall_score=result["overall_score"],

            detected_role=result.get("detected_role", "Software Developer"),
            role_confidence=result.get("role_confidence", 0.5),
            suggested_roles=result.get("suggested_roles", []),

            sections=result["sections"],
            ats=result["ats"],
            verbs=result["verbs"],
            contact=result["contact"],
            quantification=result["quantification"],
            gemini_feedback=result["gemini_feedback"],
            text_preview=result["text_preview"],
        )

    finally:
        try:
            os.unlink(tmp_path)
        except PermissionError:
            # Windows sometimes keeps file handles briefly.
            # Avoid crashing the API after analysis succeeds.
            pass