import { createClient } from "@/lib/supabase/server";
import { isPaid } from "@/lib/billing";
import PaywallScreen from "@/components/PaywallScreen";
import ProBanner from "@/components/ProBanner";
import CoverLetterForm from "./CoverLetterForm";

export default async function CoverLetterPage() {
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

  if (!isPaid(plan)) {
    return (
      <PaywallScreen
        feature="Cover Letter Writer"
        description="Generate a personalized cover letter, a recruiter outreach message, and three subject lines — all tuned to the company and role you're applying to."
        signedIn={!!user}
        bullets={[
          "Custom cover letter in your chosen tone",
          "Recruiter outreach message you can DM",
          "3 cold-email subject lines to pick from",
          "Pulls language straight from your resume",
        ]}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Cover Letter Writer
        </h1>
        <p className="mt-2 text-zinc-400">
          Personalized cover letter, recruiter outreach, and 3 subject lines.
        </p>
      </header>

      <ProBanner />

      <CoverLetterForm />
    </div>
  );
}
