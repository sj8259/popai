"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";

type AnalysisResult = {
  fit_score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  tailored_bullets: string[];
  interview_questions: string[];
  elapsed_ms?: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fitBadge = useMemo(() => {
    if (!result) return null;
    const score = result.fit_score;
    if (score >= 80) return "bg-emerald-100 text-emerald-800";
    if (score >= 60) return "bg-amber-100 text-amber-800";
    return "bg-rose-100 text-rose-800";
  }, [result]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!resumeFile) {
      setError("Please upload a PDF resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Add a job description to tailor against.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);
    if (roleTitle.trim()) {
      formData.append("role_title", roleTitle.trim());
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail?.detail || "Something went wrong.");
      }

      const data = (await response.json()) as AnalysisResult;
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(244,114,182,0.12),transparent_20%)]" />
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 lg:px-10 lg:pt-16">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-100 shadow-sm ring-1 ring-white/15 backdrop-blur">
            RoleReady · Resume Tailoring Agent
          </span>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Upload your resume. Paste the job. Get a tailored fit in seconds.
          </h1>
            <p className="text-lg text-slate-200">
              Powered by PydanticAI + OpenRouter. Clear strengths, gaps, and
              ready-to-paste bullets for the role you want.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleSubmit}
            className="col-span-2 space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-900/30 backdrop-blur"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Role title (optional)
                </span>
                <input
                  type="text"
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-50 outline-none ring-2 ring-transparent transition focus:ring-blue-500/50"
                  placeholder="Senior Product Manager"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-100">
                  Upload resume (PDF)
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="rounded-lg border border-dashed border-white/20 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-blue-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:border-white/40"
                />
                {resumeFile && (
                  <p className="text-xs text-slate-300">
                    {resumeFile.name} · {(resumeFile.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-100">
                Job description
              </span>
              <textarea
                required
                minLength={20}
                rows={8}
                className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-slate-50 outline-none ring-2 ring-transparent transition focus:ring-blue-500/50"
                placeholder="Paste the full JD here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-slate-300">
                We only send the text to the server. PDF stays server-side and
                is not persisted.
              </p>
            </label>

            {error && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Analyzing..." : "Analyze & Tailor"}
            </button>

            <p className="text-xs text-slate-300">
              Backend: FastAPI + PydanticAI on OpenRouter. Frontend: Next.js +
              Tailwind on Vercel.
            </p>
          </form>

          <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-900/30 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">
              What you get
            </h2>
            <ul className="space-y-3 text-sm text-slate-100">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Fit score and concise summary.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                Strengths vs. JD + key gaps to close.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-400" />
                Tailored bullets ready to paste into your resume.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                Likely interviewer questions with suggested answers.
              </li>
            </ul>

            <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">Pro tip</p>
              <p className="mt-1 text-slate-300">
                Use a focused role title and the full JD. Keep resumes under 6MB
                for faster runs.
              </p>
            </div>

            {result && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-50">
                <p className="font-semibold text-emerald-100">Completed</p>
                <p className="mt-1 text-emerald-50">
                  Fit score {result.fit_score}/100 ·
                  {result.elapsed_ms ? ` ${result.elapsed_ms}ms` : ""} powered
                  by PydanticAI.
          </p>
        </div>
            )}
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card
            title="Fit snapshot"
            description="Overall summary of how well you map to the role."
            highlight={
              result ? (
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${fitBadge}`}
                >
                  Fit score: {result.fit_score}/100
                </span>
              ) : (
                "Fit score will show here after you run the agent."
              )
            }
            body={
              result?.summary || (
                <Placeholder>
                  Your tailored summary will land here in seconds.
                </Placeholder>
              )
            }
            />

          <Card
            title="Strengths vs. Gaps"
            description="Map your resume to the JD."
            body={
              result ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <ListBlock title="Strengths" items={result.strengths} />
                  <ListBlock title="Gaps" items={result.gaps} tone="gap" />
        </div>
              ) : (
                <Placeholder>
                  We’ll highlight 3-5 strengths and gaps once analyzed.
                </Placeholder>
              )
            }
          />

          <Card
            title="Tailored bullets"
            description="Copy-ready resume bullets tuned to the JD."
            body={
              result ? (
                <ListBlock items={result.tailored_bullets} numbered />
              ) : (
                <Placeholder>
                  Expect 3-5 bullets optimized for this role.
                </Placeholder>
              )
            }
          />

          <Card
            title="Likely interview questions"
            description="Be ready with concise answers."
            body={
              result ? (
                <ListBlock items={result.interview_questions} numbered />
              ) : (
                <Placeholder>
                  We’ll draft likely questions with suggested talking points.
                </Placeholder>
              )
            }
          />
        </section>
      </main>
    </div>
  );
}

function Card({
  title,
  description,
  highlight,
  body,
}: {
  title: string;
  description: string;
  highlight?: ReactNode;
  body: ReactNode;
}) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-900/30 backdrop-blur">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-semibold text-white">{title}</p>
            <p className="text-sm text-slate-200">{description}</p>
          </div>
          {highlight && <div className="text-sm">{highlight}</div>}
        </div>
        <div className="mt-3 text-sm text-slate-50">{body}</div>
      </div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone = "default",
  numbered = false,
}: {
  title?: string;
  items: string[];
  tone?: "default" | "gap";
  numbered?: boolean;
}) {
  const toneClass =
    tone === "gap"
      ? "border-rose-300/30 bg-rose-500/10"
      : "border-blue-300/30 bg-blue-500/10";

  if (!items?.length) return <Placeholder>No content yet.</Placeholder>;

  return (
    <div className={`rounded-xl border ${toneClass} p-3 text-slate-50`}>
      {title && <p className="text-sm font-semibold text-white">{title}</p>}
      <ol
        className={`mt-2 space-y-2 ${numbered ? "list-decimal pl-5" : "list-disc pl-4"}`}
      >
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-slate-100">
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-slate-200">
      {children}
    </div>
  );
}
