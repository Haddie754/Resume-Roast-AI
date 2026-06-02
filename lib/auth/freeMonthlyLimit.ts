import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Free-tier monthly metering, shared by Roast / Worker / Cover Letter.
 *
 * Each tool tracks two columns on `profiles`:
 *   <tool> usage  -> integer count used this month
 *   <tool> month  -> "YYYY-MM" the count belongs to
 * When the stored month is stale, the counter resets.
 *
 * Free users get FREE_MONTHLY_LIMIT uses per tool per month. Paid users bypass.
 */

export type MeteredTool = "roast" | "worker" | "cover_letter";

const FREE_MONTHLY_LIMIT = 1;

// Explicit column map — no string-building guesswork.
const COLUMNS: Record<MeteredTool, { usage: string; month: string }> = {
  roast: { usage: "roasts_used_this_month", month: "roast_month" },
  worker: { usage: "workers_used_this_month", month: "worker_month" },
  cover_letter: {
    usage: "cover_letters_used_this_month",
    month: "cover_letter_month",
  },
};

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export interface FreeLimitState {
  allowed: boolean; // can this request proceed?
  usage: number; // uses already consumed this (reset-aware) month
  month: string; // current month key, for the follow-up write
}

/**
 * Reads a user's usage for a tool, resetting the counter if the month rolled over.
 * Throws if the profile row can't be read (caller maps to a 500).
 */
export async function checkFreeMonthlyLimit(
  supabase: SupabaseClient,
  userId: string,
  tool: MeteredTool,
  paid: boolean,
): Promise<FreeLimitState> {
  const { usage: usageCol, month: monthCol } = COLUMNS[tool];
  const month = currentMonth();

  const { data, error } = await supabase
    .from("profiles")
    .select(`${usageCol}, ${monthCol}`)
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(`Could not load profile usage: ${error?.message ?? "no row"}`);
  }

  const row = data as unknown as Record<string, unknown>;
  let usage = typeof row[usageCol] === "number" ? (row[usageCol] as number) : 0;
  const storedMonth = (row[monthCol] as string | null) ?? null;

  // New month → reset before evaluating the limit.
  if (storedMonth !== month) {
    usage = 0;
    await supabase
      .from("profiles")
      .update({ [usageCol]: 0, [monthCol]: month })
      .eq("id", userId);
  }

  const allowed = paid || usage < FREE_MONTHLY_LIMIT;
  return { allowed, usage, month };
}

/**
 * Records one successful use. Pass the `state` returned by checkFreeMonthlyLimit
 * so the written count is accurate and reset-aware.
 */
export async function recordFreeMonthlyUse(
  supabase: SupabaseClient,
  userId: string,
  tool: MeteredTool,
  state: Pick<FreeLimitState, "usage" | "month">,
): Promise<void> {
  const { usage: usageCol, month: monthCol } = COLUMNS[tool];
  await supabase
    .from("profiles")
    .update({ [usageCol]: state.usage + 1, [monthCol]: state.month })
    .eq("id", userId);
}
