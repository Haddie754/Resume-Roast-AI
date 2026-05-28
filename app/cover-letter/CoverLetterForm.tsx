"use client";

import { useState } from "react";
import Button from "@/components/Button";
import ResumeInput from "@/components/ResumeInput";
import type { CoverLetterResult } from "@/app/api/cover-letter/route";

type Tone = "professional" | "confident" | "friendly";

export default function CoverLetterForm() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoverLetterResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, companyName, tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/auth/sign-in?next=/cover-letter";
          return;
        }
        if (res.status === 402) {
          window.location.href = data?.upgradeUrl || "/pricing";
          return;
        }
        throw new Error(data?.error || "Something went wrong.");
      }
      setResult(data.result as CoverLetterResult);
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </Field>
          <Field label="Tone">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            >
              <option value="professional">Professional</option>
              <option value="confident">Confident</option>
              <option value="friendly">Friendly</option>
            </select>
          </Field>
        </div>

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
          {loading ? "Writing..." : "Write my cover letter"}
        </Button>
      </form>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-brand-500" />
          <p className="mt-4">Channeling your inner closer...</p>
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-6">
          <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">Cover letter</h3>
            <pre className="whitespace-pre-wrap font-sans text-zinc-100">{result.coverLetter}</pre>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">Recruiter message</h3>
            <pre className="whitespace-pre-wrap font-sans text-zinc-100">{result.recruiterMessage}</pre>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">Subject lines</h3>
            <ul className="space-y-2">
              {result.subjectLines.map((s, i) => (
                <li
                  key={i}
                  className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-zinc-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
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
