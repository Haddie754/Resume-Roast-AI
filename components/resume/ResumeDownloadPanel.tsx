"use client";

import { useMemo, useState } from "react";
import ResumePreview from "./ResumePreview";
import ResumeEditor from "./ResumeEditor";
import { toDraft, fromDraft, type DraftResume } from "@/lib/resume/resumeDraft";
import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

function safeName(name: string): string {
  return (
    (name || "resume").trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "") || "resume"
  );
}

// Plain-data deep clone — the draft only holds strings/booleans/arrays.
function clone(d: DraftResume): DraftResume {
  return JSON.parse(JSON.stringify(d)) as DraftResume;
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

// HTML preview (reliable in every browser) + on-click PDF/DOCX generation, all
// driven by an editable draft. Toggling/editing is instant and never hits the AI.
export default function ResumeDownloadPanel({ resume }: { resume: StructuredResume }) {
  const [draft, setDraft] = useState<DraftResume>(() => toDraft(resume));
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);

  const update = (mut: (d: DraftResume) => void) =>
    setDraft((prev) => {
      const next = clone(prev);
      mut(next);
      return next;
    });

  // Everything (preview + downloads) renders from the edited, trimmed data.
  const final = useMemo(() => fromDraft(draft), [draft]);
  const base = safeName(final.name);

  async function downloadPdf() {
    setBusy("pdf");
    try {
      const [{ pdf }, { default: ResumePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ResumePdf"),
      ]);
      const blob = await pdf(<ResumePdf resume={final} />).toBlob();
      triggerDownload(blob, `${base}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  async function downloadDocx() {
    setBusy("docx");
    try {
      const { buildResumeDocx } = await import("@/lib/resume/buildDocx");
      const blob = await buildResumeDocx(final);
      triggerDownload(blob, `${base}.docx`);
    } finally {
      setBusy(null);
    }
  }

  const btn = "rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`${btn} ml-auto border border-white/10 bg-white/5 text-white hover:bg-white/10`}
        >
          {editing ? "Done editing" : "Edit & trim"}
        </button>
      </div>

      {editing && <ResumeEditor draft={draft} update={update} />}

      <ResumePreview resume={final} />
    </div>
  );
}
