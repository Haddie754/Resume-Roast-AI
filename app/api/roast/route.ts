import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  ROAST_SYSTEM_PROMPT,
  buildRoastPrompt,
} from "@/lib/prompts/resumeRoastPrompt";

// Force Node runtime so process.env reads are reliable (Edge can be flaky for some SDKs).
export const runtime = "nodejs";

const RoastRequestSchema = z.object({
  resume: z.string().min(50, "Paste at least a few lines of your resume.").max(20000),
  targetRole: z.enum([
    "Software Engineer Intern",
    "Data Analyst",
    "Product Manager",
    "Business Analyst",
    "Other",
  ]),
  school: z.string().min(1).max(200),
  major: z.string().min(1).max(200),
  gpa: z.string().max(20).optional().or(z.literal("")),
  year: z.enum(["freshman", "sophomore", "junior", "senior", "new grad"]),
  internationalStudent: z.boolean(),
  targetCompanies: z.string().max(500).optional().or(z.literal("")),
});

export interface RoastResult {
  cookedScore: number;
  diagnosis: string;
  roast: string;
  topProblems: string[];
  topFixes: string[];
  rewrittenBullets: { before: string; after: string }[];
  atsKeywords: string[];
  summary: string;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RoastRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = {
    ...parsed.data,
    gpa: parsed.data.gpa || undefined,
    targetCompanies: parsed.data.targetCompanies || undefined,
  };

  try {
    const ai = await generateAIResponse(buildRoastPrompt(input), {
      system: ROAST_SYSTEM_PROMPT,
      json: true,
      temperature: 0.8,
    });

    const result = parseModelJson<RoastResult>(ai.text);
    return NextResponse.json({ result, provider: ai.provider, model: ai.model });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/roast] failed:", message);
    return NextResponse.json(
      { error: "The roast oven is broken. Try again.", detail: message },
      { status: 500 },
    );
  }
}
