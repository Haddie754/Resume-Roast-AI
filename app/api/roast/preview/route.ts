import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  ROAST_SYSTEM_PROMPT,
  buildRoastPrompt,
} from "@/lib/prompts/resumeRoastPrompt";
import type { RoastResult } from "@/app/api/roast/route";

export const runtime = "nodejs";

// Anonymous "taste before signup" roast. No account required; the client shows
// the Cooked Score + diagnosis and gates the full breakdown behind sign-up.
// A cookie caps this at one free preview per browser to control AI cost/abuse.

const PREVIEW_COOKIE = "ft_preview_used";

const PreviewSchema = z.object({
  resume: z.string().min(50).max(20000),
  targetRole: z.string().max(200).optional().or(z.literal("")),
  school: z.string().max(200).optional().or(z.literal("")),
  major: z.string().max(200).optional().or(z.literal("")),
  gpa: z.string().max(20).optional().or(z.literal("")),
  year: z.string().max(30).optional().or(z.literal("")),
  internationalStudent: z.boolean().optional(),
  targetCompanies: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  // One free preview per browser — after that, prompt sign-up.
  if (cookies().get(PREVIEW_COOKIE)) {
    return NextResponse.json({ limited: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = PreviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paste at least a few lines of your resume." },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const input = {
    resume: d.resume,
    targetRole: d.targetRole || "Software Engineer Intern",
    school: d.school || "(not provided)",
    major: d.major || "(not provided)",
    gpa: d.gpa || undefined,
    year: d.year || "(not provided)",
    internationalStudent: d.internationalStudent ?? false,
    targetCompanies: d.targetCompanies || undefined,
  };

  try {
    const ai = await generateAIResponse(buildRoastPrompt(input), {
      system: ROAST_SYSTEM_PROMPT,
      json: true,
      temperature: 0.8,
    });
    const result = parseModelJson<RoastResult>(ai.text);

    const res = NextResponse.json({ result });
    // Mark the free preview as used (30 days).
    res.cookies.set(PREVIEW_COOKIE, "1", {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/roast/preview] failed:", message);
    return NextResponse.json(
      { error: "The roast oven is broken. Try again." },
      { status: 500 },
    );
  }
}
