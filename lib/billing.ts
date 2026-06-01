// Central place for billing / plan logic.
// If we ever swap payment providers or change plan names, edit here.

export type Plan = "free" | "plus" | "pro";

export const PAID_PLANS: Plan[] = ["plus", "pro"];

// Any paid tier (Plus or Pro) gets unlimited roasts + the core paid tools.
export function isPaid(plan: string | null | undefined): boolean {
  return plan === "plus" || plan === "pro";
}

// Pro is the top tier (saved history, F-1/OPT features, priority support).
export function isPro(plan: string | null | undefined): boolean {
  return plan === "pro";
}

export const PLAN_PRICES = {
  plus: "$4.99",
  pro: "$5.99",
} as const;

// Lemon Squeezy hosted checkout links.
// These come from the LS dashboard, Product, Share / Checkout link.
// NOTE: the link IDs stay the same even after you rename / reprice a product
// in Lemon Squeezy, so keep these stable and just edit the product itself.
export const LEMON_SQUEEZY_CHECKOUT = {
  plus: "https://firethis.lemonsqueezy.com/checkout/buy/bab15ecd-70dd-473b-af8e-9c1752777e5c",
  pro: "https://firethis.lemonsqueezy.com/checkout/buy/42cbe315-8a5f-4ac3-85fa-4370d0fa4a6c",
} as const;
