import Link from "next/link";

export default function ProBanner() {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-200 sm:flex-row sm:items-center">
      <div>
        <span className="rounded-full bg-brand-500/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-100">
          Pro feature
        </span>{" "}
        — preview is free during MVP. Pricing kicks in soon.
      </div>
      <Link
        href="/pricing"
        className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
      >
        See plans
      </Link>
    </div>
  );
}
