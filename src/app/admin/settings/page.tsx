"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CalendarDays, Coins, Megaphone, Power, Save, Settings, Shield, Trophy, Users } from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import SmoothToggle from "@/components/ui/smooth-toggle";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { createClient } from "@/lib/supabase/client";
import { hasPermission } from "@/lib/permissions";

const defaultFeatures = { exchange: true, points: true, ranking: true, news: true, notifications: true, calendar: false };
const defaultServiceRules = { autoTakeover: true, leaderReject: true, points: true };
const defaultNotifications = { serviceReminder: true, exchange: true, news: true, important: true };

type FeatureSettings = typeof defaultFeatures;
type ServiceRuleSettings = typeof defaultServiceRules;
type NotificationSettings = typeof defaultNotifications;
type SettingRowProps = { title: string; description: string; value: boolean; onChange: () => void };

function Toggle({ value, onChange, label }: { value: boolean; onChange: () => void; label: string }) {
  return <SmoothToggle checked={value} onChange={onChange} label={label} />;
}

function SettingRow({ title, description, value, onChange }: SettingRowProps) {
  return <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-white/45">{description}</p></div><Toggle value={value} onChange={onChange} label={title} /></div>;
}

function Section({ icon, eyebrow, title, description, children }: { icon: ReactNode; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl sm:p-7"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-sm uppercase tracking-[0.18em] text-white/40">{eyebrow}</p><h2 className="mt-1 text-2xl font-bold text-white">{title}</h2><p className="mt-2 max-w-2xl leading-7 text-white/55">{description}</p></div></div><div className="mt-6">{children}</div></div>;
}

export default function AdminSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [features, setFeatures] = useState<FeatureSettings>(defaultFeatures);
  const [serviceRules, setServiceRules] = useState<ServiceRuleSettings>(defaultServiceRules);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { role } = useRole();
  const { user } = useAuth();
  const { enabled: demoMode, loading: demoLoading, refresh: refreshDemoMode } = useDemoMode();

  useEffect(() => {
    if (!user || !hasPermission(role, "manage_system")) return;
    async function loadSettings() {
      const supabase = createClient();
      const { data, error: loadError } = await supabase.from("system_settings").select("key, value").in("key", ["features", "service_rules", "notifications"]);
      if (loadError) {
        setError(`Systemeinstellungen konnten nicht geladen werden: ${loadError.message}`);
        setLoading(false);
        return;
      }
      for (const row of data ?? []) {
        if (row.key === "features") setFeatures({ ...defaultFeatures, ...(row.value as Partial<FeatureSettings>) });
        if (row.key === "service_rules") setServiceRules({ ...defaultServiceRules, ...(row.value as Partial<ServiceRuleSettings>) });
        if (row.key === "notifications") setNotifications({ ...defaultNotifications, ...(row.value as Partial<NotificationSettings>) });
      }
      setLoading(false);
    }
    void loadSettings();
  }, [role, user]);

  if (!hasPermission(role, "manage_system")) {
    return <main className="relative min-h-screen overflow-hidden"><Background /><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} /><section className="relative z-10 mx-auto max-w-5xl px-6 pt-36"><Link href="/admin" className="inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Administration</Link><div className="mt-8 rounded-[30px] border border-red-400/20 bg-red-400/[0.07] p-8"><Shield className="text-red-300" size={28} /><h1 className="mt-5 text-3xl font-black text-white">Kein Zugriff</h1><p className="mt-3 text-white/55">Du besitzt keine Berechtigung für die Systemverwaltung.</p></div></section></main>;
  }

  const toggleFeature = (key: keyof FeatureSettings) => setFeatures((v) => ({ ...v, [key]: !v[key] }));
  const toggleRule = (key: keyof ServiceRuleSettings) => setServiceRules((v) => ({ ...v, [key]: !v[key] }));
  const toggleNotification = (key: keyof NotificationSettings) => setNotifications((v) => ({ ...v, [key]: !v[key] }));

  async function toggleDemoMode() {
    if (!user) {
      setError("Kein angemeldeter Benutzer vorhanden.");
      return;
    }
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("set_demo_mode", { p_enabled: !demoMode });
    if (rpcError) {
      setError(`Demo-Modus konnte nicht geändert werden: ${rpcError.message}${rpcError.details ? ` · ${rpcError.details}` : ""}${rpcError.hint ? ` · ${rpcError.hint}` : ""}`);
      return;
    }
    if (data !== true) {
      setError("Demo-Modus wurde vom Server abgelehnt. Der aktuelle Account wird von Supabase nicht als aktiver Administrator erkannt.");
      return;
    }
    await refreshDemoMode();
  }

  async function saveSettings() {
    if (!user) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const rows = [
      { key: "features", value: features, updated_by: user.id },
      { key: "service_rules", value: serviceRules, updated_by: user.id },
      { key: "notifications", value: notifications, updated_by: user.id },
    ];
    const { error: saveError } = await supabase.from("system_settings").upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (saveError) { setError(`Einstellungen konnten nicht gespeichert werden: ${saveError.message}`); return; }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return <main className="relative min-h-screen overflow-hidden">
    <Background />
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

    <section className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
      <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-white/55 transition hover:text-white"><ArrowLeft size={18} />Zurück zur Administration</Link>
      <div className="mb-10"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Administration</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Systemverwaltung</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Zentrale Funktionen und Regeln von MGB Connect direkt über die Datenbank verwalten.</p></div>

      {error && <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm leading-6 text-red-200"><p className="font-semibold">Fehler</p><p className="mt-1 break-words">{error}</p></div>}
      {loading && <div className="mb-6 rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-4 text-sm text-blue-200/70">Systemeinstellungen werden geladen...</div>}

      <Section icon={<Power size={21} />} eyebrow="Demo" title="Demo-Modus" description="Aktiviere eine vollständig getrennte Testwelt für alle eingeloggten Benutzer. Alle Aktionen werden in Supabase gespeichert, aber beim Ausschalten dauerhaft verworfen.">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
          <SettingRow
            title={demoMode ? "Demo-Modus ist aktiv" : "Demo-Modus ist deaktiviert"}
            description={demoMode ? "Alle eingeloggten Benutzer sehen aktuell ausschließlich die Demo-Dienste und Demo-Ankündigungen. Ausschalten löscht sämtliche Demo-Änderungen." : "Aktivieren erstellt für alle aktiven Konten eine frische Testwelt. Die echten Daten bleiben unverändert."}
            value={demoMode}
            onChange={() => void toggleDemoMode()}
          />
          <p className="mt-4 text-xs leading-5 text-white/35">{demoLoading ? "Demo-Modus wird synchronisiert…" : demoMode ? "TESTBETRIEB · Änderungen sind nicht dauerhaft." : "PRODUKTBETRIEB · Echte Supabase-Daten werden verwendet."}</p>
        </div>
      </Section>

      <Section icon={<Power size={21} />} eyebrow="Funktionen" title="Module aktivieren" description="Deaktiviere Funktionen, die eure Gemeinschaft aktuell nicht benötigt.">
        <div className="space-y-3"><SettingRow title="Tauschbörse" description="Dienste können zur Vertretung freigegeben und übernommen werden." value={features.exchange} onChange={() => toggleFeature("exchange")} /><SettingRow title="Punktesystem" description="Punkte für abgeschlossene Dienste anzeigen und sammeln." value={features.points} onChange={() => toggleFeature("points")} /><SettingRow title="Rangliste" description="Punktestand der Mitglieder als Ranking anzeigen." value={features.ranking} onChange={() => toggleFeature("ranking")} /><SettingRow title="News & Ankündigungen" description="Aktuelle Informationen in der App veröffentlichen." value={features.news} onChange={() => toggleFeature("news")} /><SettingRow title="Benachrichtigungen" description="App-Hinweise und spätere Push-Benachrichtigungen aktivieren." value={features.notifications} onChange={() => toggleFeature("notifications")} /><SettingRow title="Kalender" description="Kalenderfunktionen für Dienste vorbereiten." value={features.calendar} onChange={() => toggleFeature("calendar")} /></div>
      </Section>

      <Section icon={<CalendarDays size={21} />} eyebrow="Dienste" title="Dienstregeln" description="Lege fest, wie Dienste und Übernahmen grundsätzlich funktionieren.">
        <div className="space-y-3"><SettingRow title="Übernahmen sofort wirksam" description="Eine erfolgreiche Übernahme wird direkt dem neuen Messdiener zugeordnet." value={serviceRules.autoTakeover} onChange={() => toggleRule("autoTakeover")} /><SettingRow title="Leitung kann Übernahmen ablehnen" description="Berechtigte Personen können eine bereits erfolgte Übernahme zurückweisen." value={serviceRules.leaderReject} onChange={() => toggleRule("leaderReject")} /><SettingRow title="Punkte für Dienste" description="Abgeschlossene Dienste fließen in das Punktesystem ein." value={serviceRules.points} onChange={() => toggleRule("points")} /></div>
      </Section>

      <Section icon={<Coins size={21} />} eyebrow="Punkte" title="Punktesystem" description="Die konkreten Punktwerte pro Dienst werden weiterhin am jeweiligen Dienst gespeichert."><div className="grid gap-3 sm:grid-cols-3"><ValueCard title="Normaler Dienst" value="10 Punkte" /><ValueCard title="Sonderdienst" value="15 Punkte" /><ValueCard title="Abschluss" value="Automatisch" /></div></Section>
      <Section icon={<Bell size={21} />} eyebrow="Benachrichtigungen" title="Standard-Benachrichtigungen" description="Bestimme, welche Ereignisse grundsätzlich gemeldet werden."><div className="space-y-3"><SettingRow title="Dienst-Erinnerungen" description="Erinnerungen an bevorstehende Dienste." value={notifications.serviceReminder} onChange={() => toggleNotification("serviceReminder")} /><SettingRow title="Tauschbörse & Übernahmen" description="Änderungen an Angeboten und Übernahmen." value={notifications.exchange} onChange={() => toggleNotification("exchange")} /><SettingRow title="News" description="Neue Ankündigungen für Mitglieder." value={notifications.news} onChange={() => toggleNotification("news")} /><SettingRow title="Wichtige Mitteilungen" description="Wichtige organisatorische Informationen hervorheben." value={notifications.important} onChange={() => toggleNotification("important")} /></div></Section>
      <Section icon={<Users size={21} />} eyebrow="Organisation" title="Allgemeine Einstellungen" description="Grundlegende Werte der Gemeinschaft."><div className="grid gap-3 sm:grid-cols-2"><ValueCard title="Organisation" value="MGB Connect" /><ValueCard title="Zeitzone" value="Europe/Berlin" /><ValueCard title="Standard-Sprache" value="Deutsch" /><ValueCard title="Systemstatus" value="Aktiv" /></div></Section>
      <Section icon={<Trophy size={21} />} eyebrow="Verwaltung" title="Weitere Bereiche" description="Die einzelnen Verwaltungsbereiche bleiben bewusst getrennt und übersichtlich."><div className="grid gap-3 sm:grid-cols-2"><AdminLink href="/admin/users" icon={<Users size={18} />} title="Benutzerverwaltung" /><AdminLink href="/admin/roles" icon={<Shield size={18} />} title="Rollen & Rechte" /><AdminLink href="/admin/announcements" icon={<Megaphone size={18} />} title="Ankündigungen" /><AdminLink href="/admin" icon={<Settings size={18} />} title="Administration" /></div></Section>

      <button type="button" onClick={() => void saveSettings()} disabled={saving || loading || demoLoading} className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15 disabled:opacity-40"><Save size={18} />{saving ? "Wird gespeichert..." : saved ? "Einstellungen gespeichert" : "Einstellungen speichern"}</button>
    </section>
  </main>;
}

function ValueCard({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-white/40">{title}</p><p className="mt-2 font-bold text-white">{value}</p></div>; }
function AdminLink({ href, icon, title }: { href: string; icon: ReactNode; title: string }) { return <Link href={href} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"><span className="text-amber-300">{icon}</span><span className="font-semibold text-white">{title}</span></Link>; }
