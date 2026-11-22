"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, UserRound, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Background from "@/components/layout/Background";
import BrandMark from "@/components/layout/BrandMark";

const inputClass = "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 focus:border-amber-400/30";
const labelClass = "mb-2 block text-sm font-medium text-white/65";

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function continueToContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (new Date(birthDate) > new Date()) {
      setError("Das Geburtsdatum darf nicht in der Zukunft liegen.");
      return;
    }
    setStep(2);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          display_name: `${firstName.trim()} ${lastName.trim()}`,
          birth_date: birthDate,
          street: street.trim(),
          postal_code: postalCode.trim(),
          city: city.trim(),
          phone: phone.trim(),
        },
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
      <Background />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-2xl sm:rounded-[30px] sm:p-9">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"><ArrowLeft size={16} />Zur Anmeldung</Link>
        <p className="mt-7 inline-flex items-center gap-1.5 text-sm uppercase tracking-[0.2em] text-amber-300/75">
          <BrandMark className="h-[18px] w-8" />
          <span>Connect</span>
        </p>
        <h1 className="mt-2 text-3xl font-black text-white">Konto erstellen</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">Wir benötigen ein paar Angaben, damit deine Kontaktdaten korrekt hinterlegt werden können.</p>

        {!success && <div className="mt-7">
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${step === 1 ? "border-amber-300/40 bg-amber-300/15 text-amber-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>{step === 1 ? <UserRound size={17}/> : <CheckCircle2 size={17}/>}</div>
            <div className="h-px flex-1 bg-white/10"><div className={`h-px bg-amber-300 transition-all ${step === 2 ? "w-full" : "w-0"}`}/></div>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${step === 2 ? "border-amber-300/40 bg-amber-300/15 text-amber-200" : "border-white/10 text-white/30"}`}><MapPin size={17}/></div>
            <span className="text-xs text-white/40">Schritt {step} von 2</span>
          </div>
        </div>}

        {success ? (
          <div className="mt-7 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
            <CheckCircle2 size={22} className="text-emerald-300" />
            <p className="mt-3 font-semibold text-white">Registrierung abgeschickt.</p>
            <p className="mt-1 text-sm leading-6 text-white/50">Falls Supabase eine E-Mail-Bestätigung verlangt, bestätige zuerst deine Adresse und melde dich danach an. Deine Angaben wurden beim Erstellen des Kontos in der Mitglieder-Datenbank hinterlegt.</p>
            <Link href="/auth/login" className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white">Zur Anmeldung</Link>
          </div>
        ) : step === 1 ? (
          <form onSubmit={continueToContact} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className={labelClass}>Vorname</span><input value={firstName} onChange={e=>setFirstName(e.target.value)} required autoComplete="given-name" className={inputClass} placeholder="Max"/></label>
              <label className="block"><span className={labelClass}>Nachname</span><input value={lastName} onChange={e=>setLastName(e.target.value)} required autoComplete="family-name" className={inputClass} placeholder="Mustermann"/></label>
            </div>
            <label className="block"><span className={labelClass}>Geburtsdatum</span><input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} required max={new Date().toISOString().slice(0,10)} className={inputClass}/></label>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3.5 font-semibold text-amber-200 transition hover:bg-amber-400/15">Weiter zu den Kontaktdaten <ArrowRight size={18}/></button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className={labelClass}>Straße und Hausnummer</span><input value={street} onChange={e=>setStreet(e.target.value)} required autoComplete="street-address" className={inputClass} placeholder="Musterstraße 12"/></label>
              <label className="block"><span className={labelClass}>Postleitzahl</span><input value={postalCode} onChange={e=>setPostalCode(e.target.value)} required autoComplete="postal-code" inputMode="numeric" maxLength={10} className={inputClass} placeholder="12345"/></label>
              <label className="block"><span className={labelClass}>Wohnort</span><input value={city} onChange={e=>setCity(e.target.value)} required autoComplete="address-level2" className={inputClass} placeholder="Musterstadt"/></label>
            </div>
            <label className="block"><span className={labelClass}>Telefon / Handynummer</span><input value={phone} onChange={e=>setPhone(e.target.value)} required type="tel" autoComplete="tel" className={inputClass} placeholder="+49 ..."/></label>
            <label className="block"><span className={labelClass}>E-Mail-Adresse</span><input value={email} onChange={e=>setEmail(e.target.value)} required type="email" autoComplete="email" className={inputClass} placeholder="name@example.de"/></label>
            <label className="block"><span className={labelClass}>Passwort</span><input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={8} required autoComplete="new-password" className={inputClass} placeholder="Mindestens 8 Zeichen"/></label>
            <p className="text-xs leading-5 text-white/35">Deine Kontaktdaten werden für die Organisation von MGB Connect gespeichert und sind nicht öffentlich sichtbar. Bitte gib nur Daten an, die für diesen Zweck benötigt werden.</p>
            {error && <p className="rounded-2xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200/80">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={()=>{setError("");setStep(1)}} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 font-semibold text-white/65 hover:text-white"><ArrowLeft size={17}/></button>
              <button disabled={loading} type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3.5 font-semibold text-amber-200 transition hover:bg-amber-400/15 disabled:opacity-60">{loading ? <Loader2 size={18} className="animate-spin"/> : null}{loading ? "Konto wird erstellt..." : "Registrierung abschließen"}</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
