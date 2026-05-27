// Central place for billing / plan logic.
// If we ever swap payment providers or change plan names, edit here.

export type Plan = "free" | "pro" | "international_pro";

export const PAID_PLANS: Plan[] = ["pro", "international_pro"];

export function isPaid(plan: string | null | undefined): boolean {
  return plan === "pro" || plan === "international_pro";
}

export function isInternationalPro(plan: string | null | undefined): boolean {
  return plan === "international_pro";
}

// Lemon Squeezy hosted checkout links.
// These come from the LS dashboard → Product → Share / Checkout link.
export const LEMON_SQUEEZY_CHECKOUT = {
  pro: "https://firethis.lemonsqueezy.com/checkout/buy/ada5a2a2-d487-4d52-8a08-9bce3968c819",
  international_pro:
    "https://firethis.lemonsqueezy.com/checkout/buy/6ecff348-75e3-473b-aafb-e7856f4f5920",
} as const;
