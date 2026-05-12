# 🚀 PrepTrack — AI-Powered Placement Preparation Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Python](https://img.shields.io/badge/Python-3.12-yellow)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)
![License](https://img.shields.io/badge/License-MIT-purple)
![Status](https://img.shields.io/badge/Status-Active-success)

PrepTrack is a modern AI-powered placement preparation platform designed to help students prepare smarter for placements using machine learning, AI-generated guidance, analytics, interview simulations, resume intelligence, adaptive exams, and company-specific preparation roadmaps.

Built with a production-grade full-stack architecture using Next.js 14, FastAPI, Gemini AI, and ML-powered prediction systems.

---

# 🌟 Why PrepTrack?

Most placement platforms solve only one part of preparation.

PrepTrack combines:

* AI placement prediction
* Resume intelligence
* LeetCode analytics
* Interview preparation
* Company-specific guidance
* Adaptive examinations
* Progress tracking
* AI-powered roadmaps

into one unified intelligent placement operating system.

---

# 🎯 Core Features

## 🤖 AI Placement Prediction

* ML-powered placement probability prediction
* Expected CTC prediction
* Feature importance analysis
* What-if scenario simulator
* Historical prediction tracking

## 🧠 AI Advisor

* Gemini-powered personalized guidance
* Company-specific preparation roadmaps
* Weakness analysis
* Smart study recommendations
* Resume bullet optimization

## 🏢 Company Intelligence

* Company fit-score analysis
* Skill-gap detection
* Company comparison engine
* Interview-focused preparation suggestions

## 📝 Adaptive AI Exam System

* Gemini-generated MCQs
* Countdown timer
* Anti-cheat tab detection
* Auto submission
* Instant evaluation and analytics

## 📄 Resume Analyzer

* PDF resume upload
* ATS compatibility scoring
* AI resume feedback
* Resume improvement suggestions

## 🎤 AI Interview System

* AI-generated interview questions
* Answer evaluation
* Behavioral and technical interview support
* Personalized interview feedback

## 💬 RAG Chatbot

* FAISS + sentence-transformers + Gemini integration
* Context-aware placement guidance
* Knowledge-base powered responses

## 📊 Dashboard Analytics

* KPI tracking
* Placement readiness analytics
* Radar charts and trend analysis
* Progress monitoring

## 📈 Progress Tracking

* Activity logging
* Performance analytics
* Study consistency tracking

## 💻 LeetCode Intelligence

* Real-time LeetCode analytics
* Contest rating tracking
* Problem-solving insights
* DSA readiness evaluation
* Submission analytics

---

# 🖼 Screenshots

> Add screenshots/GIFs here later.

## Suggested Screenshots

* Landing Page
* Dashboard Analytics
* LeetCode Intelligence
* AI Advisor
* Resume Analyzer
* Interview Simulator
* Company Analytics
* Scenario Simulator

---

# 🏗 System Architecture

```txt
                    ┌────────────────────┐
                    │     Next.js 14     │
                    │  Frontend Client   │
                    └─────────┬──────────┘
                              │ REST APIs
                              ▼
                    ┌────────────────────┐
                    │      FastAPI       │
                    │   Backend Server   │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
 ┌──────────────┐    ┌────────────────┐    ┌────────────────┐
 │ Gemini AI    │    │ ML Models      │    │ SQLite/Postgres│
 │ AI Services  │    │ XGBoost        │    │ Database Layer │
 └──────────────┘    └────────────────┘    └────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ FAISS + RAG     │
                     │ Vector Retrieval│
                     └─────────────────┘
```

---

# ⚙️ Tech Stack

## Frontend

* Next.js 14
* TypeScript
* TailwindCSS
* Framer Motion
* Recharts
* Zustand
* TanStack Query
* Axios
* shadcn/ui

## Backend

* FastAPI
* Python
* SQLAlchemy
* SQLite
* JWT Authentication
* REST APIs

## AI & Machine Learning

* Gemini 1.5 Flash
* XGBoost
* Scikit-learn
* FAISS
* Sentence Transformers

## DevOps & Deployment

* GitHub Actions (planned)
* Vercel
* Railway / Render
* PostgreSQL (planned)

---

# 📂 Project Structure

```txt
preptrack/
│
├── backend/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── predict.py
│   │   ├── advisor.py
│   │   ├── companies.py
│   │   ├── exam.py
│   │   ├── chat.py
│   │   ├── resume.py
│   │   ├── progress.py
│   │   └── leetcode.py
│   │
│   ├── services/
│   │   ├── exam_engine.py
│   │   └── rag_service.py
│   │
│   ├── models/
│   ├── main.py
│   ├── schemas.py
│   ├── database.py
│   ├── db_migrate.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── public/
│   └── package.json
│
├── models/
├── rag_data/
├── src/
├── .env.example
└── README.md
```

---

# 🔌 Core APIs

| Endpoint                   | Description              |
| -------------------------- | ------------------------ |
| `/api/auth/login`          | User authentication      |
| `/api/predict/`            | Placement prediction     |
| `/api/predict/scenarios`   | Scenario simulation      |
| `/api/advisor/report`      | AI report generation     |
| `/api/advisor/roadmap`     | Personalized roadmap     |
| `/api/companies/match`     | Company matching         |
| `/api/exam/start`          | Adaptive exam generation |
| `/api/chat/`               | AI chatbot               |
| `/api/resume/analyze`      | Resume ATS analysis      |
| `/api/progress/`           | Progress tracking        |
| `/api/leetcode/{username}` | LeetCode analytics       |

---

# 🚀 Installation Guide

## Prerequisites

* Python 3.11+
* Node.js 18+
* Existing trained ML models and RAG data

---

# 🔧 Backend Setup

```bash
cd backend

python -m venv venv
```

## Windows

```bash
venv\Scripts\activate
```

## Mac/Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables:

```bash
cp ../.env.example .env
```

Add:

* GEMINI_API_KEY
* JWT_SECRET
* DATABASE_URL

Run database migration:

```bash
python db_migrate.py
```

Start backend:

```bash
uvicorn main:app --reload --port 8000
```

Backend runs on:

```txt
http://localhost:8000
```

API Docs:

```txt
http://localhost:8000/api/docs
```

---

# 🎨 Frontend Setup

```bash
cd frontend

npm install
```

Create environment file:

```bash
cp ../.env.example .env.local
```

Set:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

# 🔐 Environment Variables

| Variable            | Description                    |
| ------------------- | ------------------------------ |
| GEMINI_API_KEY      | Google Gemini API key          |
| JWT_SECRET          | JWT signing secret             |
| DATABASE_URL        | SQLite/PostgreSQL database URL |
| ALLOWED_ORIGINS     | Allowed frontend origins       |
| NEXT_PUBLIC_API_URL | Backend API URL                |

---

# ⚡ CI/CD Pipeline (Planned)

## Frontend Deployment

* Vercel
* Automatic deployment on git push
* Production build verification

## Backend Deployment

* Railway / Render
* Environment-based deployment configuration
* Health monitoring

## GitHub Actions

Planned CI workflows:

* Frontend build checks
* Backend dependency validation
* Linting and formatting
* Deployment automation

---

# 🌐 Deployment

## Frontend

Recommended:

* Vercel

## Backend

Recommended:

* Railway
* Render

## Database

Planned:

* PostgreSQL

---

# 🧩 Key Engineering Challenges Solved

* Modular FastAPI router architecture
* AI response orchestration with Gemini
* ML-based placement prediction pipeline
* Dashboard state management using Zustand
* Dynamic analytics visualization
* LeetCode GraphQL integration
* RAG retrieval optimization with FAISS
* Responsive SaaS-style dashboard UI
* Protected authentication flow
* Scalable frontend component architecture

---

# 🛡 Production Features

* JWT Authentication
* Environment-based configuration
* Modular backend architecture
* Responsive dashboard system
* AI-powered workflows
* ML-based analytics
* RESTful APIs
* Modern SaaS UI/UX
* Dashboard layout architecture
* LeetCode analytics integration

---

# 📈 Planned Improvements

* PostgreSQL migration
* Real-time AI streaming
* Mobile responsiveness optimization
* Notification system
* Full CI/CD automation
* Docker support
* OAuth authentication
* Multi-user analytics
* Advanced readiness scoring
* Leaderboards and gamification
* AI voice interviews
* Real-time collaboration

---

# 💼 Resume Highlights

* Built a full-stack AI-powered SaaS platform using Next.js and FastAPI
* Integrated Gemini AI for personalized placement guidance
* Developed ML-powered placement prediction using XGBoost
* Implemented adaptive AI-generated examination system
* Designed responsive analytics dashboards using Recharts
* Built modular REST APIs with authentication and analytics
* Integrated FAISS-based RAG chatbot system
* Developed LeetCode GraphQL analytics integration
* Designed scalable frontend architecture with Zustand and React Query

---

# 🧭 Future Roadmap

* PostgreSQL production migration
* Kubernetes/Docker deployment
* Real-time collaboration
* Voice-based AI interviews
* AI study planner
* Resume versioning
* Placement leaderboard system
* Company-specific mock assessments
* Personalized AI learning paths

---

# 👨‍💻 Author

Dhanush Reddy Pogula

GitHub:
[https://github.com/YOUR_USERNAME](https://github.com/dhanushreddypogula1)

---

# 📄 License

MIT License
