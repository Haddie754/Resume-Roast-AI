import { createClient } from "@/lib/supabase/server";
import { isPaid } from "@/lib/billing";
import PaywallScreen from "@/components/PaywallScreen";
import ProBanner from "@/components/ProBanner";
import WorkerForm from "./WorkerForm";

export default async function WorkerPage() {
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

  // Free users and guests get the paywall instead of the form
  if (!isPaid(plan)) {
    return (
      <PaywallScreen
        feature="Resume Worker"
        description="Tailor your resume to any job description. Get an ATS match score, missing keywords, improved bullet points, and a custom summary, all built around the role you actually want."
        signedIn={!!user}
        bullets={[
          "ATS match score (0–100) vs the JD",
          "Missing keywords pulled straight from the posting",
          "Rewrites of your weakest bullets",
          "What to remove + what to lean into",
        ]}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Resume Worker
        </h1>
        <p className="mt-2 text-zinc-400">
          Tailor your resume to a specific job description. ATS-aware, no fluff.
        </p>
      </header>

      <ProBanner />

      <WorkerForm />
    </div>
  );
}
