"use client";

import { useState, type ReactNode, type Dispatch, type SetStateAction, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  Palette,
  Shield,
  Settings2,
} from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import SmoothToggle from "@/components/ui/smooth-toggle";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

type ToggleRowProps = {
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
};

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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const { roleLabel } = useRole();
  const { user, profile } = useAuth();

  const displayName = profile?.display_name?.trim() || user?.email?.split("@")[0] || "Mein Konto";
  const email = user?.email || "Nicht verfügbar";
  const accountStatus = profile?.active === false ? "Inaktiv" : "Aktiv";

  const toggle = <T extends Record<string, boolean>>(
    key: keyof T,
    setter: Dispatch<SetStateAction<T>>
  ) => setter((value) => ({ ...value, [key]: !value[key] }));

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-white/55 transition hover:text-white">
          <ArrowLeft size={18} />Zurück zum Dashboard
        </Link>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Persönlich</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Einstellungen</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Passe dein MGB-Connect-Erlebnis an. Deine Kontodaten und Rolle kommen direkt aus Supabase.</p>
        </div>

        <SettingsSection icon={<CircleUserRound size={21} />} eyebrow="Konto" title="Profil & Konto" description="Deine persönlichen Kontoinformationen aus dem aktuell angemeldeten Konto.">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow title="Name" value={displayName} />
            <InfoRow title="E-Mail" value={email} />
            <InfoRow title="Rolle" value={roleLabel} />
            <InfoRow title="Kontostatus" value={accountStatus} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <PasswordChangeRow open={passwordOpen} onOpen={() => setPasswordOpen(true)} onClose={() => setPasswordOpen(false)} />
            <ActionRow icon={<CircleUserRound size={18} />} title="Profil bearbeiten" description="Profiländerungen können später direkt hier verwaltet werden." />
          </div>
        </SettingsSection>

        <SettingsSection icon={<Bell size={21} />} eyebrow="Benachrichtigungen" title="Benachrichtigungen" description="Wähle aus, worüber du informiert werden möchtest.">
          <div className="space-y-3">
            <ToggleRow title="Dienst-Erinnerungen" description="Erinnerungen an bevorstehende Dienste." value={notifications.services} onChange={() => toggle("services", setNotifications)} />
            <ToggleRow title="Tauschbörse" description="Neue Angebote und Änderungen an deinen Angeboten." value={notifications.exchange} onChange={() => toggle("exchange", setNotifications)} />
            <ToggleRow title="News & Ankündigungen" description="Neue Informationen aus der Gemeinschaft." value={notifications.news} onChange={() => toggle("news", setNotifications)} />
            <ToggleRow title="Wichtige Mitteilungen" description="Wichtige organisatorische Hinweise immer anzeigen." value={notifications.important} onChange={() => toggle("important", setNotifications)} />
          </div>
        </SettingsSection>

        <SettingsSection icon={<Palette size={21} />} eyebrow="Darstellung" title="Erscheinungsbild" description="Das aktuelle MGB-Connect-Design bleibt bewusst dunkel und ruhig.">
          <div className="space-y-3">
            <InfoRow title="Theme" value="Dark · MGB Connect" />
            <ToggleRow title="Animationen" description="Sanfte Bewegungen und Übergänge verwenden." value={appearance.animations} onChange={() => toggle("animations", setAppearance)} />
            <ToggleRow title="Hintergrund-Effekt" description="Den animierten Amber-Hintergrund anzeigen." value={appearance.background} onChange={() => toggle("background", setAppearance)} />
            <ToggleRow title="Kompakte Darstellung" description="Listen und Karten etwas platzsparender darstellen." value={appearance.compact} onChange={() => toggle("compact", setAppearance)} />
          </div>
        </SettingsSection>

        <SettingsSection icon={<CalendarDays size={21} />} eyebrow="Kalender" title="Kalender" description="Bereite die spätere Kalenderanbindung vor.">
          <ActionRow icon={<CalendarDays size={18} />} title="Kalender verbinden" description="Google, Apple oder Outlook können später angebunden werden." />
          <p className="mt-3 rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-4 text-sm leading-6 text-blue-200/65">Deine Dienste können in der finalen Version automatisch in einen Kalender übernommen werden.</p>
        </SettingsSection>

        <SettingsSection icon={<Eye size={21} />} eyebrow="Datenschutz" title="Sichtbarkeit" description="Bestimme, welche Informationen andere Mitglieder sehen dürfen.">
          <div className="space-y-3">
            <ToggleRow title="Profil sichtbar" description="Dein Name und grundlegende Profilinformationen anzeigen." value={privacy.profile} onChange={() => toggle("profile", setPrivacy)} />
            <ToggleRow title="Punkte sichtbar" description="Deinen Punktestand für andere Mitglieder anzeigen." value={privacy.points} onChange={() => toggle("points", setPrivacy)} />
            <ToggleRow title="Ranking sichtbar" description="Deine Position in der Rangliste anzeigen." value={privacy.ranking} onChange={() => toggle("ranking", setPrivacy)} />
          </div>
        </SettingsSection>

        <SettingsSection icon={<Shield size={21} />} eyebrow="Sicherheit" title="Sicherheit" description="Dein Konto wird über Supabase Auth abgesichert.">
          <div className="grid gap-3 sm:grid-cols-2">
            <PasswordChangeRow open={passwordOpen} onOpen={() => setPasswordOpen(true)} onClose={() => setPasswordOpen(false)} />
            <ActionRow icon={<Shield size={18} />} title="Angemeldete Geräte" description="Sitzungsverwaltung kann später ergänzt werden." />
          </div>
        </SettingsSection>

        <SettingsSection icon={<Globe2 size={21} />} eyebrow="Sprache" title="Sprache & Region" description="Aktuell ist MGB Connect auf Deutsch ausgelegt.">
          <InfoRow title="Sprache" value="Deutsch" />
          <div className="mt-3"><InfoRow title="Zeitzone" value="Europe/Berlin" /></div>
        </SettingsSection>

        <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-white/40">
          <Settings2 size={19} />
          <p className="text-sm leading-6">MGB Connect · Entwicklungsstand V1 · Deine Kontodaten werden direkt aus deinem angemeldeten Supabase-Konto geladen.</p>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ title, value }: { title: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><span className="text-sm text-white/45">{title}</span><span className="max-w-[70%] truncate text-right text-sm font-semibold text-white/80">{value}</span></div>;
}

