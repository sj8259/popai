import io
import os
import time
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_ai import Agent, ModelAPIError, ModelHTTPError
from pydantic_ai.models.openrouter import OpenRouterModel
from pydantic_ai.providers.openrouter import OpenRouterProvider
from pypdf import PdfReader

# Load environment variables from backend/.env for local development.
# (Deployment should set real env vars in the process environment.)
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))


class AnalysisResult(BaseModel):
    fit_score: int = Field(ge=0, le=100)
    summary: str
    strengths: list[str]
    gaps: list[str]
    tailored_bullets: list[str]
    interview_questions: list[str]


def build_agent() -> Agent[AnalysisResult]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not set")

    provider = OpenRouterProvider(api_key=api_key)

    # OpenRouter model id (see https://openrouter.ai/models). Allow overriding via env var.
    model_name = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3-haiku")
    model = OpenRouterModel(
        model_name,
        provider=provider,
    )

    system_prompt = (
        "You are RoleReady, an assistant that tailors resumes to job descriptions. "
        "Given a resume and a job description, return a concise assessment with actionable edits. "
        "Always respond in the requested schema."
    )

    return Agent(
        model=model,
        output_type=AnalysisResult,
        system_prompt=system_prompt,
    )


agent = build_agent()

app = FastAPI(title="RoleReady Agent API", version="0.1.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
origins = ["*"] if allowed_origins == "*" else [o.strip() for o in allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_pdf_text(upload: UploadFile, max_pages: int = 12) -> str:
    if upload.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(status_code=400, detail="Resume must be a PDF file")

    data = upload.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Could not read PDF content")

    reader = PdfReader(io.BytesIO(data))
    text_parts: list[str] = []
    for idx, page in enumerate(reader.pages[:max_pages]):
        try:
            text_parts.append(page.extract_text() or "")
        except Exception:
            # Continue even if a page fails to extract
            continue
    joined = "\n".join(part.strip() for part in text_parts if part.strip())
    if not joined:
        raise HTTPException(status_code=400, detail="No extractable text found in PDF")
    return joined[:20000]  # hard cap for prompt size


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(..., min_length=20),
    role_title: Optional[str] = Form(None),
):
    start = time.time()
    resume_text = extract_pdf_text(resume)

    prompt = (
        f"ROLE TITLE: {role_title or 'Not specified'}\n\n"
        f"JOB DESCRIPTION:\n{job_description[:6000]}\n\n"
        f"RESUME:\n{resume_text}"
    )

    try:
        run_result = await agent.run(prompt)
    except ModelHTTPError as exc:
        # Errors returned by OpenRouter / the downstream model.
        raise HTTPException(
            status_code=502,
            detail={
                "error": "upstream_model_error",
                "upstream_status_code": exc.status_code,
                "model": exc.model_name,
                "body": exc.body,
            },
        ) from exc
    except ModelAPIError as exc:
        raise HTTPException(
            status_code=502,
            detail={"error": "upstream_api_error", "model": exc.model_name, "message": str(exc)},
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Agent failed: {exc}") from exc

    duration = round((time.time() - start) * 1000)
    output = run_result.output
    return {
        "fit_score": output.fit_score,
        "summary": output.summary,
        "strengths": output.strengths,
        "gaps": output.gaps,
        "tailored_bullets": output.tailored_bullets,
        "interview_questions": output.interview_questions,
        "elapsed_ms": duration,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

