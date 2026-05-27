import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIResponse } from "@/lib/ai/provider";
import { parseModelJson } from "@/lib/ai/parseJson";
import {
  ROAST_SYSTEM_PROMPT,
  buildRoastPrompt,
} from "@/lib/prompts/resumeRoastPrompt";
import { createClient } from "@/lib/supabase/server";

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

const FREE_MONTHLY_LIMIT = 1;

export async function POST(req: NextRequest) {
  // 1. Require authentication
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to roast your resume." },
      { status: 401 }
    );
  }

  // 2. Check user's plan and usage
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, roasts_used_this_month, roast_month")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("[/api/roast] profile fetch failed:", profileError);
    return NextResponse.json(
      { error: "Could not load your account. Try refreshing." },
      { status: 500 }
    );
  }

  // Reset monthly counter if we've rolled into a new month
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  let roastsUsed = profile.roasts_used_this_month;
  if (profile.roast_month !== currentMonth) {
    roastsUsed = 0;
    await supabase
      .from("profiles")
      .update({ roasts_used_this_month: 0, roast_month: currentMonth })
      .eq("id", user.id);
  }

  // Enforce free tier limit
  const isPro = profile.plan === "pro" || profile.plan === "international_pro";
  if (!isPro && roastsUsed >= FREE_MONTHLY_LIMIT) {
    return NextResponse.json(
      {
        error: "You've used your free roast for this month. Upgrade to Pro for unlimited roasts.",
        upgradeUrl: "/pricing",
      },
      { status: 429 }
    );
  }

  // 3. Validate input
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

  // 4. Generate the roast
  try {
    const ai = await generateAIResponse(buildRoastPrompt(input), {
      system: ROAST_SYSTEM_PROMPT,
      json: true,
      temperature: 0.8,
    });

    const result = parseModelJson<RoastResult>(ai.text);

    // 5. Save roast + bump usage counter (in parallel — failures here shouldn't block the response)
    await Promise.all([
      supabase.from("roasts").insert({
        user_id: user.id,
        target_role: input.targetRole,
        school: input.school,
        result,
      }),
      supabase
        .from("profiles")
        .update({
          roasts_used_this_month: roastsUsed + 1,
          roast_month: currentMonth,
        })
        .eq("id", user.id),
    ]);

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
