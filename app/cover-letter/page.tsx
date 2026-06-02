import ProBanner from "@/components/ProBanner";
import CoverLetterForm from "./CoverLetterForm";

export default function CoverLetterPage() {
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
