import Link from "next/link";
import Mascot from "@/components/Mascot";
import { createClient } from "@/lib/supabase/server";
import { isPro } from "@/lib/billing";

const baseLinks = [
  { href: "/roast", label: "Roast" },
  { href: "/worker", label: "Worker" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/pricing", label: "Pricing" },
];

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Show the History link only to Pro users.
  let pro = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();
    pro = isPro(profile?.plan);
  }

  const links = pro
    ? [...baseLinks, { href: "/history", label: "History" }]
    : baseLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Mascot className="h-8 w-8" />
          <span className="text-lg tracking-tight">FireThis</span>
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs text-zinc-500 sm:block">{user.email}</span>
              <form action="/auth/sign-out" method="post">
                <button
                  type="submit"
                  className="rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
