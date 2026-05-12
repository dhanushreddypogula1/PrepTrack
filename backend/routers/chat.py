from fastapi import APIRouter, Depends, HTTPException
from backend.schemas import ChatRequest
from backend.routers.auth import current_user
from src.database import get_session, ChatHistory
from src.gemini_advisor import _safe_generate

router = APIRouter()


def _build_chat_prompt(message: str, history: list[dict]) -> str:
    """
    Build a lightweight PrepTrack assistant prompt.
    No RAG, no sentence_transformers, no heavy startup imports.
    """

    recent_history = history[-8:] if history else []

    history_text = ""
    for item in recent_history:
        role = item.get("role", "user")
        content = item.get("content", "")

        if not content:
            continue

        if role == "assistant":
            history_text += f"Assistant: {content}\n"
        else:
            history_text += f"User: {content}\n"

    prompt = f"""
You are PrepTrack AI, a friendly career and placement preparation assistant for engineering students.

Your job:
- Help students prepare for placements, internships, resumes, projects, DSA, aptitude, interviews, and career roadmaps.
- Give practical, beginner-friendly advice.
- Prefer structured answers with bullets, steps, and examples.
- If asked about code, explain clearly.
- If asked about resumes, give actionable improvements.
- If asked about companies, suggest preparation strategies.
- Do not pretend to know private user data unless provided in the chat.

Conversation so far:
{history_text}

Current user message:
{message}

Reply as PrepTrack AI.
Keep the response helpful, clear, and not too long.
"""

    return prompt.strip()


@router.post("/")
def chat(body: ChatRequest, user=Depends(current_user)):
    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = [
        {"role": m.role, "content": m.content}
        for m in body.history
    ]

    prompt = _build_chat_prompt(body.message.strip(), history)

    answer = _safe_generate(
        prompt,
        "Sorry, I could not generate a response right now. Please try again."
    )

    db = get_session()
    try:
        db.add(ChatHistory(
            user_id=user["user_id"],
            role="user",
            message=body.message.strip()
        ))

        db.add(ChatHistory(
            user_id=user["user_id"],
            role="assistant",
            message=answer
        ))

        db.commit()

    finally:
        db.close()

    return {
        "role": "assistant",
        "content": answer
    }


@router.get("/history")
def history(user=Depends(current_user)):
    db = get_session()
    try:
        rows = (
            db.query(ChatHistory)
            .filter(ChatHistory.user_id == user["user_id"])
            .order_by(ChatHistory.timestamp.desc(), ChatHistory.id.desc())
            .limit(50)
            .all()
        )

        return [
            {
                "role": row.role,
                "content": row.message
            }
            for row in reversed(rows)
        ]

    finally:
        db.close()