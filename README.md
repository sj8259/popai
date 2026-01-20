# RoleReady — Resume Tailoring Agent

Full-stack AI agent that tailors a resume to any job description. Frontend is a polished Next.js app on Vercel; backend is FastAPI with PydanticAI running an OpenRouter model.

## Live deliverables to provide
- Deployed frontend URL (Vercel recommended)
- Deployed backend URL (Render/Railway/Fly work well)
- Public GitHub repo
- 1-min Loom with face + voice explaining the flow
- Resume upload lives in the app (PDF parsing server-side)

## Stack
- Frontend: Next.js (App Router) + Tailwind
- Backend: FastAPI + PydanticAI (`OpenAIModel` pointing at OpenRouter)
- Model: `anthropic/claude-3-haiku` via https://openrouter.ai

## Local setup
```bash
git clone <repo>
cd popai

# Backend
cd backend
# Use Python 3.10+ (e.g. python3.11 / python3.12)
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
  cp example.env .env    # set OPENROUTER_API_KEY and ALLOWED_ORIGINS
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd ../frontend
npm install
cp example.env .env.local   # set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev
```
Open http://localhost:3000 and test.

## Deployment notes
- Frontend: push to GitHub → import on Vercel → set `NEXT_PUBLIC_API_BASE_URL` env var to the backend URL.
- Backend: deploy FastAPI as ASGI (Railway/Render/Fly). Set `OPENROUTER_API_KEY` and `ALLOWED_ORIGINS` to your Vercel domain. No persistence required.

## API contract
`POST /analyze` (multipart):
- `resume`: PDF file
- `job_description`: string
- `role_title` (optional): string

Response:
```json
{
  "fit_score": 88,
  "summary": "...",
  "strengths": ["..."],
  "gaps": ["..."],
  "tailored_bullets": ["..."],
  "interview_questions": ["..."],
  "elapsed_ms": 1200
}
```

## Loom script suggestion (≤60s)
- Show landing page and quick explanation (5s).
- Upload resume + paste JD, hit Analyze (20s).
- Scroll fit score, strengths/gaps, bullets, interview Qs (20s).
- Mention stack: Next.js + Tailwind on Vercel, FastAPI + PydanticAI on OpenRouter (10s).

