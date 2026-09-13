"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  Coins,
  Megaphone,
  Power,
  Save,
  Settings,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";
import { hasPermission } from "@/lib/permissions";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return <button type="button" onClick={onChange} aria-pressed={value} className={`relative h-7 w-12 shrink-0 rounded-full border transition ${value ? "border-amber-400/30 bg-amber-400/20" : "border-white/10 bg-white/5"}`}><span className={`absolute top-1 h-5 w-5 rounded-full transition ${value ? "left-6 bg-amber-300" : "left-1 bg-white/30"}`} /></button>;
}

function SettingRow({ title, description, value, onChange }: { title: string; description: string; value: boolean; onChange: () => void }) {
  return <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-white/45">{description}</p></div><Toggle value={value} onChange={onChange} /></div>;
}

function Section({ icon, eyebrow, title, description, children }: { icon: React.ReactNode; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl sm:p-7"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-sm uppercase tracking-[0.18em] text-white/40">{eyebrow}</p><h2 className="mt-1 text-2xl font-bold text-white">{title}</h2><p className="mt-2 max-w-2xl leading-7 text-white/55">{description}</p></div></div><div className="mt-6">{children}</div></div>;
}

export default function AdminSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [features, setFeatures] = useState({ exchange: true, points: true, ranking: true, news: true, notifications: true, calendar: false });
  const [serviceRules, setServiceRules] = useState({ autoTakeover: true, leaderReject: true, points: true });
  const [notifications, setNotifications] = useState({ serviceReminder: true, exchange: true, news: true, important: true });
  const [saved, setSaved] = useState(false);
  const { role } = useRole();

  if (!hasPermission(role, "manage_system")) {
    return <main className="relative min-h-screen overflow-hidden"><Background /><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} /><section className="relative z-10 mx-auto max-w-5xl px-6 pt-36"><Link href="/admin" className="inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Administration</Link><div className="mt-8 rounded-[30px] border border-red-400/20 bg-red-400/[0.07] p-8"><Shield className="text-red-300" size={28} /><h1 className="mt-5 text-3xl font-black text-white">Kein Zugriff</h1><p className="mt-3 text-white/55">Du besitzt keine Berechtigung für die Systemverwaltung.</p></div></section></main>;
  }

  const toggleFeature = (key: keyof typeof features) => setFeatures(v => ({ ...v, [key]: !v[key] }));
  const toggleRule = (key: keyof typeof serviceRules) => setServiceRules(v => ({ ...v, [key]: !v[key] }));
  const toggleNotification = (key: keyof typeof notifications) => setNotifications(v => ({ ...v, [key]: !v[key] }));

  return <main className="relative min-h-screen overflow-hidden">
    <Background />
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

    <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-36">
      <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-white/55 transition hover:text-white"><ArrowLeft size={18} />Zurück zur Administration</Link>
      <div className="mb-10"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Administration</p><h1 className="mt-2 text-5xl font-black tracking-tight text-white">Systemverwaltung</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Steuere zentrale Funktionen und Regeln von MGB Connect. Die Einstellungen sind bereits für die spätere Datenbank vorbereitet.</p></div>

      <Section icon={<Power size={21} />} eyebrow="Funktionen" title="Module aktivieren" description="Deaktiviere Funktionen, die eure Gemeinschaft aktuell nicht benötigt.">
        <div className="space-y-3">
          <SettingRow title="Tauschbörse" description="Dienste können zur Vertretung freigegeben und übernommen werden." value={features.exchange} onChange={() => toggleFeature("exchange")} />
          <SettingRow title="Punktesystem" description="Punkte für abgeschlossene Dienste anzeigen und sammeln." value={features.points} onChange={() => toggleFeature("points")} />
          <SettingRow title="Rangliste" description="Punktestand der Mitglieder als Ranking anzeigen." value={features.ranking} onChange={() => toggleFeature("ranking")} />
          <SettingRow title="News & Ankündigungen" description="Aktuelle Informationen in der App veröffentlichen." value={features.news} onChange={() => toggleFeature("news")} />
          <SettingRow title="Benachrichtigungen" description="App-Hinweise und spätere Push-Benachrichtigungen aktivieren." value={features.notifications} onChange={() => toggleFeature("notifications")} />
          <SettingRow title="Kalender" description="Kalenderfunktionen für Dienste vorbereiten." value={features.calendar} onChange={() => toggleFeature("calendar")} />
        </div>
      </Section>

      <Section icon={<CalendarDays size={21} />} eyebrow="Dienste" title="Dienstregeln" description="Lege fest, wie Dienste und Übernahmen grundsätzlich funktionieren.">
        <div className="space-y-3">
          <SettingRow title="Übernahmen sofort wirksam" description="Eine erfolgreiche Übernahme wird direkt dem neuen Messdiener zugeordnet." value={serviceRules.autoTakeover} onChange={() => toggleRule("autoTakeover")} />
          <SettingRow title="Leitung kann Übernahmen ablehnen" description="Berechtigte Personen können eine bereits erfolgte Übernahme zurückweisen." value={serviceRules.leaderReject} onChange={() => toggleRule("leaderReject")} />
          <SettingRow title="Punkte für Dienste" description="Abgeschlossene Dienste fließen in das Punktesystem ein." value={serviceRules.points} onChange={() => toggleRule("points")} />
        </div>
      </Section>

      <Section icon={<Coins size={21} />} eyebrow="Punkte" title="Punktesystem" description="Die konkreten Punktwerte können später zentral festgelegt werden.">
        <div className="grid gap-3 sm:grid-cols-3"><ValueCard title="Normaler Dienst" value="10 Punkte" /><ValueCard title="Sonderdienst" value="15 Punkte" /><ValueCard title="Abschluss" value="Automatisch" /></div>
        <p className="mt-4 rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-4 text-sm leading-6 text-blue-200/65">Aktuell dienen die Werte als Vorschau. Nach dem Datenbank-Launch werden sie zentral konfigurierbar und pro Dienst überschreibbar.</p>
      </Section>

      <Section icon={<Bell size={21} />} eyebrow="Benachrichtigungen" title="Standard-Benachrichtigungen" description="Bestimme, welche Ereignisse grundsätzlich gemeldet werden.">
        <div className="space-y-3"><SettingRow title="Dienst-Erinnerungen" description="Erinnerungen an bevorstehende Dienste." value={notifications.serviceReminder} onChange={() => toggleNotification("serviceReminder")} /><SettingRow title="Tauschbörse & Übernahmen" description="Änderungen an Angeboten und Übernahmen." value={notifications.exchange} onChange={() => toggleNotification("exchange")} /><SettingRow title="News" description="Neue Ankündigungen für Mitglieder." value={notifications.news} onChange={() => toggleNotification("news")} /><SettingRow title="Wichtige Mitteilungen" description="Wichtige organisatorische Informationen hervorheben." value={notifications.important} onChange={() => toggleNotification("important")} /></div>
      </Section>

      <Section icon={<Users size={21} />} eyebrow="Organisation" title="Allgemeine Einstellungen" description="Grundlegende Werte der Gemeinschaft, die später zentral gespeichert werden.">
        <div className="grid gap-3 sm:grid-cols-2"><ValueCard title="Organisation" value="MGB Connect" /><ValueCard title="Zeitzone" value="Europe/Berlin" /><ValueCard title="Standard-Sprache" value="Deutsch" /><ValueCard title="Systemstatus" value="Aktiv" /></div>
      </Section>

      <Section icon={<Trophy size={21} />} eyebrow="Verwaltung" title="Weitere Bereiche" description="Die einzelnen Verwaltungsbereiche bleiben bewusst getrennt und übersichtlich.">
        <div className="grid gap-3 sm:grid-cols-2"><AdminLink href="/admin/users" icon={<Users size={18} />} title="Benutzerverwaltung" /><AdminLink href="/admin/roles" icon={<Shield size={18} />} title="Rollen & Rechte" /><AdminLink href="/admin/announcements" icon={<Megaphone size={18} />} title="Ankündigungen" /><AdminLink href="/admin" icon={<Settings size={18} />} title="Administration" /></div>
      </Section>

      <button type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2200); }} className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"><Save size={18} />{saved ? "Einstellungen gespeichert" : "Einstellungen speichern"}</button>
    </section>
  </main>;
}

function ValueCard({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-white/40">{title}</p><p className="mt-2 font-bold text-white">{value}</p></div>; }
function AdminLink({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) { return <Link href={href} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"><span className="text-amber-300">{icon}</span><span className="font-semibold text-white">{title}</span></Link>; }
