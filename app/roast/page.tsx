"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import RoastResultView from "@/components/RoastResult";
import BuildResumeButton from "@/components/resume/BuildResumeButton";
import { createClient } from "@/lib/supabase/client";
import type { RoastResult } from "@/app/api/roast/route";

const PENDING_KEY = "ft_pending_roast";

const ROLES = [
  "Software Engineer Intern",
  "Data Analyst",
  "Product Manager",
  "Business Analyst",
  "Other",
] as const;

const YEARS = ["freshman", "sophomore", "junior", "senior", "new grad"] as const;

type FormState = {
  resume: string;
  targetRole: (typeof ROLES)[number];
  school: string;
  major: string;
  gpa: string;
  year: (typeof YEARS)[number];
  internationalStudent: boolean;
  targetCompanies: string;
};

const INITIAL: FormState = {
  resume: "",
  targetRole: "Software Engineer Intern",
  school: "",
  major: "",
  gpa: "",
  year: "junior",
  internationalStudent: false,
  targetCompanies: "",
};

export default function RoastPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);

  // Auth-aware "taste before signup": anonymous visitors get a preview + gate.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [preview, setPreview] = useState<RoastResult | null>(null);
  const [previewLimited, setPreviewLimited] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const isIn = !!data.user;
      setSignedIn(isIn);
      // Just signed up after a preview? Reveal the full roast they already got.
      if (isIn) {
        try {
          const pending = localStorage.getItem(PENDING_KEY);
          if (pending) {
            setResult(JSON.parse(pending) as RoastResult);
            localStorage.removeItem(PENDING_KEY);
            setTimeout(
              () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
              80,
            );
          }
        } catch {
          // localStorage unavailable — no-op.
        }
      }
    });
  }, []);

  // Upload mode state
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleFileUpload(file: File) {
    setUploadLoading(true);
    setUploadedFileName(null);
    setError(null);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/parse-resume", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to read file.");
      update("resume", json.text);
      setUploadedFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.resume.trim()) {
      setError(
        inputMode === "upload"
          ? "Please upload a resume file first."
          : "Please paste your resume text."
      );
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setPreview(null);
    setPreviewLimited(false);

    // Anonymous → free preview (score + diagnosis), then gate the full roast.
    if (signedIn === false) {
      try {
        const res = await fetch("/api/roast/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Something went wrong.");
        if (data.limited) {
          setPreviewLimited(true);
          return;
        }
        const r = data.result as RoastResult;
        setPreview(r);
        // Stash so the full roast appears after they sign up (no re-run).
        try {
          localStorage.setItem(PENDING_KEY, JSON.stringify(r));
        } catch {
          // ignore
        }
        setTimeout(
          () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Signed in → full roast.
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        // Not signed in → redirect to sign in
        if (res.status === 401) {
          window.location.href = "/auth/sign-in?next=/roast";
          return;
        }
        // Rate limited → suggest upgrade
        if (res.status === 429) {
          setError(data?.error || "You've hit the free limit. Upgrade to Pro for unlimited roasts.");
          return;
        }
        throw new Error(data?.detail || data?.error || "Something went wrong.");
      }
      setResult(data.result as RoastResult);
      // scroll to results after they render
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Roast my resume
        </h1>
        <p className="mt-2 text-zinc-400">
          The more context you give, the sharper (and more useful) the roast.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-6"
      >
        {/* Paste / Upload toggle */}
        <div>
          <div className="mb-3 flex w-fit gap-1 rounded-lg border border-white/10 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setInputMode("paste")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                inputMode === "paste"
                  ? "bg-brand-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              📋 Paste text
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                inputMode === "upload"
                  ? "bg-brand-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              📎 Upload file
            </button>
          </div>

          {inputMode === "paste" ? (
            <Field label="Resume text" hint="Copy and paste your full resume.">
              <textarea
                minLength={50}
                value={form.resume}
                onChange={(e) => update("resume", e.target.value)}
                placeholder="Paste your full resume here..."
                className="h-64 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
              />
            </Field>
          ) : (
            // Not wrapped in <Field> (which uses <label>) to avoid double file-picker trigger
            <div className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-200">Resume file</span>
              <span className="mb-2 block text-xs text-zinc-500">PDF, DOCX, or TXT. We&apos;ll extract the text automatically.</span>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
                className={`flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors ${
                  dragOver
                    ? "border-brand-500 bg-brand-500/5"
                    : uploadedFileName
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/20 bg-zinc-950 hover:border-brand-500/50 hover:bg-zinc-900"
                }`}
              >
                {uploadLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-brand-500" />
                    <p className="text-sm text-zinc-400">Reading file...</p>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-3xl">✅</span>
                    <p className="mt-1 text-sm font-medium text-zinc-200">{uploadedFileName}</p>
                    <p className="text-xs text-zinc-500">Click to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-4xl">📄</span>
                    <p className="text-sm font-semibold text-zinc-200">Drop your resume here</p>
                    <p className="text-xs text-zinc-500">or click to browse &nbsp;·&nbsp; PDF, DOCX, TXT</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Target role">
            <select
              value={form.targetRole}
              onChange={(e) => update("targetRole", e.target.value as FormState["targetRole"])}
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>

          <Field label="Year">
            <select
              value={form.year}
              onChange={(e) => update("year", e.target.value as FormState["year"])}
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>

          <Field label={signedIn === false ? "School (optional)" : "School"}>
            <input
              required={signedIn === true}
              value={form.school}
              onChange={(e) => update("school", e.target.value)}
              placeholder="e.g. NYU"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </Field>

          <Field label={signedIn === false ? "Major (optional)" : "Major"}>
            <input
              required={signedIn === true}
              value={form.major}
              onChange={(e) => update("major", e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </Field>

          <Field label="GPA (optional)">
            <input
              value={form.gpa}
              onChange={(e) => update("gpa", e.target.value)}
              placeholder="e.g. 3.6"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </Field>

          <Field label="Target companies (optional)">
            <input
              value={form.targetCompanies}
              onChange={(e) => update("targetCompanies", e.target.value)}
              placeholder="e.g. Stripe, Datadog, Ramp"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </Field>
        </div>

        <label className="flex items-center gap-3 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={form.internationalStudent}
            onChange={(e) => update("internationalStudent", e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-zinc-950 text-brand-500 focus:ring-brand-500"
          />
          I&apos;m an international student (may need visa sponsorship)
        </label>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading
            ? "Cooking..."
            : signedIn === false
            ? "🔥 Get my free Cooked Score"
            : "🔥 Roast My Resume"}
        </Button>
        {signedIn === false && (
          <p className="text-xs text-zinc-500">
            Free instant score — no account needed. Sign up to see your full breakdown.
          </p>
        )}
      </form>

      <div id="results" className="space-y-6">
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-brand-500" />
            <p className="mt-4">Firing up the grill...</p>
          </div>
        )}
        {result && (
          <BuildResumeButton
            resume={form.resume}
            targetRole={form.targetRole}
            signInNext="/roast"
          />
        )}
        {result && <RoastResultView result={result} />}
        {!result && preview && <PreviewGate preview={preview} />}
        {!result && previewLimited && <PreviewLimited />}
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-emerald-400";
}

// Anonymous "taste": show the score + diagnosis + roast, gate the actionable rest.
function PreviewGate({ preview }: { preview: RoastResult }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-semibold text-orange-300">
            🔥 {preview.diagnosis}
          </span>
          <span className={`text-5xl font-extrabold ${scoreColor(preview.cookedScore)}`}>
            {preview.cookedScore}
            <span className="text-base text-zinc-500">/100</span>
          </span>
        </div>
        <p className="mt-4 text-zinc-200">{preview.roast}</p>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-brand-500/40 bg-zinc-900/60 p-6">
        <div aria-hidden className="select-none blur-[6px]">
          <h3 className="mb-3 text-lg font-semibold text-white">Your top fixes</h3>
          <ul className="space-y-2 text-zinc-300">
            {(preview.topFixes ?? []).slice(0, 5).map((f, i) => (
              <li key={i}>• {f}</li>
            ))}
          </ul>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/60 p-6 text-center">
          <span className="text-2xl">🔒</span>
          <p className="max-w-md text-zinc-100">
            Your full roast is ready:{" "}
            <span className="font-semibold text-white">
              5 specific problems, exact fixes, and rewritten bullet points.
            </span>
          </p>
          <Link
            href="/auth/sign-up?next=/roast"
            className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Sign up free to unlock →
          </Link>
          <p className="text-xs text-zinc-500">Takes 10 seconds. No card required.</p>
        </div>
      </section>
    </div>
  );
}

function PreviewLimited() {
  return (
    <section className="rounded-2xl border border-brand-500/40 bg-brand-500/5 p-6 text-center">
      <p className="mx-auto max-w-md text-zinc-100">
        You&apos;ve used your free preview.{" "}
        <span className="font-semibold text-white">Sign up free</span> to roast unlimited
        resumes and unlock your full breakdown.
      </p>
      <Link
        href="/auth/sign-up?next=/roast"
        className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Sign up free →
      </Link>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-200">{label}</span>
      {hint && <span className="mb-2 block text-xs text-zinc-500">{hint}</span>}
      {children}
    </label>
  );
}
