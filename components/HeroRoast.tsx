"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { RoastResult } from "@/app/api/roast/route";

const PENDING_KEY = "ft_pending_roast";

function scoreColor(score: number): string {
  if (score >= 75) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-emerald-400";
}

// Interactive hero: paste or upload a resume → free Cooked Score right on the
// homepage, with the full roast gated behind a free sign-up. Signed-in visitors
// skip the taste entirely and get one CTA into the full tool.
export default function HeroRoast() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [resume, setResume] = useState("");
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [limited, setLimited] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  async function handleFile(file: File) {
    setUploadLoading(true);
    setError(null);
    setUploadedFileName(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't read that file.");
      setResume(json.text);
      setUploadedFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (resume.trim().length < 150) {
      setError(
        inputMode === "upload"
          ? "Upload your resume file first."
          : "Paste your full resume — we need the whole thing for an accurate score.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roast/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, targetRole: "Software Engineer Intern" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      if (data.limited) {
        setLimited(true);
        return;
      }
      const r = data.result as RoastResult;
      setResult(r);
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(r));
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // Signed-in visitors skip the taste — one CTA straight to the full tool.
  if (signedIn === true) {
    return (
      <div className="mt-10">
        <Link
          href="/roast"
          className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600"
        >
          🔥 Roast my resume
        </Link>
      </div>
    );
  }

  // Got a free preview → show the score + diagnosis, gate the rest behind sign-up.
  if (result) {
    return (
      <div className="mx-auto mt-10 max-w-xl space-y-4 text-left">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-semibold text-orange-300">
              🔥 {result.diagnosis}
            </span>
            <span className={`text-4xl font-extrabold ${scoreColor(result.cookedScore)}`}>
              {result.cookedScore}
              <span className="text-sm text-zinc-500">/100</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-zinc-200">{result.roast}</p>
        </div>
        <Link
          href="/auth/sign-up?next=/roast"
          className="block w-full rounded-md bg-brand-500 px-6 py-3 text-center text-base font-semibold text-white hover:bg-brand-600"
        >
          Sign up free to unlock your full roast →
        </Link>
        <p className="text-center text-xs text-zinc-500">
          5 specific problems, exact fixes &amp; rewritten bullets. Takes 10 seconds.
        </p>
      </div>
    );
  }

  // Used their one free preview already.
  if (limited) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-brand-500/40 bg-brand-500/5 p-6 text-center">
        <p className="text-zinc-100">
          You&apos;ve used your free preview.{" "}
          <span className="font-semibold text-white">Sign up free</span> to see your full roast.
        </p>
        <Link
          href="/auth/sign-up?next=/roast"
          className="mt-4 inline-block rounded-md bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Sign up free →
        </Link>
      </div>
    );
  }

  const tab = (active: boolean) =>
    `rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-brand-500 text-white" : "text-zinc-400 hover:text-white"
    }`;

  // Default: paste-or-upload box (anonymous or still loading auth).
  return (
    <div className="mx-auto mt-10 max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Paste / Upload toggle (matches the roast page) */}
        <div className="mx-auto flex w-fit gap-1 rounded-lg border border-white/10 bg-zinc-950 p-1">
          <button type="button" onClick={() => setInputMode("paste")} className={tab(inputMode === "paste")}>
            📋 Paste text
          </button>
          <button type="button" onClick={() => setInputMode("upload")} className={tab(inputMode === "upload")}>
            📎 Upload file
          </button>
        </div>

        {inputMode === "paste" ? (
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={7}
            placeholder="Paste your full resume here — the whole thing, not just a line or two..."
            className="w-full rounded-xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-left text-sm text-zinc-100 outline-none focus:border-brand-500"
          />
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className={`flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-sm transition-colors ${
              dragOver
                ? "border-brand-500 bg-brand-500/5"
                : uploadedFileName
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/20 bg-zinc-950/70 hover:border-brand-500/50"
            }`}
          >
            {uploadLoading ? (
              <span className="text-zinc-400">Reading file...</span>
            ) : uploadedFileName ? (
              <span className="text-center text-zinc-200">
                ✅ {uploadedFileName}
                <span className="mt-1 block text-xs text-zinc-500">click to replace</span>
              </span>
            ) : (
              <span className="text-center text-zinc-300">
                📄 Drop your resume or click to upload
                <span className="mt-1 block text-xs text-zinc-500">PDF, DOCX, or TXT</span>
              </span>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        {error && <p className="text-left text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading || uploadLoading}
          className="w-full rounded-md bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? "Cooking..." : "🔥 Get my free Cooked Score"}
        </button>
      </form>
      <p className="mt-3 text-sm text-zinc-500">Free instant score — no signup needed.</p>
    </div>
  );
}
