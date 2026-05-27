import Link from "next/link";

interface PaywallScreenProps {
  feature: string;
  description: string;
  signedIn: boolean;
  bullets?: string[];
}

/**
 * Friendly upgrade screen shown when a free or signed-out user hits a Pro tool.
 * Renders sign-in CTA for guests, upgrade CTA for free users.
 */
export default function PaywallScreen({
  feature,
  description,
  signedIn,
  bullets,
}: PaywallScreenProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-orange-500/5 p-8 sm:p-12">
        <span className="inline-block rounded-full bg-brand-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
          🔥 Pro feature
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {feature}
        </h1>
        <p className="mt-3 text-zinc-300">{description}</p>

        {bullets && bullets.length > 0 && (
          <ul className="mt-6 space-y-2 text-zinc-200">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-brand-400">✓</span>
                {b}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {signedIn ? (
            <>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600"
              >
                Upgrade to Pro
              </Link>
              <Link
                href="/roast"
                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
              >
                Try the free roast
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-base font-semibold text-white hover:bg-brand-600"
              >
                Sign up free
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          $3.99/month • Cancel anytime • International Pro: $7.99/month
        </p>
      </div>
    </div>
  );
}