function PasswordChangeRow({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword) {
      setError("Bitte gib zuerst dein aktuelles Passwort ein.");
      return;
    }

    if (password.length < 6) {
      setError("Das neue Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    if (password !== confirmation) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setSaving(true);

    const email = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user?.email : null;
    if (!email) {
      setSaving(false);
      setError("Dein angemeldetes Konto konnte nicht ermittelt werden.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      setSaving(false);
      setError("Das aktuelle Passwort ist nicht korrekt.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message || "Das Passwort konnte nicht geändert werden.");
      return;
    }

    setCurrentPassword("");
    setPassword("");
    setConfirmation("");
    setMessage("Passwort erfolgreich geändert.");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-amber-300/25 hover:bg-white/[0.05]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
          <Lock size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">Passwort ändern</p>
          <p className="mt-1 text-sm leading-6 text-white/45">Passwort direkt über dein Supabase-Konto ändern.</p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-white/25" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl border border-amber-400/15 bg-white/[0.035] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">Passwort ändern</p>
          <p className="mt-1 text-sm leading-6 text-white/45">Mindestens 6 Zeichen.</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-white/45 transition hover:text-white">
          Schließen
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <PasswordInput
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Aktuelles Passwort"
          visible={showCurrentPassword}
          onToggle={() => setShowCurrentPassword((value) => !value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Neues Passwort"
          visible={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
          />
          <PasswordInput
          value={confirmation}
          onChange={setConfirmation}
          placeholder="Passwort wiederholen"
          visible={showConfirmation}
          onToggle={() => setShowConfirmation((value) => !value)}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300 px-5 text-sm font-bold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Wird gespeichert…" : "Neues Passwort speichern"}
      </button>
    </form>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        minLength={6}
        autoComplete="new-password"
        className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-300/40"
        required
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function ActionRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <button type="button" disabled className="flex w-full cursor-default items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left opacity-80"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div className="min-w-0 flex-1"><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm leading-6 text-white/45">{description}</p></div><ChevronRight size={18} className="shrink-0 text-white/25" /></button>;
}

function SettingsSection({ icon, eyebrow, title, description, children }: { icon: ReactNode; eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl sm:p-7"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-sm uppercase tracking-[0.18em] text-white/40">{eyebrow}</p><h2 className="mt-1 text-2xl font-bold text-white">{title}</h2><p className="mt-2 max-w-2xl leading-7 text-white/55">{description}</p></div></div><div className="mt-6">{children}</div></div>;
}
