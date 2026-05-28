"use client";

import { useState } from "react";
import Button from "@/components/Button";
import ResumeInput from "@/components/ResumeInput";
import type { WorkerResult } from "@/app/api/worker/route";

export default function WorkerForm() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer Intern");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkerResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/auth/sign-in?next=/worker";
          return;
        }
        if (res.status === 402) {
          window.location.href = data?.upgradeUrl || "/pricing";
          return;
        }
        throw new Error(data?.error || "Something went wrong.");
      }
      setResult(data.result as WorkerResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-6"
      >
        <Field label="Target role">
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
          />
        </Field>

        <div className="grid gap-4 lg:grid-cols-2">
          <ResumeInput value={resume} onChange={setResume} />
          <Field label="Job description">
            <textarea
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description..."
              className="h-64 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </Field>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Working..." : "Tailor my resume"}
        </Button>
      </form>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-brand-500" />
          <p className="mt-4">Crunching keywords...</p>
        </div>
      )}

      {result && <WorkerResultView result={result} />}
    </>
  );
}

function WorkerResultView({ result }: { result: WorkerResult }) {
  return (
    <div className="animate-fade-in space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <p className="text-sm uppercase tracking-wide text-zinc-400">ATS Match</p>
        <p className="text-5xl font-extrabold text-emerald-400">
          {result.atsMatchScore}<span className="text-xl text-zinc-500">/100</span>
        </p>
        <p className="mt-4 text-zinc-200">{result.matchSummary}</p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">Missing keywords</h3>
        <div className="flex flex-wrap gap-2">
          {result.missingKeywords.map((k, i) => (
            <span key={i} className="rounded-full bg-yellow-500/15 px-3 py-1 text-sm text-yellow-300">
              {k}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">Improved bullets</h3>
        <div className="space-y-4">
          {result.improvedBullets.map((b, i) => (
            <div key={i} className="rounded-lg border border-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Before</p>
              <p className="mt-1 text-zinc-400 line-through decoration-zinc-600">{b.before}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-emerald-400">After</p>
              <p className="mt-1 text-zinc-100">{b.after}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h3 className="mb-3 text-lg font-semibold text-white">Suggested summary</h3>
        <p className="whitespace-pre-line text-zinc-200">{result.suggestedSummary}</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-red-500/30 bg-zinc-900/60 p-6">
          <h3 className="mb-3 text-lg font-semibold text-white">Remove</h3>
          <ul className="list-disc space-y-1 pl-5 text-zinc-200">
            {result.whatToRemove.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-emerald-500/30 bg-zinc-900/60 p-6">
          <h3 className="mb-3 text-lg font-semibold text-white">Emphasize</h3>
          <ul className="list-disc space-y-1 pl-5 text-zinc-200">
            {result.whatToEmphasize.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-200">{label}</span>
      {children}
    </label>
  );
}
