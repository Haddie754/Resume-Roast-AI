import type { RoastResult } from "@/app/api/roast/route";

function scoreColor(score: number) {
  if (score >= 75) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-yellow-400";
  return "text-emerald-400";
}

export default function RoastResultView({ result }: { result: RoastResult }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-400">Cooked Score</p>
            <p className={`text-6xl font-extrabold tracking-tight ${scoreColor(result.cookedScore)}`}>
              {result.cookedScore}<span className="text-2xl text-zinc-500">/100</span>
            </p>
          </div>
          <div className="rounded-full bg-brand-500/20 px-4 py-2 text-lg font-semibold text-brand-300">
            🔥 {result.diagnosis}
          </div>
        </div>
        <p className="mt-6 text-lg leading-relaxed text-zinc-200">{result.roast}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Top 5 Problems" tone="red">
          <ol className="list-decimal space-y-2 pl-5 text-zinc-200">
            {result.topProblems.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </Card>
        <Card title="Top 5 Fixes" tone="emerald">
          <ol className="list-decimal space-y-2 pl-5 text-zinc-200">
            {result.topFixes.map((f, i) => <li key={i}>{f}</li>)}
          </ol>
        </Card>
      </div>

      <Card title="Rewritten Bullets" tone="brand">
        <div className="space-y-4">
          {result.rewrittenBullets.map((b, i) => (
            <div key={i} className="rounded-lg border border-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Before</p>
              <p className="mt-1 text-zinc-400 line-through decoration-zinc-600">{b.before}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-emerald-400">After</p>
              <p className="mt-1 text-zinc-100">{b.after}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="ATS Keywords to Add" tone="blue">
        <div className="flex flex-wrap gap-2">
          {result.atsKeywords.map((k, i) => (
            <span key={i} className="rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-300">
              {k}
            </span>
          ))}
        </div>
      </Card>

      <Card title="Final Word" tone="brand">
        <p className="text-zinc-200">{result.summary}</p>
      </Card>
    </div>
  );
}

const toneRing: Record<string, string> = {
  red: "border-red-500/30",
  emerald: "border-emerald-500/30",
  brand: "border-brand-500/30",
  blue: "border-blue-500/30",
};

function Card({
  title,
  tone,
  children,
}: {
  title: string;
  tone: keyof typeof toneRing;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border bg-zinc-900/60 p-6 ${toneRing[tone]}`}>
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      {children}
    </section>
  );
}
