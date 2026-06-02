import ProBanner from "@/components/ProBanner";
import WorkerForm from "./WorkerForm";

export default function WorkerPage() {
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
