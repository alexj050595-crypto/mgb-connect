"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import Background from "@/components/layout/Background";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("E-Mail oder Passwort ist nicht korrekt.");
      setLoading(false);
      return;
    }

    window.location.assign(safeNext);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <Background />
      <div className="relative z-10 w-full max-w-md rounded-[30px] border border-white/10 bg-white/[0.045] p-7 shadow-2xl backdrop-blur-2xl sm:p-9">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <ShieldCheck size={23} />
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-amber-300/75">MGB Connect</p>
        <h1 className="mt-2 text-3xl font-black text-white">Willkommen zurück</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">Melde dich mit deinem MGB-Connect-Konto an.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/65">E-Mail-Adresse</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" placeholder="name@example.de" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/65">Passwort</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none focus:border-amber-400/30" placeholder="Dein Passwort" />
          </label>

          {error && <p className="rounded-2xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200/80">{error}</p>}

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3.5 font-semibold text-amber-200 transition hover:bg-amber-400/15 disabled:cursor-wait disabled:opacity-60">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Noch kein Konto? <Link href="/auth/signup" className="text-amber-300/80 hover:text-amber-300">Registrieren</Link>
        </p>
      </div>
    </main>
  );
}
