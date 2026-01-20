# RoleReady Backend (FastAPI + PydanticAI)

## Quick start
1. Create and activate a virtual env (Python 3.10+):
   ```bash
   cd backend
   # Use Python 3.10+ (e.g. python3.11 / python3.12)
   python3.11 -m venv .venv
   source .venv/bin/activate
   ```
2. Install deps:
   ```bash
   pip install -e .
   ```
   If `pip install -e .` is not desired, use `pip install -r requirements.txt` after generating it via `pip install . && pip freeze > requirements.txt`.
3. Copy `example.env` to `.env` and set `OPENROUTER_API_KEY`.
   - Optional: set `OPENROUTER_MODEL` (defaults to `anthropic/claude-3-haiku`).
4. Run:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

Notes:
- For local dev, the backend loads env vars from `backend/.env` automatically.
- In production, set `OPENROUTER_API_KEY` as a real environment variable in your hosting platform.

## Deployment notes
- The app is stateless; any server that supports ASGI works (Railway/Fly/Render).
- Set `ALLOWED_ORIGINS` env var to your frontend origin for CORS.
- Expose `OPENROUTER_API_KEY` as a secret; do not bundle it in the client.

