"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lock,
  Megaphone,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import SmoothToggle from "@/components/ui/smooth-toggle";
import { useRole } from "@/context/RoleContext";
import { hasPermission, permissions, roles, type Permission, type UserRole } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/client";

type PermissionMeta = { permission: Permission; title: string; description: string; icon: ReactNode };
type Member = { id: string; name: string; role: UserRole; active: boolean };

type ProfileRow = {
  id: string;
  display_name: string | null;
  role: UserRole;
  active: boolean;
};

const permissionMeta: PermissionMeta[] = [
  { permission: "view_leader_area", title: "Leiterbereich", description: "Zugriff auf die zentrale Übersicht für die Leitung.", icon: <ShieldCheck size={18} /> },
  { permission: "view_team", title: "Messdiener einsehen", description: "Messdiener und deren Informationen einsehen.", icon: <Users size={18} /> },
  { permission: "view_service_management", title: "Dienstverwaltung", description: "Dienste prüfen und verwalten.", icon: <ClipboardList size={18} /> },
  { permission: "view_statistics", title: "Statistiken", description: "Statistiken und Auswertungen einsehen.", icon: <BarChart3 size={18} /> },
  { permission: "confirm_requests", title: "Übernahmen bearbeiten", description: "Übernahmen prüfen und bei Bedarf ablehnen.", icon: <CheckCircle2 size={18} /> },
  { permission: "manage_schedule", title: "Messdienerplan verwalten", description: "Dienste und Messdienerpläne verwalten.", icon: <CalendarDays size={18} /> },
  { permission: "manage_members", title: "Benutzer verwalten", description: "Benutzer und Mitglieder verwalten.", icon: <UserCog size={18} /> },
  { permission: "manage_roles", title: "Rollen & Rechte verwalten", description: "Rollen und Berechtigungen konfigurieren.", icon: <ShieldCheck size={18} /> },
  { permission: "manage_announcements", title: "Ankündigungen verwalten", description: "Ankündigungen erstellen und verwalten.", icon: <Megaphone size={18} /> },
  { permission: "manage_system", title: "System verwalten", description: "Globale Systemeinstellungen verwalten.", icon: <Settings size={18} /> },
];

const roleOrder: UserRole[] = ["messdiener", "leiter", "planschreiber", "admin"];
const roleIcons: Record<UserRole, ReactNode> = {
  messdiener: <UserRound size={23} />,
  leiter: <Users size={23} />,
  planschreiber: <CalendarDays size={23} />,
  admin: <ShieldCheck size={23} />,
};

