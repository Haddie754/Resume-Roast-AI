import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/lib/billing";

// Webhooks must run on Node (we need the raw body + crypto).
export const runtime = "nodejs";

// Map a Lemon Squeezy product name to our internal plan.
// Names are "FireThis Plus" and "FireThis Pro".
function planFromProductName(name: string | undefined): Plan | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (n.includes("plus")) return "plus";
  if (n.includes("pro")) return "pro";
  return null;
}

// Verify the X-Signature header against the raw body using the signing secret.
function isValidSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[ls-webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  // Read the raw body BEFORE parsing — signature is computed over the raw bytes.
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!isValidSignature(rawBody, signature, secret)) {
    console.warn("[ls-webhook] invalid signature — rejecting.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventName: string =
    req.headers.get("x-event-name") || payload?.meta?.event_name || "";

  // We only care about subscription lifecycle events.
  if (!eventName.startsWith("subscription_")) {
    return NextResponse.json({ ok: true, ignored: eventName });
  }

  const attrs = payload?.data?.attributes ?? {};
  const status: string = attrs.status ?? "";
  const productName: string | undefined = attrs.product_name;

  // The Supabase user id we attached at checkout via custom data.
  const userId: string | undefined = payload?.meta?.custom_data?.user_id;
  if (!userId) {
    console.error(
      "[ls-webhook] no custom_data.user_id on event",
      eventName,
      "— cannot link to a user. Check the checkout URL.",
    );
    // Return 200 so Lemon Squeezy doesn't retry forever; we just can't act.
    return NextResponse.json({ ok: true, warning: "missing user_id" });
  }

  // Decide the target plan based on subscription status.
  // - expired / unpaid  -> downgrade to free
  // - everything else (active, on_trial, cancelled-but-not-yet-expired, paused)
  //   -> keep them on the paid plan they bought (cancelled users keep access
  //      until the period ends, at which point subscription_expired fires).
  let targetPlan: Plan;
  if (status === "expired" || status === "unpaid") {
    targetPlan = "free";
  } else {
    const paidPlan = planFromProductName(productName);
    if (!paidPlan) {
      console.error("[ls-webhook] could not map product to plan:", productName);
      return NextResponse.json({ ok: true, warning: "unknown product" });
    }
    targetPlan = paidPlan;
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ plan: targetPlan })
    .eq("id", userId);

  if (error) {
    console.error("[ls-webhook] failed to update profile:", error.message);
    // 500 so Lemon Squeezy retries — the DB write is the important part.
    return NextResponse.json({ error: "DB update failed." }, { status: 500 });
  }

  console.log(`[ls-webhook] ${eventName}: user ${userId} -> plan "${targetPlan}"`);
  return NextResponse.json({ ok: true });
}
