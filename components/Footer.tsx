import Link from "next/link";
import Mascot from "@/components/Mascot";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Mascot className="h-7 w-7" />
              <span className="font-semibold">FireThis</span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Brutally honest AI feedback for students who actually want callbacks.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            <Link href="/roast" className="hover:text-white">Roast</Link>
            <Link href="/worker" className="hover:text-white">Worker</Link>
            <Link href="/cover-letter" className="hover:text-white">Cover Letter</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} FireThis. Not affiliated with your dream company. Yet.
          </p>
          <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300">
            Privacy Policy
          </Link>
          <Link href="/disclaimer" className="text-xs text-zinc-500 hover:text-zinc-300">
            Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}
