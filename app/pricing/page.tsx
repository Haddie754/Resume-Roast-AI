import Link from "next/link";

interface Plan {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Get a taste of the roast.",
    features: [
      "1 resume roast per month",
      "Cooked Score",
      "Top 3 fixes",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$3.99",
    cadence: "per month",
    description: "Everything you need to actually land interviews.",
    features: [
      "Unlimited resume roasts",
      "Resume Worker",
      "Cover Letter Writer",
      "ATS optimization",
      "Saved resume versions",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "International Pro",
    price: "$7.99",
    cadence: "per month",
    description: "Built for F-1/OPT students who need a sharper edge.",
    features: [
      "Everything in Pro",
      "Sponsorship-aware suggestions",
      "F-1/OPT-focused job strategy",
      "Company targeting for visa-friendly roles",
      "Cover letter guidance for visa context",
    ],
    cta: "Upgrade to International Pro",
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Pricing
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Start free. Upgrade when you&apos;re applying for real. Payments aren&apos;t live yet — early
          access spots open soon.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-2xl border p-6 ${
              plan.highlight
                ? "border-brand-500/50 bg-brand-500/5 shadow-lg shadow-brand-500/10"
                : "border-white/10 bg-zinc-900/60"
            }`}
          >
            {plan.highlight && (
              <span className="mb-4 inline-block w-fit rounded-full bg-brand-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
                Most popular
              </span>
            )}
            <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-white">{plan.price}</span>
              <span className="text-zinc-400">/ {plan.cadence}</span>
            </div>

            <ul className="mt-6 flex-1 space-y-2 text-zinc-200">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-brand-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className={`mt-8 cursor-not-allowed rounded-md px-4 py-2.5 text-sm font-semibold ${
                plan.highlight
                  ? "bg-brand-500/70 text-white"
                  : "bg-white/10 text-zinc-200"
              }`}
              title="Payments coming soon"
            >
              {plan.cta} — coming soon
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center text-zinc-300">
        Want early access? <Link href="/roast" className="text-brand-400 hover:underline">Try the free roast</Link> in the meantime.
      </div>
    </div>
  );
}
