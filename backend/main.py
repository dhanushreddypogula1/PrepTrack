import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.routers import (
    auth,
    predict,
    advisor,
    companies,
    exam,
    chat,
    resume,
    progress,
    leetcode,
)

app = FastAPI(
    title="PrepTrack API",
    version="2.0.0",
    docs_url="/api/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000"
    ).split(","),

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["auth"]
)

app.include_router(
    predict.router,
    prefix="/api/predict",
    tags=["predict"]
)

app.include_router(
    advisor.router,
    prefix="/api/advisor",
    tags=["advisor"]
)

app.include_router(
    companies.router,
    prefix="/api/companies",
    tags=["companies"]
)

app.include_router(
    exam.router,
    prefix="/api/exam",
    tags=["exam"]
)

app.include_router(
    chat.router,
    prefix="/api/chat",
    tags=["chat"]
)

app.include_router(
    progress.router,
    prefix="/api/progress",
    tags=["progress"]
)

app.include_router(
    resume.router,
    prefix="/api/resume",
    tags=["resume"]
)

app.include_router(
    leetcode.router,
    prefix="/api/leetcode",
    tags=["leetcode"]
)


@app.get("/api/health")
def health():
    return {"status": "ok"}
@app.get("/")
def root():
    return {"message": "PrepTrack API Running"}