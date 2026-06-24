import ProBanner from "@/components/ProBanner";
import CoverLetterForm from "./CoverLetterForm";
import { createClient } from "@/lib/supabase/server";
import { isPro } from "@/lib/billing";

export default async function CoverLetterPage() {
  // Polished PDF/Word downloads are Pro-only — read the plan to gate them.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pro = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    pro = isPro(profile?.plan);
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

      <CoverLetterForm isPro={pro} />
    </div>
  );
}
