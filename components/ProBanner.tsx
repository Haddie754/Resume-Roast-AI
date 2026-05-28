import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isPaid, isPro } from "@/lib/billing";

// Server component that reads the user's plan and renders the right state:
//  signed out  -> "Sign in to unlock"
//  free        -> "Upgrade to unlock"
//  plus / pro  -> small "unlocked" confirmation
export default async function ProBanner() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-100 sm:flex-row sm:items-center">
        <div>
          <span className="rounded-full bg-brand-500/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-100">
            Paid feature
          </span>{" "}
          Sign in to unlock this. Free roasts are on the{" "}
          <Link href="/roast" className="underline">
            roast page
          </Link>
          .
        </div>
        <Link
          href="/auth/sign-in"
          className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan as string | undefined;

  if (isPaid(plan)) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
        <span>
          <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-100">
            {isPro(plan) ? "Pro" : "Plus"}
          </span>{" "}
          unlocked for you. Have fun.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-100 sm:flex-row sm:items-center">
      <div>
        <span className="rounded-full bg-brand-500/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-100">
          Paid feature
        </span>{" "}
        Upgrade to use this tool. Cancel anytime.
      </div>
      <Link
        href="/pricing"
        className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
      >
        See plans
      </Link>
    </div>
  );
}
