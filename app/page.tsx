import Link from "next/link";
import Mascot from "@/components/Mascot";
import HeroRoast from "@/components/HeroRoast";

export default function LandingPage() {
  return (
    <div className="space-y-24">
      <Hero />
      <NotJustChatGPT />
      <HowItWorks />
      <ExampleRoast />
      <FreeVsPro />
      <FAQ />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 px-6 py-20 text-center sm:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.18),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.10),transparent_60%)]" />
      <Mascot className="mx-auto mb-6 h-28 w-28 drop-shadow-[0_0_30px_rgba(249,115,22,0.45)]" />
      <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-zinc-300">
        For college students who actually want callbacks
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
        Get <span className="text-brand-500">Fired.</span> Get Hired.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
        Brutally honest AI feedback on your resume, with real fixes that get you interviews. Built for students, with dedicated F-1 / OPT support.
      </p>
      <HeroRoast />
    </section>
  );
}

function NotJustChatGPT() {
  const chatgpt = [
    "Generic advice you interpret yourself",
    "You do all the formatting",
    "No ATS structure or score",
    "Forgets you next session",
    "No visa guidance",
  ];
  const firethis = [
    "A Cooked Score + exact line-by-line fixes",
    "Download a formatted PDF & Word resume",
    "ATS-safe template, built in",
    "Saved history tracks your progress",
    "F-1 / OPT strategy for international students",
  ];
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-400">
        Why not just use ChatGPT?
      </p>
      <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
        Anyone can ask ChatGPT. We hand you the resume.
      </h2>
      <p className="mt-3 max-w-2xl text-zinc-400">
        ChatGPT gives you a wall of advice you still have to act on. FireThis gives you a
        scored diagnosis, rewritten bullets, and a polished, ATS-ready resume you can download
        and submit today.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
          <h3 className="text-lg font-semibold text-zinc-300">Just asking ChatGPT</h3>
          <ul className="mt-4 space-y-3">
            {chatgpt.map((p) => (
              <li key={p} className="flex gap-3 text-zinc-400">
                <span className="text-zinc-600">✕</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-brand-500/40 bg-brand-500/5 p-6">
          <h3 className="text-lg font-semibold text-white">FireThis</h3>
          <ul className="mt-4 space-y-3">
            {firethis.map((p) => (
              <li key={p} className="flex gap-3 text-zinc-200">
                <span className="text-brand-400">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", t: "Paste your resume", d: "Drop it in and tell us your target role and school." },
    { n: "2", t: "Share your context", d: "Your year, major, and whether you need visa sponsorship." },
    { n: "3", t: "Get feedback", d: "A score, diagnosis, top 5 problems to fix, and better bullet points." },
  ];
  return (
    <section>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">How it works</h2>
      <p className="mt-2 text-zinc-400">From paste to feedback in under 30 seconds.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-lg font-bold text-brand-300">
              {s.n}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{s.t}</h3>
            <p className="mt-1 text-zinc-400">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExampleRoast() {
  return (
    <section>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">Example roast</h2>
      <p className="mt-2 text-zinc-400">Here's what real feedback looks like.</p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-semibold text-orange-300">
            🔥 Medium-rare cooked
          </span>
          <span className="text-4xl font-extrabold text-orange-400">62<span className="text-base text-zinc-500">/100</span></span>
        </div>
        <p className="mt-4 text-zinc-200">
          Your resume reads like a LinkedIn skills section had a baby with a club fair flyer. &quot;Familiar with Python&quot; is not a personality trait. Show me what you built with it. Right now a recruiter spends 7 seconds on this and walks away knowing your major and nothing else.
        </p>
        <div className="mt-6 rounded-lg border border-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Before</p>
          <p className="mt-1 text-zinc-400 line-through decoration-zinc-600">
            Helped with the team website using HTML/CSS.
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-emerald-400">After</p>
          <p className="mt-1 text-zinc-100">
            Shipped 4 responsive pages on the club website using HTML/CSS/JS, growing event signups by [add metric: e.g., 35%].
          </p>
        </div>
      </div>
    </section>
  );
}

function FreeVsPro() {
  return (
    <section>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">Simple pricing</h2>
      <p className="mt-2 text-zinc-400">Start free. Upgrade when you&apos;re ready for more tools.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <PlanRow
          title="Free"
          price="$0"
          features={[
            "1 resume roast per month",
            "1 Resume Worker run per month",
            "1 cover letter per month",
            "Cooked Score + top 3 fixes",
          ]}
        />
        <PlanRow
          title="Plus"
          price="$4.99/mo"
          highlight
          features={[
            "Unlimited roasts",
            "Resume Worker",
            "Cover Letter Writer",
            "Basic ATS optimization",
          ]}
        />
        <PlanRow
          title="Pro"
          price="$5.99/mo"
          originalPrice="$8.99"
          features={[
            "Everything in Plus",
            "Resume builder (download PDF & Word)",
            "Edit & trim to one page",
            "Full ATS optimization",
            "Saved roast history",
            "F-1 / OPT job strategy",
            "Priority support",
          ]}
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 font-semibold text-emerald-300">
          Cancel anytime. No contracts.
        </span>
        <Link href="/pricing" className="text-brand-400 hover:underline">
          Compare all plans
        </Link>
      </div>
    </section>
  );
}

function PlanRow({
  title,
  price,
  originalPrice,
  features,
  highlight,
}: {
  title: string;
  price: string;
  originalPrice?: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-brand-500/40 bg-brand-500/5"
          : "border-white/10 bg-zinc-900/60"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <span className="flex items-baseline gap-1.5">
          {originalPrice && (
            <span className="text-base font-bold text-zinc-500 line-through">{originalPrice}</span>
          )}
          <span className="text-2xl font-extrabold text-white">{price}</span>
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-zinc-300">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-brand-400">✓</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQ() {
  const items = [
    {
      q: "Will the feedback be harsh?",
      a: "Honest and funny, yes. But never cruel. We focus on your resume, not you. And we're always respectful about visa status and background.",
    },
    {
      q: "Will you make up experience for me?",
      a: "No. We only critique what you actually wrote. If you're missing a metric, we suggest placeholders like [add number] instead of inventing data.",
    },
    {
      q: "Can I upload my resume file?",
      a: "Yes. You can upload a PDF, Word doc (.docx), or plain text file, or just paste your resume text directly. Either way works.",
    },
    {
      q: "Do I need to sign up?",
      a: "Yes, but it's free and takes 10 seconds. We save your roast history so you can come back and see your progress.",
    },
  ];
  return (
    <section>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">FAQ</h2>
      <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-900/60">
        {items.map((it) => (
          <details key={it.q} className="group p-6">
            <summary className="cursor-pointer list-none text-lg font-semibold text-white">
              <span className="mr-2 text-brand-400 group-open:rotate-90 inline-block transition-transform">▶</span>
              {it.q}
            </summary>
            <p className="mt-3 text-zinc-300">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 to-orange-500/5 p-10 text-center">
      <h2 className="text-3xl font-bold text-white sm:text-4xl">Stop wondering. Start fixing.</h2>
      <p className="mx-auto mt-3 max-w-xl text-zinc-300">
        Get a roast in 30 seconds. Show up to your next application as the most prepared person in the inbox.
      </p>
      <Link
        href="/roast"
        className="mt-6 inline-block rounded-md bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600"
      >
        🔥 Fire This Resume
      </Link>
    </section>
  );
}
