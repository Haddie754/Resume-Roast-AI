"use client";

import { useState } from "react";
import Link from "next/link";
import ResumeDownloadPanel from "./ResumeDownloadPanel";
import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

/**
 * Pro-gated "rebuild my resume into a downloadable file" action.
 * Calls /api/build-resume, then renders the preview + PDF/DOCX downloads.
 */
export default function BuildResumeButton({
  resume,
  targetRole,
  jobDescription,
  signInNext,
}: {
  resume: string;
  targetRole?: string;
  jobDescription?: string;
  signInNext: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPro, setNeedsPro] = useState(false);
  const [built, setBuilt] = useState<StructuredResume | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setNeedsPro(false);
    try {
      const res = await fetch("/api/build-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, targetRole, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/sign-in?next=${signInNext}`;
          return;
        }
        if (res.status === 402) {
          setNeedsPro(true);
          return;
        }
        throw new Error(data?.error || "Something went wrong.");
      }
      setBuilt(data.result as StructuredResume);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  if (built) {
    return (
      <section className="space-y-4 rounded-2xl border border-brand-500/30 bg-zinc-900/60 p-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Your polished resume</h3>
          <ProTag />
        </div>
        <ResumeDownloadPanel resume={built} />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Download your improved resume</h3>
            <ProTag />
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Rebuild your resume into a clean, ATS-safe PDF &amp; Word doc — ready to submit.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="shrink-0 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Building…" : "Generate"}
        </button>
      </div>

      {needsPro && (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-md border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-100 sm:flex-row sm:items-center">
          <span>Downloadable resumes are a Pro feature. Upgrade to unlock PDF &amp; Word exports.</span>
          <Link
            href="/pricing"
            className="shrink-0 rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}
      {error && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </section>
  );
}

function ProTag() {
  return (
    <span className="rounded-full bg-brand-500/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-100">
      Pro
    </span>
  );
}
