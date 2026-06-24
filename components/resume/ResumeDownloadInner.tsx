"use client";

import { useState } from "react";
import { usePDF } from "@react-pdf/renderer";
import ResumePdf from "./ResumePdf";
import { buildResumeDocx } from "@/lib/resume/buildDocx";
import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

function safeName(name: string): string {
  return (
    (name || "resume")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w-]/g, "") || "resume"
  );
}

// Client-only (loaded via ssr:false). usePDF renders the PDF once and gives us a
// blob URL we use for BOTH the inline preview and the download — so the preview
// is exactly what downloads.
export default function ResumeDownloadInner({ resume }: { resume: StructuredResume }) {
  const [instance] = usePDF({ document: <ResumePdf resume={resume} /> });
  const [docxBusy, setDocxBusy] = useState(false);
  const base = safeName(resume.name);

  async function downloadDocx() {
    setDocxBusy(true);
    try {
      const blob = await buildResumeDocx(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDocxBusy(false);
    }
  }

  const btn = "rounded-md px-4 py-2 text-sm font-semibold transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {instance.url ? (
          <a
            href={instance.url}
            download={`${base}.pdf`}
            className={`${btn} bg-brand-500 text-white hover:bg-brand-600`}
          >
            Download PDF
          </a>
        ) : (
          <span className={`${btn} bg-brand-500/60 text-white`}>Preparing PDF…</span>
        )}
        <button
          type="button"
          onClick={downloadDocx}
          disabled={docxBusy}
          className={`${btn} border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50`}
        >
          {docxBusy ? "Building…" : "Download DOCX"}
        </button>
      </div>

      {/* Preview = the exact PDF that downloads */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
        {instance.url ? (
          <iframe title="Resume preview" src={instance.url} className="h-[760px] w-full" />
        ) : (
          <div className="flex h-[300px] items-center justify-center text-zinc-500">
            {instance.error ? "Couldn't render preview." : "Rendering preview…"}
          </div>
        )}
      </div>
    </div>
  );
}
