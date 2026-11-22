"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "mgb-privacy-notice-seen-v1";

export default function PrivacyNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function closeNotice() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // The notice can still be closed for the current visit.
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="privacy-notice-title">
      <div className="my-auto w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#101010] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300"><ShieldCheck size={22} /></div>
            <div><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">MGB Connect</p><h2 id="privacy-notice-title" className="mt-1 text-2xl font-bold text-white">Datenschutzhinweise</h2></div>
          </div>
          <button type="button" onClick={closeNotice} aria-label="Hinweis schließen" className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"><X size={20} /></button>
        </div>
        <p className="mt-5 leading-7 text-white/65">MGB Connect verarbeitet personenbezogene Daten, damit die Messdiener-Gemeinschaft Konten, Dienste und organisatorische Abläufe verwalten kann. Die wichtigsten eingesetzten technischen Dienste sind:</p>
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="font-semibold text-white">Supabase – Anmeldung und Datenbank</p><p className="mt-1 text-sm leading-6 text-white/55">Verwaltet Benutzerkonten, Anmeldesitzungen und die in der App gespeicherten Mitglieds-, Profil- und Dienstinformationen.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="font-semibold text-white">Vercel – Hosting</p><p className="mt-1 text-sm leading-6 text-white/55">Stellt die Anwendung bereit und verarbeitet technisch notwendige Verbindungs- und Serverdaten, damit die Website erreichbar ist.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="font-semibold text-white">Brevo – E-Mail-Versand</p><p className="mt-1 text-sm leading-6 text-white/55">Versendet insbesondere Registrierungs- und Bestätigungs-E-Mails an die hinterlegte E-Mail-Adresse.</p></div>
        </div>
        <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
          <p className="text-sm leading-6 text-white/65">Je nach Nutzung können insbesondere Name, Kontaktdaten, Geburtsdatum, Kontoinformationen sowie Dienst- und Organisationsdaten verarbeitet werden. Die App benötigt außerdem technisch notwendige Speicherungen für Anmeldung und Sitzung. Eine ausführliche Darstellung der Verantwortlichkeit, Rechtsgrundlagen, Speicherdauer und Betroffenenrechte findest du in den verlinkten Datenschutzhinweisen.</p>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/datenschutz" onClick={closeNotice} className="text-sm font-semibold text-amber-200 hover:text-amber-100">Weitere Datenschutzhinweise lesen</Link>
          <button type="button" onClick={closeNotice} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-300 px-5 text-sm font-bold text-black transition hover:bg-amber-200">Verstanden</button>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/30">Dieser Hinweis informiert über die App. Das Schließen ist keine zusätzliche Einwilligung und ersetzt nicht die vollständige Datenschutzerklärung.</p>
      </div>
    </div>
  );
}
