"use client";

import { useState, useRef } from "react";

interface ResumeInputProps {
  value: string;
  onChange: (text: string) => void;
  label?: string;
}

/**
 * Reusable resume input with a Paste / Upload toggle.
 * Upload posts to /api/parse-resume and writes the extracted text back via onChange.
 * Shared by the Roast, Worker, and Cover Letter forms.
 */
export default function ResumeInput({ value, onChange, label = "Resume" }: ResumeInputProps) {
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onChange(json.text);
      setUploadedFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        <div className="flex w-fit gap-1 rounded-lg border border-white/10 bg-zinc-950 p-1">
          <button
            type="button"
            onClick={() => setInputMode("paste")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              inputMode === "paste"
                ? "bg-brand-500 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            📋 Paste
          </button>
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              inputMode === "upload"
                ? "bg-brand-500 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            📎 Upload
          </button>
        </div>
      </div>

      {inputMode === "paste" ? (
        <textarea
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your resume..."
          className="h-64 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
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
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
          }}
          className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors ${
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
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
