import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPaid, isPro } from "@/lib/billing";

type Ok = { ok: true; userId: string; plan: string };
type Err = { ok: false; response: NextResponse };

/**
 * Server-side gate for Pro-only API routes.
 * - 401 if not signed in
 * - 402 (Payment Required) if signed in but on the free plan
 * Returns { ok, userId, plan } on success.
 */
export async function requirePaidUser(): Promise<Ok | Err> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Please sign in to use this feature.", code: "UNAUTHENTICATED" },
        { status: 401 },
      ),
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Could not load your account. Try refreshing." },
        { status: 500 },
      ),
    };
  }

  if (!isPaid(profile.plan)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "This feature is part of Plus and Pro. Upgrade to unlock it.",
          code: "UPGRADE_REQUIRED",
          upgradeUrl: "/pricing",
        },
        { status: 402 },
      ),
    };
  }

  return { ok: true, userId: user.id, plan: profile.plan };
}

/**
 * Server-side gate for Pro-ONLY API routes (the top tier).
 * - 401 if not signed in
 * - 402 (Payment Required) if signed in but not on the Pro plan
 *   (free and Plus users both get the upgrade prompt)
 * Returns { ok, userId, plan } on success.
 */
export async function requireProUser(): Promise<Ok | Err> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Please sign in to use this feature.", code: "UNAUTHENTICATED" },
        { status: 401 },
      ),
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Could not load your account. Try refreshing." },
        { status: 500 },
      ),
    };
  }

  if (!isPro(profile.plan)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "This feature is part of Pro. Upgrade to Pro to unlock it.",
          code: "PRO_REQUIRED",
          upgradeUrl: "/pricing",
        },
        { status: 402 },
      ),
    };
  }

  return { ok: true, userId: user.id, plan: profile.plan };
}
