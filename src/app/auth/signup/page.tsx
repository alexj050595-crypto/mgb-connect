"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import Background from "@/components/layout/Background";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.assign("/");
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6">
      <Background />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:rounded-[30px] sm:p-9 shadow-2xl backdrop-blur-2xl sm:p-9">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"><ArrowLeft size={16} />Zur Anmeldung</Link>
        <p className="mt-8 text-sm uppercase tracking-[0.2em] text-amber-300/75">MGB Connect</p>
        <h1 className="mt-2 text-3xl font-black text-white">Konto erstellen</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">Erstelle dein MGB-Connect-Konto.</p>

        {success ? (
          <div className="mt-7 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
            <CheckCircle2 size={22} className="text-emerald-300" />
            <p className="mt-3 font-semibold text-white">Registrierung abgeschlossen.</p>
            <p className="mt-1 text-sm leading-6 text-white/50">Falls Supabase eine E-Mail-Bestätigung verlangt, bestätige zuerst deine Adresse und melde dich danach an.</p>
            <Link href="/auth/login" className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white">Zur Anmeldung</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/65">Vor- und Nachname</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" placeholder="z. B. Max Mustermann" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/65">E-Mail-Adresse</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" placeholder="name@example.de" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/65">Passwort</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required autoComplete="new-password" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" placeholder="Mindestens 6 Zeichen" />
            </label>
            {error && <p className="rounded-2xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200/80">{error}</p>}
            <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3.5 font-semibold text-amber-200 transition hover:bg-amber-400/15 disabled:opacity-60">{loading ? <Loader2 size={18} className="animate-spin" /> : null}{loading ? "Konto wird erstellt..." : "Konto erstellen"}</button>
          </form>
        )}
      </div>
    </main>
  );
}