export default function AdminRolesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("leiter");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Permission[]>>({
    messdiener: [...permissions.messdiener],
    leiter: [...permissions.leiter],
    planschreiber: [...permissions.planschreiber],
    admin: [...permissions.admin],
  });
  const [memberOverrides, setMemberOverrides] = useState<Record<string, Permission[]>>({});
  const { role } = useRole();
  const isAllowed = hasPermission(role, "manage_roles");
  const supabase = useMemo(() => createClient(), []);

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from("profiles")
      .select("id, display_name, role, active")
      .order("display_name", { ascending: true });

    if (loadError) {
      setMembers([]);
      setError("Benutzer konnten nicht geladen werden. Prüfe die Supabase-Berechtigungen.");
      setLoadingMembers(false);
      return;
    }

    const mapped = ((data ?? []) as ProfileRow[]).map((profile) => ({
      id: profile.id,
      name: profile.display_name?.trim() || "Unbenannter Benutzer",
      role: profile.role,
      active: profile.active,
    }));

    setMembers(mapped);
    setSelectedMember((current) => current && mapped.some((member) => member.id === current) ? current : mapped[0]?.id ?? null);
    setLoadingMembers(false);
  }, [supabase]);

  useEffect(() => {
    if (isAllowed) void loadMembers();
  }, [isAllowed, loadMembers]);

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    return members.filter((member) => !query || member.name.toLowerCase().includes(query));
  }, [members, memberSearch]);

  const selectedMemberData = members.find((member) => member.id === selectedMember) ?? null;

  const toggleRolePermission = (permission: Permission) => {
    setSaved(false);
    setRolePermissions((current) => ({
      ...current,
      [selectedRole]: current[selectedRole].includes(permission)
        ? current[selectedRole].filter((item) => item !== permission)
        : [...current[selectedRole], permission],
    }));
  };

  const toggleMemberOverride = (permission: Permission) => {
    if (!selectedMember) return;
    setSaved(false);
    setMemberOverrides((current) => ({
      ...current,
      [selectedMember]: current[selectedMember]?.includes(permission)
        ? current[selectedMember].filter((item) => item !== permission)
        : [...(current[selectedMember] ?? []), permission],
    }));
  };

  if (!isAllowed) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Background />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-12 pt-36">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Zurück zum Dashboard</Link>
          <div className="rounded-[30px] border border-red-400/20 bg-red-400/[0.07] p-8 backdrop-blur-2xl">
            <Lock size={25} className="text-red-300" />
            <h1 className="mt-5 text-3xl font-black text-white">Kein Zugriff</h1>
            <p className="mt-3 text-white/60">Du besitzt aktuell keine Berechtigung, Rollen und Rechte zu verwalten.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-36">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Zurück zur Administration</Link>
          <button type="button" onClick={() => void loadMembers()} disabled={loadingMembers} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40"><RefreshCw size={16} className={loadingMembers ? "animate-spin" : ""} />Aktualisieren</button>
        </div>

        <div className="mb-10 mt-8">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Administration</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white">Rollen & Rechte</h1>
          <p className="mt-3 max-w-2xl text-lg leading-7 text-white/60">Rollen zentral konfigurieren und einzelne Berechtigungen für bestimmte Benutzer anpassen.</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <InfoCard icon={<ShieldCheck size={20} />} label="Rollen" value={String(roleOrder.length)} />
          <InfoCard icon={<Settings size={20} />} label="Berechtigungen" value={String(permissionMeta.length)} />
          <InfoCard icon={<Users size={20} />} label="Benutzer" value={String(members.length)} />
        </div>

        {error && <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200">{error}</div>}

        <div className="mb-10 rounded-[28px] border border-amber-400/15 bg-amber-400/[0.055] p-5 backdrop-blur-2xl">
          <div className="flex gap-4"><ShieldCheck className="mt-1 shrink-0 text-amber-300" size={20} /><div><h2 className="font-bold text-white">Rollen aus Supabase</h2><p className="mt-1 leading-6 text-white/55">Die Benutzer unter „Individuelle Ausnahmen“ werden direkt aus den echten Supabase-Profilen geladen. Die Standardrechte bleiben zentral im Berechtigungsmodell der Anwendung definiert.</p></div></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-white/35">Standardrechte</p>
            <h2 className="mt-1 text-2xl font-black text-white">Rollen</h2>
            <div className="mt-4 space-y-3">
              {roleOrder.map((roleId) => (
                <button key={roleId} type="button" onClick={() => { setSelectedRole(roleId); setSaved(false); }} className={`w-full rounded-2xl border p-4 text-left transition ${selectedRole === roleId ? "border-amber-400/30 bg-amber-400/[0.09]" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.055]"}`}>
                  <div className="flex items-center gap-4"><div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${selectedRole === roleId ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/[0.04] text-white/45"}`}>{roleIcons[roleId]}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><h3 className="font-bold text-white">{roles[roleId].label}</h3><span className="text-sm text-white/45">{rolePermissions[roleId].length}</span></div><p className="mt-1 text-sm text-white/40">{roles[roleId].description}</p></div></div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.18em] text-amber-300/70">Rolle konfigurieren</p><h2 className="mt-1 text-3xl font-black text-white">{roles[selectedRole].label}</h2><p className="mt-2 text-sm text-white/45">Standardrechte dieser Rolle aktivieren oder deaktivieren.</p></div><div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-right"><p className="text-xs text-white/30">Aktiv</p><p className="mt-1 text-xl font-black text-white">{rolePermissions[selectedRole].length}/{permissionMeta.length}</p></div></div>
            <div className="mt-6 space-y-2">{permissionMeta.map((item) => <PermissionRow key={item.permission} title={item.title} description={item.description} icon={item.icon} enabled={rolePermissions[selectedRole].includes(item.permission)} onToggle={() => toggleRolePermission(item.permission)} />)}</div>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm uppercase tracking-[0.18em] text-white/35">Individuelle Ausnahmen</p>
          <h2 className="mt-1 text-3xl font-black text-white">Berechtigungen pro Benutzer</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/45">Die Auswahl zeigt echte Benutzer aus Supabase. Zusätzliche individuelle Rechte gelten in dieser ersten Version nur für die laufende Sitzung.</p>

          <div className="mt-5 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
              <div className="relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" /><input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Benutzer suchen..." className="w-full rounded-2xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/25" /></div>
              <div className="mt-4 space-y-2">
                {loadingMembers ? <div className="p-6 text-center text-sm text-white/35">Benutzer werden geladen...</div> : filteredMembers.map((member) => (
                  <button key={member.id} type="button" onClick={() => setSelectedMember(member.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedMember === member.id ? "border-amber-400/25 bg-amber-400/[0.08]" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"}`}>
                    <div className="flex items-center gap-3"><UserRound size={18} className="text-white/40" /><div className="flex-1"><p className="font-semibold text-white">{member.name}</p><p className="text-xs text-white/35">{roles[member.role].label} · {member.active ? "Aktiv" : "Inaktiv"}</p></div>{memberOverrides[member.id]?.length ? <span className="text-xs text-amber-300">+{memberOverrides[member.id].length}</span> : null}</div>
                  </button>
                ))}
                {!loadingMembers && !filteredMembers.length && <p className="p-6 text-center text-sm text-white/35">Kein Benutzer gefunden.</p>}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6">
              {selectedMemberData ? (
                <>
                  <div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300"><UserRound size={22} /></div><div><p className="text-sm text-amber-300/70">Benutzer</p><h3 className="text-2xl font-black text-white">{selectedMemberData.name}</h3><p className="text-sm text-white/40">Standardrolle: {roles[selectedMemberData.role].label}</p></div></div>
                  <div className="mt-5 space-y-2">{permissionMeta.map((item) => { const roleHas = rolePermissions[selectedMemberData.role].includes(item.permission); const overrideHas = memberOverrides[selectedMemberData.id]?.includes(item.permission) ?? false; return <div key={item.permission} className="rounded-2xl border border-white/[0.07] bg-black/[0.06] p-3"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${roleHas ? "bg-emerald-400/10 text-emerald-300" : overrideHas ? "bg-amber-400/10 text-amber-300" : "bg-white/5 text-white/20"}`}>{roleHas || overrideHas ? <CheckCircle2 size={16} /> : <X size={15} />}</div><div className="flex-1"><p className="text-sm font-semibold text-white">{item.title}</p><p className="text-xs text-white/30">{roleHas ? "Durch Rolle aktiv" : overrideHas ? "Individuell aktiviert" : "Nicht aktiv"}</p></div><SmoothToggle checked={roleHas || overrideHas} onChange={() => toggleMemberOverride(item.permission)} disabled={roleHas} label={`${item.title} individuell aktivieren`} /></div></div>; })}</div>
                </>
              ) : <div className="py-16 text-center text-white/35">Noch kein Benutzer ausgewählt.</div>}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-3">{saved ? <><CheckCircle2 size={19} className="text-emerald-300" /><p className="text-sm text-white">Änderungen übernommen</p></> : <p className="text-sm text-white/35">Standardrechte werden aus dem Anwendungscode geladen.</p>}</div>
          <button type="button" onClick={() => setSaved(true)} className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-400/15"><Save size={17} />Änderungen speichern</button>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl"><div className="flex items-center gap-2 text-amber-300">{icon}<span className="text-sm text-white/45">{label}</span></div><p className="mt-4 text-3xl font-black text-white">{value}</p></div>;
}

function PermissionRow({ title, description, icon, enabled, onToggle }: { title: string; description: string; icon: ReactNode; enabled: boolean; onToggle: () => void }) {
  return <div className="rounded-2xl border border-white/[0.07] bg-black/[0.06] p-4"><div className="flex items-center gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${enabled ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/20"}`}>{icon}</div><div className="min-w-0 flex-1"><p className="font-semibold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-white/35">{description}</p></div><SmoothToggle checked={enabled} onChange={onToggle} label={`${title} aktivieren`} /></div></div>;
}
