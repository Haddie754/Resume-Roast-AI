"use client";

import { useState } from "react";
import ResumePreview from "./ResumePreview";
import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

function safeName(name: string): string {
  return (
    (name || "resume").trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "") || "resume"
  );
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

// HTML preview (reliable in every browser) + on-click PDF/DOCX generation.
// The heavy libraries load only when a download button is clicked.
export default function ResumeDownloadPanel({ resume }: { resume: StructuredResume }) {
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);
  const base = safeName(resume.name);

  async function downloadPdf() {
    setBusy("pdf");
    try {
      const [{ pdf }, { default: ResumePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ResumePdf"),
      ]);
      const blob = await pdf(<ResumePdf resume={resume} />).toBlob();
      triggerDownload(blob, `${base}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  async function downloadDocx() {
    setBusy("docx");
    try {
      const { buildResumeDocx } = await import("@/lib/resume/buildDocx");
      const blob = await buildResumeDocx(resume);
      triggerDownload(blob, `${base}.docx`);
    } finally {
      setBusy(null);
    }
  }

  const btn = "rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadPdf}
          disabled={busy !== null}
          className={`${btn} bg-brand-500 text-white hover:bg-brand-600`}
        >
          {busy === "pdf" ? "Preparing…" : "Download PDF"}
        </button>
        <button
          type="button"
          onClick={downloadDocx}
          disabled={busy !== null}
          className={`${btn} border border-white/10 bg-white/5 text-white hover:bg-white/10`}
        >
          {busy === "docx" ? "Building…" : "Download DOCX"}
        </button>
      </div>

      <ResumePreview resume={resume} />
    </div>
  );
}
