/**
 * First-touch marketing attribution.
 *
 * Captures UTM params + referrer on the visitor's FIRST page view and keeps
 * them in localStorage until they sign up. At signup the values ride along in
 * Supabase's `options.data`, landing in auth.users.raw_user_meta_data — so no
 * schema migration and no changes to the signup trigger.
 */

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  first_seen?: string;
}

const KEY = "firethis_attribution";

/**
 * Store attribution on the first visit only — later page views must not
 * overwrite it, or we'd credit the last click instead of the one that
 * actually brought them in.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(KEY)) return; // keep the first touch

    const p = new URLSearchParams(window.location.search);
    const data: Attribution = {
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
      utm_content: p.get("utm_content") || undefined,
      referrer: document.referrer || undefined,
      landing_page: window.location.pathname || undefined,
      first_seen: new Date().toISOString(),
    };

    // Only persist if we actually learned where they came from.
    if (data.utm_source || data.referrer) {
      localStorage.setItem(KEY, JSON.stringify(data));
    }
  } catch {
    // localStorage can throw (private mode / blocked) — attribution is
    // best-effort and must never break the page.
  }
}

/** Read stored attribution to attach to a signup. Empty object if unknown. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
