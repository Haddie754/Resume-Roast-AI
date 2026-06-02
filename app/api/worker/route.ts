import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  workerSystemPrompt,
  buildWorkerPrompt,
} from "@/lib/prompts/resumeWorkerPrompt";
import { createClient } from "@/lib/supabase/server";
import { isPro, isPaid } from "@/lib/billing";
import {
  checkFreeMonthlyLimit,
  recordFreeMonthlyUse,
} from "@/lib/auth/freeMonthlyLimit";

export const runtime = "nodejs";

const WorkerRequestSchema = z.object({
  resume: z.string().min(50).max(20000),
  jobDescription: z.string().min(30).max(20000),
  targetRole: z.string().min(1).max(200),
});

// Pro-only deeper audit returned alongside the base result.
export interface WorkerProInsights {
  atsRedFlags: string[];
  formattingFixes: string[];
  visaStrategy: {
    sponsorshipOutlook: string;
    companyTargeting: string[];
    tips: string[];
  };
}

export interface WorkerResult {
  atsMatchScore: number;
  matchSummary: string;
  missingKeywords: string[];
  improvedBullets: { before: string; after: string }[];
  suggestedSummary: string;
  whatToRemove: string[];
  whatToEmphasize: string[];
  proInsights?: WorkerProInsights;
}

export async function POST(req: NextRequest) {
  // 1. Require authentication.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to use the Resume Worker." },
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
    console.error("[/api/worker] profile fetch failed:", profileError);
    return NextResponse.json(
      { error: "Could not load your account. Try refreshing." },
      { status: 500 },
    );
  }
  const paid = isPaid(profile.plan);
  const pro = isPro(profile.plan);

  // 3. Enforce the free monthly limit (paid plans bypass).
  let limit;
  try {
    limit = await checkFreeMonthlyLimit(supabase, user.id, "worker", paid);
  } catch (err) {
    console.error("[/api/worker] usage check failed:", err);
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
          "You've used your free Resume Worker run for this month. Upgrade for unlimited.",
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

  const parsed = WorkerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 5. Generate. Pro users get the deeper ATS + visa-strategy output.
  try {
    const ai = await generateAIResponse(buildWorkerPrompt(parsed.data, pro), {
      system: workerSystemPrompt(pro),
      json: true,
      temperature: 0.5,
    });
    const result = parseModelJson<WorkerResult>(ai.text);
    // Never leak Pro output to a non-Pro plan, even if the model returns it.
    if (!pro) delete result.proInsights;

    // 6. Count this successful run (failures above don't burn the free try).
    //    Recording must never fail a successful generation.
    try {
      await recordFreeMonthlyUse(supabase, user.id, "worker", limit);
    } catch (err) {
      console.error("[/api/worker] usage record failed:", err);
    }

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
