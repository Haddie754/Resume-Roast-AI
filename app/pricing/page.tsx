import Link from "next/link";
import { LEMON_SQUEEZY_CHECKOUT } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

interface Plan {
  name: string;
  price: string;
  originalPrice?: string;
  saveNote?: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  highlight?: boolean;
  badge?: string;
}

export default async function PricingPage() {
  // Pass the signed-in user's email through to Lemon Squeezy so the checkout
  // is prefilled (and the webhook later can match the customer back to them).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Build the checkout query string:
  //  - prefill the email for a smoother checkout
  //  - attach the Supabase user id as custom data so the webhook can link the
  //    payment back to this account and upgrade the right user automatically
  const params = new URLSearchParams();
  if (user?.email) params.set("checkout[email]", user.email);
  if (user?.id) params.set("checkout[custom][user_id]", user.id);
  const query = params.toString() ? `?${params.toString()}` : "";

  const plusCheckout = `${LEMON_SQUEEZY_CHECKOUT.plus}${query}`;
  const proCheckout = `${LEMON_SQUEEZY_CHECKOUT.pro}${query}`;

  const plans: Plan[] = [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      description: "Get a taste of the fire.",
      features: [
        "1 resume roast per month",
        "1 Resume Worker run per month",
        "1 cover letter per month",
        "Cooked Score, diagnosis & top fixes",
      ],
      cta: user ? "You're on Free" : "Start free",
      href: user ? "/roast" : "/auth/sign-up",
    },
    {
      name: "Plus",
      price: "$4.99",
      cadence: "per month",
      description: "Everything you need to actually land interviews.",
      features: [
        "Unlimited resume roasts",
        "Resume Worker (tailor to any job)",
        "Cover Letter Writer",
        "Basic ATS optimization",
      ],
      cta: "Upgrade to Plus",
      href: plusCheckout,
      highlight: true,
      badge: "Most popular",
    },
    {
      name: "Pro",
      price: "$5.99",
      originalPrice: "$8.99",
      saveNote: "33% off — limited time",
      cadence: "per month",
      description: "The full toolkit, including F-1 / OPT support.",
      features: [
        "Everything in Plus",
        "Full ATS optimization",
        "Saved roast history",
        "F-1 / OPT job strategy",
        "Visa-friendly company targeting",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      href: proCheckout,
      badge: "Best value",
    },
  ];

  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Pricing
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
          Start free. Upgrade when you&apos;re applying for real.
          {!user && (
            <>
              {" "}
              <Link href="/auth/sign-up" className="text-brand-400 hover:underline">
                Sign up
              </Link>{" "}
              to get your first roast on us.
            </>
          )}
        </p>
        <p className="mt-3 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-300">
          Cancel anytime. No contracts, no hassle.
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
            {plan.badge && (
              <span
                className={`mb-4 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  plan.highlight
                    ? "bg-brand-500/30 text-brand-100"
                    : "bg-white/10 text-zinc-200"
                }`}
              >
                {plan.badge}
              </span>
            )}
            <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-2">
              {plan.originalPrice && (
                <span className="text-2xl font-bold text-zinc-500 line-through">
                  {plan.originalPrice}
                </span>
              )}
              <span className="text-5xl font-extrabold text-white">{plan.price}</span>
              <span className="text-zinc-400">/ {plan.cadence}</span>
            </div>
            {plan.saveNote && (
              <span className="mt-2 inline-block w-fit rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                {plan.saveNote}
              </span>
            )}

            <ul className="mt-6 flex-1 space-y-2 text-zinc-200">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-brand-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {plan.href ? (
              <Link
                href={plan.href}
                target={plan.href.startsWith("http") ? "_blank" : undefined}
                rel={plan.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`mt-8 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {plan.cta}
              </Link>
            ) : (
              <span
                className={`mt-8 inline-flex cursor-not-allowed items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold ${
                  plan.highlight
                    ? "bg-brand-500/70 text-white"
                    : "bg-white/10 text-zinc-200"
                }`}
              >
                {plan.cta}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center text-sm text-zinc-400">
        Not sure yet? <Link href="/roast" className="text-brand-400 hover:underline">Try the free roast</Link> first.
        No card required.
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FaqItem
          q="Can I cancel anytime?"
          a="Yes. Cancel from your billing portal in one click. No retention calls, no guilt."
        />
        <FaqItem
          q="What's the difference between Plus and Pro?"
          a="Pro adds full ATS optimization, saved history, F-1 / OPT job strategy, and priority support."
        />
        <FaqItem
          q="Is my data safe?"
          a="Your resume is stored on your account only. We don't share it, sell it, or train on it."
        />
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <p className="font-semibold text-white">{q}</p>
      <p className="mt-2 text-sm text-zinc-400">{a}</p>
    </div>
  );
}
