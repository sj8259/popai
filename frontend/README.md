# RoleReady Frontend (Next.js)

## Quick start
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create an env file:
   ```bash
   cp example.env .env.local
   # set NEXT_PUBLIC_API_BASE_URL to your FastAPI backend (default http://localhost:8000)
   ```
3. Run:
```bash
npm run dev
```
4. Open http://localhost:3000

## Deploying to Vercel
- Add `NEXT_PUBLIC_API_BASE_URL` in Vercel project settings pointing to your deployed backend (Railway/Render/Fly etc.).
- Push to GitHub and import the repo into Vercel; framework auto-detected.

## What it does
- Upload a PDF resume, paste a job description, optionally add a role title.
- Calls the FastAPI + PydanticAI backend for structured fit analysis, tailored bullets, and likely interview questions.
