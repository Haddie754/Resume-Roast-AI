import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  COVER_LETTER_SYSTEM_PROMPT,
  buildCoverLetterPrompt,
} from "@/lib/prompts/coverLetterPrompt";
import { createClient } from "@/lib/supabase/server";
import { isPaid } from "@/lib/billing";
import {
  checkFreeMonthlyLimit,
  recordFreeMonthlyUse,
} from "@/lib/auth/freeMonthlyLimit";

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
  // 1. Require authentication.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to use the Cover Letter Writer." },
      { status: 401 },
    );
  }

  // 2. Load the user's plan.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) {
    console.error("[/api/cover-letter] profile fetch failed:", profileError);
    return NextResponse.json(
      { error: "Could not load your account. Try refreshing." },
      { status: 500 },
    );
  }
  const paid = isPaid(profile.plan);

  // 3. Enforce the free monthly limit (paid plans bypass).
  let limit;
  try {
    limit = await checkFreeMonthlyLimit(supabase, user.id, "cover_letter", paid);
  } catch (err) {
    console.error("[/api/cover-letter] usage check failed:", err);
    // A metering hiccup must never block a paying customer (they're unlimited).
    if (!paid) {
      return NextResponse.json(
        { error: "Could not check your usage. Try refreshing." },
        { status: 500 },
      );
    }
    limit = { allowed: true, usage: 0, month: new Date().toISOString().slice(0, 7) };
  }
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "You've used your free cover letter for this month. Upgrade for unlimited.",
        upgradeUrl: "/pricing",
      },
      { status: 429 },
    );
  }

  // 4. Validate input.
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

  // 5. Generate.
  try {
    const ai = await generateAIResponse(buildCoverLetterPrompt(parsed.data), {
      system: COVER_LETTER_SYSTEM_PROMPT,
      json: true,
      temperature: 0.7,
    });
    const result = parseModelJson<CoverLetterResult>(ai.text);

    // 6. Count this successful run (failures above don't burn the free try).
    //    Recording must never fail a successful generation.
    try {
      await recordFreeMonthlyUse(supabase, user.id, "cover_letter", limit);
    } catch (err) {
      console.error("[/api/cover-letter] usage record failed:", err);
    }

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
