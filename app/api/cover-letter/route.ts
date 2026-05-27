import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  COVER_LETTER_SYSTEM_PROMPT,
  buildCoverLetterPrompt,
} from "@/lib/prompts/coverLetterPrompt";
import { requirePaidUser } from "@/lib/auth/requirePaid";

export const runtime = "nodejs";

const CoverLetterRequestSchema = z.object({
  resume: z.string().min(50).max(20000),
  jobDescription: z.string().min(30).max(20000),
  companyName: z.string().min(1).max(200),
  tone: z.enum(["professional", "confident", "friendly"]),
});

export interface CoverLetterResult {
  coverLetter: string;
  recruiterMessage: string;
  subjectLines: string[];
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

  const parsed = CoverLetterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const ai = await generateAIResponse(buildCoverLetterPrompt(parsed.data), {
      system: COVER_LETTER_SYSTEM_PROMPT,
      json: true,
      temperature: 0.7,
    });
    const result = parseModelJson<CoverLetterResult>(ai.text);
    return NextResponse.json({ result, provider: ai.provider, model: ai.model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/cover-letter] failed:", message);
    return NextResponse.json(
      { error: "Cover letter writer is stuck. Try again.", detail: message },
      { status: 500 },
    );
  }
}
