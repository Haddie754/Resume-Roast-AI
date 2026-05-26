import Link from "next/link";

const links = [
  { href: "/roast", label: "Roast" },
  { href: "/worker", label: "Worker" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="text-2xl">🔥</span>
          <span className="text-lg tracking-tight">Resume Roast</span>
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
        <Link
          href="/roast"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Roast My Resume
        </Link>
      </nav>
    </header>
  );
}
