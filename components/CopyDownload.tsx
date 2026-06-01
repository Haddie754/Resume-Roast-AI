"use client";

import { useState } from "react";

/**
 * Small Copy + Download (.txt) action row for generated text outputs.
 * Fully client-side — no API calls, no cost.
 */
export default function CopyDownload({
  text,
  filename = "firethis.txt",
  downloadable = true,
}: {
  text: string;
  filename?: string;
  downloadable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently no-op.
    }
  }

  function handleDownload() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const btn =
    "rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={handleCopy} className={btn}>
        {copied ? "Copied ✓" : "Copy"}
      </button>
      {downloadable && (
        <button type="button" onClick={handleDownload} className={btn}>
          Download .txt
        </button>
      )}
    </div>
  );
}
