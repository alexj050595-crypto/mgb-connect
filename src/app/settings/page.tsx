"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bell, CalendarDays, ChevronRight, CircleUserRound,
  Eye, Globe2, Lock, Palette, Shield, Settings2,
} from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import SmoothToggle from "@/components/ui/smooth-toggle";
import { useRole } from "@/context/RoleContext";

type ToggleRowProps = { title: string; description: string; value: boolean; onChange: () => void };

function ToggleRow({ title, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex w-full items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]">
      <div className="min-w-0">
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/45">{description}</p>
      </div>
      <SmoothToggle checked={value} onChange={onChange} label={title} />
    </div>
  );
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState({ services: true, exchange: true, news: true, important: true });
  const [appearance, setAppearance] = useState({ animations: true, background: true, compact: false });
  const [privacy, setPrivacy] = useState({ profile: true, points: true, ranking: true });
  const { roleLabel } = useRole();
  const toggle = <T extends object>(key: keyof T, setter: React.Dispatch<React.SetStateAction<T>>) => setter(v => ({ ...v, [key]: !v[key] }));

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-36">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-white/55 transition hover:text-white"><ArrowLeft size={18} />Zurück zum Dashboard</Link>
        <div className="mb-10"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Persönlich</p><h1 className="mt-2 text-5xl font-black tracking-tight text-white">Einstellungen</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Passe dein MGB-Connect-Erlebnis an. Deine Rolle wird direkt aus deinem Benutzerkonto geladen.</p></div>

        <SettingsSection icon={<CircleUserRound size={21} />} eyebrow="Konto" title="Profil & Konto" description="Deine persönlichen Kontoinformationen.">
          <div className="grid gap-3 sm:grid-cols-2"><InfoRow title="Name" value="Tim Mustermann" /><InfoRow title="E-Mail" value="Noch nicht verbunden" /><InfoRow title="Rolle" value={roleLabel} /><InfoRow title="Kontostatus" value="Aktiv" /></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><ActionRow icon={<Lock size={18} />} title="Passwort ändern" description="Wird mit der Anmeldung verbunden." /><ActionRow icon={<CircleUserRound size={18} />} title="Profil bearbeiten" description="Name und Profilbild verwalten." /></div>
        </SettingsSection>

        <SettingsSection icon={<Bell size={21} />} eyebrow="Benachrichtigungen" title="Benachrichtigungen" description="Wähle aus, worüber du informiert werden möchtest.">
          <div className="space-y-3"><ToggleRow title="Dienst-Erinnerungen" description="Erinnerungen an bevorstehende Dienste." value={notifications.services} onChange={() => toggle("services", setNotifications)} /><ToggleRow title="Tauschbörse" description="Neue Angebote und Änderungen an deinen Angeboten." value={notifications.exchange} onChange={() => toggle("exchange", setNotifications)} /><ToggleRow title="News & Ankündigungen" description="Neue Informationen aus der Gemeinschaft." value={notifications.news} onChange={() => toggle("news", setNotifications)} /><ToggleRow title="Wichtige Mitteilungen" description="Wichtige organisatorische Hinweise immer anzeigen." value={notifications.important} onChange={() => toggle("important", setNotifications)} /></div>
        </SettingsSection>

        <SettingsSection icon={<Palette size={21} />} eyebrow="Darstellung" title="Erscheinungsbild" description="Das aktuelle MGB-Connect-Design bleibt bewusst dunkel und ruhig.">
          <div className="space-y-3"><InfoRow title="Theme" value="Dark · MGB Connect" /><ToggleRow title="Animationen" description="Sanfte Bewegungen und Übergänge verwenden." value={appearance.animations} onChange={() => toggle("animations", setAppearance)} /><ToggleRow title="Hintergrund-Effekt" description="Den animierten Amber-Hintergrund anzeigen." value={appearance.background} onChange={() => toggle("background", setAppearance)} /><ToggleRow title="Kompakte Darstellung" description="Listen und Karten etwas platzsparender darstellen." value={appearance.compact} onChange={() => toggle("compact", setAppearance)} /></div>
        </SettingsSection>

        <SettingsSection icon={<CalendarDays size={21} />} eyebrow="Kalender" title="Kalender" description="Bereite die spätere Kalenderanbindung vor."><ActionRow icon={<CalendarDays size={18} />} title="Kalender verbinden" description="Google, Apple oder Outlook können später angebunden werden." /><p className="mt-3 rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-4 text-sm leading-6 text-blue-200/65">Deine Dienste können in der finalen Version automatisch in einen Kalender übernommen werden.</p></SettingsSection>

        <SettingsSection icon={<Eye size={21} />} eyebrow="Datenschutz" title="Sichtbarkeit" description="Bestimme, welche Informationen andere Mitglieder sehen dürfen."><div className="space-y-3"><ToggleRow title="Profil sichtbar" description="Dein Name und grundlegende Profilinformationen anzeigen." value={privacy.profile} onChange={() => toggle("profile", setPrivacy)} /><ToggleRow title="Punkte sichtbar" description="Deinen Punktestand für andere Mitglieder anzeigen." value={privacy.points} onChange={() => toggle("points", setPrivacy)} /><ToggleRow title="Ranking sichtbar" description="Deine Position in der Rangliste anzeigen." value={privacy.ranking} onChange={() => toggle("ranking", setPrivacy)} /></div></SettingsSection>

        <SettingsSection icon={<Shield size={21} />} eyebrow="Sicherheit" title="Sicherheit" description="Weitere Sicherheitsfunktionen werden mit Supabase Auth verbunden."><div className="grid gap-3 sm:grid-cols-2"><ActionRow icon={<Lock size={18} />} title="Passwort ändern" description="Für das echte Konto verfügbar." /><ActionRow icon={<Shield size={18} />} title="Angemeldete Geräte" description="Später aktive Sitzungen verwalten." /></div></SettingsSection>
        <SettingsSection icon={<Globe2 size={21} />} eyebrow="Sprache" title="Sprache & Region" description="Aktuell ist MGB Connect auf Deutsch ausgelegt."><InfoRow title="Sprache" value="Deutsch" /><div className="mt-3"><InfoRow title="Zeitzone" value="Europe/Berlin" /></div></SettingsSection>

        <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-white/40"><Settings2 size={19} /><p className="text-sm leading-6">MGB Connect · Entwicklungsstand V1 · Viele Einstellungen werden nach dem Datenbank-Launch dauerhaft gespeichert.</p></div>
      </section>
    </main>
  );
}

function InfoRow({ title, value }: { title: string; value: string }) { return <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><span className="text-sm text-white/45">{title}</span><span className="text-sm font-semibold text-white/80">{value}</span></div>; }
function ActionRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) { return <button type="button" className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div className="min-w-0 flex-1"><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-white/45">{description}</p></div><ChevronRight size={18} className="shrink-0 text-white/25" /></button>; }
function SettingsSection({ icon, eyebrow, title, description, children }: { icon: ReactNode; eyebrow: string; title: string; description: string; children: ReactNode }) { return <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl sm:p-7"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-sm uppercase tracking-[0.18em] text-white/40">{eyebrow}</p><h2 className="mt-1 text-2xl font-bold text-white">{title}</h2><p className="mt-2 max-w-2xl leading-7 text-white/55">{description}</p></div></div><div className="mt-6">{children}</div></div>; }
