"use client";

import { useState, useRef } from "react";
import Button from "@/components/Button";
import RoastResultView from "@/components/RoastResult";
import type { RoastResult } from "@/app/api/roast/route";

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

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
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
            <Field label="Resume file" hint="PDF, DOCX, or TXT — we'll extract the text automatically.">
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
            </Field>
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

          <Field label="School">
            <input
              required
              value={form.school}
              onChange={(e) => update("school", e.target.value)}
              placeholder="e.g. NYU"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </Field>

          <Field label="Major">
            <input
              required
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
          {loading ? "Cooking..." : "🔥 Roast My Resume"}
        </Button>
      </form>

      <div id="results">
        {loading && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 text-center text-zinc-400">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-brand-500" />
            <p className="mt-4">Firing up the grill...</p>
          </div>
        )}
        {result && <RoastResultView result={result} />}
      </div>
    </div>
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
