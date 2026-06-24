"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/roast`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Email confirmation is disabled, so signUp returns an active session —
      // the user is already logged in. Drop them straight into the app.
      router.push("/roast");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white">Create account</h1>
        <p className="mt-2 text-zinc-400">Start with a free roast. No card needed.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand-500"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-brand-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
