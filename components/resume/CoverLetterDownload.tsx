"use client";

import { useState } from "react";
import Link from "next/link";

function safeBase(company?: string): string {
  const stem = company ? `Cover_Letter_${company}` : "Cover_Letter";
  return stem.trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "") || "Cover_Letter";
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Pro-gated PDF/DOCX export for a cover letter. The free copy/.txt buttons
 * stay; these polished file exports are the Pro upgrade. Generated entirely
 * client-side (libraries are dynamic-imported only when a button is clicked).
 */
export default function CoverLetterDownload({
  text,
  company,
  isPro,
}: {
  text: string;
  company?: string;
  isPro: boolean;
}) {
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);
  const base = safeBase(company);

  async function downloadPdf() {
    setBusy("pdf");
    try {
      const [{ pdf }, { default: LetterPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./LetterPdf"),
      ]);
      const blob = await pdf(<LetterPdf text={text} />).toBlob();
      triggerDownload(blob, `${base}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  async function downloadDocx() {
    setBusy("docx");
    try {
      const { buildLetterDocx } = await import("@/lib/resume/buildLetterDocx");
      const blob = await buildLetterDocx(text);
      triggerDownload(blob, `${base}.docx`);
    } finally {
      setBusy(null);
    }
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-start justify-between gap-2 rounded-md border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs text-brand-100 sm:flex-row sm:items-center">
        <span>
          <span className="font-semibold uppercase tracking-wide">Pro</span> — download
          as a formatted PDF or Word doc.
        </span>
        <Link href="/pricing" className="shrink-0 font-semibold underline hover:no-underline">
          Upgrade
        </Link>
      </div>
    );
  }

  const btn =
    "rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-50";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={downloadPdf} disabled={busy !== null} className={btn}>
        {busy === "pdf" ? "…" : "PDF"}
      </button>
      <button type="button" onClick={downloadDocx} disabled={busy !== null} className={btn}>
        {busy === "docx" ? "…" : "Word"}
      </button>
    </div>
  );
}
