import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isPro } from "@/lib/billing";
import PaywallScreen from "@/components/PaywallScreen";
import type { RoastResult } from "@/app/api/roast/route";

export const metadata = {
  title: "Roast History | FireThis",
  description: "Your saved resume roasts, tracked over time. A Pro feature.",
};

interface RoastRow {
  id: string;
  target_role: string | null;
  school: string | null;
  result: RoastResult;
  created_at: string;
}

function scoreColor(score: number) {
  if (score >= 75) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-emerald-400";
}

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let plan: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    plan = profile?.plan as string | undefined;
  }

  // Roast history is a Pro-only feature. Free and Plus users see the paywall.
  if (!isPro(plan)) {
    return (
      <PaywallScreen
        feature="Roast History"
        description="Every roast you run is saved to your account. Come back any time to track your Cooked Score, revisit past fixes, and watch your resume improve over the season."
        signedIn={!!user}
        bullets={[
          "Every roast saved automatically",
          "Track your Cooked Score over time",
          "Revisit the fixes and rewrites from any past roast",
          "Never lose a good rewrite again",
        ]}
      />
    );
  }

  const { data, error } = await supabase
    .from("roasts")
    .select("id, target_role, school, result, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const roasts = (data ?? []) as RoastRow[];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Roast History
        </h1>
        <p className="mt-2 text-zinc-400">
          Every roast you&apos;ve run, newest first. Track your progress over time.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Could not load your history. Try refreshing.
        </div>
      )}

      {!error && roasts.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-10 text-center">
          <p className="text-zinc-300">No roasts yet.</p>
          <Link
            href="/roast"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Run your first roast
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {roasts.map((row) => {
          const r = row.result;
          const date = new Date(row.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <details
              key={row.id}
              className="group rounded-2xl border border-white/10 bg-zinc-900/60 p-6"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className={`text-4xl font-extrabold ${scoreColor(r.cookedScore)}`}>
                    {r.cookedScore}
                    <span className="text-base text-zinc-500">/100</span>
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      {row.target_role || "Untitled role"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {row.school ? `${row.school} · ` : ""}
                      {date}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-sm font-semibold text-brand-300">
                  🔥 {r.diagnosis}
                </span>
              </summary>

              <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
                <p className="text-zinc-200">{r.roast}</p>
                {r.topFixes?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-400">
                      Top fixes
                    </p>
                    <ol className="list-decimal space-y-1 pl-5 text-zinc-200">
                      {r.topFixes.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
