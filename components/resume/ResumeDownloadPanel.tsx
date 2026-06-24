"use client";

import dynamic from "next/dynamic";
import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

// @react-pdf/renderer's usePDF/PDFViewer touch browser APIs, so the inner panel
// must never render on the server. ssr:false guarantees client-only.
const Inner = dynamic(() => import("./ResumeDownloadInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-white/10 text-zinc-500">
      Loading preview…
    </div>
  ),
});

export default function ResumeDownloadPanel({ resume }: { resume: StructuredResume }) {
  return <Inner resume={resume} />;
}
