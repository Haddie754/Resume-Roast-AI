import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  BUILD_RESUME_SYSTEM_PROMPT,
  buildResumeBuilderPrompt,
  type StructuredResume,
} from "@/lib/prompts/buildResumePrompt";
import { requireProUser } from "@/lib/auth/requirePaid";

export const runtime = "nodejs";

const BuildResumeRequestSchema = z.object({
  resume: z.string().min(50).max(20000),
  targetRole: z.string().max(200).optional().or(z.literal("")),
  jobDescription: z.string().max(20000).optional().or(z.literal("")),
});

export type { StructuredResume };

export async function POST(req: NextRequest) {
  // Pro-only feature.
  const gate = await requireProUser();
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = BuildResumeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = {
    resume: parsed.data.resume,
    targetRole: parsed.data.targetRole || undefined,
    jobDescription: parsed.data.jobDescription || undefined,
  };

  try {
    const ai = await generateAIResponse(buildResumeBuilderPrompt(input), {
      system: BUILD_RESUME_SYSTEM_PROMPT,
      json: true,
      temperature: 0.4,
    });
    const result = parseModelJson<StructuredResume>(ai.text);
    return NextResponse.json({ result, provider: ai.provider, model: ai.model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/build-resume] failed:", message);
    return NextResponse.json(
      { error: "Resume builder hit a snag. Try again.", detail: message },
      { status: 500 },
    );
  }
}
