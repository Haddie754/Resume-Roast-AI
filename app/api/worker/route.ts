import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  WORKER_SYSTEM_PROMPT,
  buildWorkerPrompt,
} from "@/lib/prompts/resumeWorkerPrompt";
import { requirePaidUser } from "@/lib/auth/requirePaid";

export const runtime = "nodejs";

const WorkerRequestSchema = z.object({
  resume: z.string().min(50).max(20000),
  jobDescription: z.string().min(30).max(20000),
  targetRole: z.string().min(1).max(200),
});

export interface WorkerResult {
  atsMatchScore: number;
  matchSummary: string;
  missingKeywords: string[];
  improvedBullets: { before: string; after: string }[];
  suggestedSummary: string;
  whatToRemove: string[];
  whatToEmphasize: string[];
}

export async function POST(req: NextRequest) {
  // Gate: must be signed in + on a paid plan
  const gate = await requirePaidUser();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = WorkerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const ai = await generateAIResponse(buildWorkerPrompt(parsed.data), {
      system: WORKER_SYSTEM_PROMPT,
      json: true,
      temperature: 0.5,
    });
    const result = parseModelJson<WorkerResult>(ai.text);
    return NextResponse.json({ result, provider: ai.provider, model: ai.model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/worker] failed:", message);
    return NextResponse.json(
      { error: "Worker is taking a break. Try again.", detail: message },
      { status: 500 },
    );
  }
}
