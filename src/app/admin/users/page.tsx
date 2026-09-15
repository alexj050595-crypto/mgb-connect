"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Users,
  ShieldCheck,
  UserCog,
  Trophy,
  ChevronDown,
  CheckCircle2,
  UserRound,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";
import { hasPermission, roles, type UserRole } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/client";

type MemberStatus = "active" | "inactive";

type AdminUser = {
  id: string;
  name: string;
  role: UserRole;
  status: MemberStatus;
  services: number;
  points: number;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  role: UserRole;
  active: boolean;
  points: number;
};

type ServiceRow = {
  assigned_to: string | null;
  points: number;
  status: string;
};

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  messdiener: { label: "Messdiener", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  leiter: { label: "Leiter", className: "border-blue-400/20 bg-blue-400/10 text-blue-300" },
  planschreiber: { label: "Planschreiber", className: "border-violet-400/20 bg-violet-400/10 text-violet-300" },
  admin: { label: "Administrator", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
};

const roleOptions: UserRole[] = ["messdiener", "leiter", "planschreiber", "admin"];

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { role } = useRole();
  const allowed = hasPermission(role, "manage_members");
  const supabase = useMemo(() => createClient(), []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [profilesResult, servicesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, role, active, points")
        .order("display_name", { ascending: true }),
      supabase
        .from("services")
        .select("assigned_to, points, status"),
    ]);

    if (profilesResult.error) {
      setError("Benutzer konnten nicht geladen werden. Prüfe die Supabase-Berechtigungen.");
      setUsers([]);
      setLoading(false);
      return;
    }

    const serviceRows = (servicesResult.data ?? []) as ServiceRow[];
    const stats = new Map<string, { services: number; points: number }>();

    for (const service of serviceRows) {
      if (!service.assigned_to) continue;
      const current = stats.get(service.assigned_to) ?? { services: 0, points: 0 };
      current.services += 1;
      if (service.status === "completed") current.points += service.points ?? 0;
      stats.set(service.assigned_to, current);
    }

    const mapped = ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => {
      const serviceStats = stats.get(profile.id) ?? { services: 0, points: 0 };
      return {
        id: profile.id,
        name: profile.display_name?.trim() || "Unbenannter Benutzer",
        role: profile.role,
        status: profile.active ? "active" : "inactive",
        services: serviceStats.services,
        points: profile.points ?? serviceStats.points,
      } satisfies AdminUser;
    });

    setUsers(mapped);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (allowed) void loadUsers();
  }, [allowed, loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !query || user.name.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const activeUsers = useMemo(() => users.filter((user) => user.status === "active").length, [users]);
  const totalPoints = useMemo(() => users.reduce((sum, user) => sum + user.points, 0), [users]);

  async function updateUser(userId: string, changes: Partial<Pick<AdminUser, "role" | "status">>) {
    const target = users.find((user) => user.id === userId);
    if (!target) return;

    setSavingId(userId);
    setSavedId(null);
    setError(null);

    const update: { role?: UserRole; active?: boolean } = {};
    if (changes.role) update.role = changes.role;
    if (changes.status) update.active = changes.status === "active";

    const { error: updateError } = await supabase.from("profiles").update(update).eq("id", userId);

    if (updateError) {
      setError(updateError.message || "Änderung konnte nicht gespeichert werden.");
      setSavingId(null);
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, ...(changes.role ? { role: changes.role } : {}), ...(changes.status ? { status: changes.status } : {}) }
          : user
      )
    );
    setSavedId(userId);
    setSavingId(null);
    window.setTimeout(() => setSavedId((current) => (current === userId ? null : current)), 1800);
  }

  if (!allowed) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Background />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-12 pt-36">
          <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-white/55 hover:text-white">
            <ArrowLeft size={18} /> Zurück zur Administration
          </Link>
          <div className="rounded-[30px] border border-red-400/20 bg-red-400/[0.07] p-8 backdrop-blur-2xl">
            <ShieldCheck size={25} className="text-red-300" />
            <h1 className="mt-5 text-3xl font-black text-white">Kein Zugriff</h1>
            <p className="mt-3 text-white/60">Du besitzt aktuell keine Berechtigung, Benutzer zu verwalten.</p>
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

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-36">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-white/55 transition hover:text-white">
            <ArrowLeft size={18} /> Zurück zur Administration
          </Link>
          <button type="button" onClick={() => void loadUsers()} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Aktualisieren
          </button>
        </div>

        <div className="mb-10 mt-8">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Administration</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Benutzerverwaltung</h1>
          <p className="mt-3 text-lg text-white/60">Verwalte Benutzer, Rollen und den aktuellen Status der MGB.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <AdminStat icon={<Users size={20} />} value={users.length} label="Benutzer insgesamt" />
          <AdminStat icon={<CheckCircle2 size={20} />} value={activeUsers} label="Aktive Benutzer" />
          <AdminStat icon={<Trophy size={20} />} value={totalPoints} label="Gesamtpunkte" />
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Benutzer suchen..." className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-white/30 focus:border-amber-400/30 focus:bg-black/30" />
            </div>
            <div className="relative">
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | UserRole)} className="appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-11 text-white outline-none transition focus:border-amber-400/30">
                <option value="all">Alle Rollen</option>
                {roleOptions.map((option) => <option key={option} value={option}>{roles[option].label}</option>)}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40" />
            </div>
          </div>
          <p className="mt-4 text-sm text-white/40">{filteredUsers.length} von {users.length} Benutzern</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <UserCog size={21} className="text-amber-300" />
              <div>
                <h2 className="font-bold text-white">Benutzer</h2>
                <p className="mt-1 text-sm text-white/45">Echte Profile aus Supabase verwalten.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-white/40">Benutzer werden geladen...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <UserRound size={34} className="mx-auto text-white/25" />
              <h3 className="mt-4 text-xl font-bold text-white">Keine Benutzer gefunden</h3>
              <p className="mt-2 text-white/45">Passe deine Suche oder den Rollenfilter an.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} saving={savingId === user.id} saved={savedId === user.id} onRoleChange={(nextRole) => void updateUser(user.id, { role: nextRole })} onStatusChange={(nextStatus) => void updateUser(user.id, { status: nextStatus })} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-[26px] border border-amber-400/15 bg-amber-400/[0.05] p-5">
          <div className="flex items-start gap-4">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-amber-300" />
            <div>
              <h3 className="font-bold text-white">Supabase aktiv</h3>
              <p className="mt-2 max-w-3xl leading-6 text-white/55">Rollen und Benutzerstatus werden jetzt direkt in <code className="text-white/70">profiles</code> gespeichert. Die Rechteprüfung bleibt zusätzlich serverseitig über Supabase RLS geschützt.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminStat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <div className="flex items-center gap-2 text-amber-300">{icon}<span className="text-sm text-white/45">{label}</span></div>
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function UserRow({
  user,
  saving,
  saved,
  onRoleChange,
  onStatusChange,
}: {
  user: AdminUser;
  saving: boolean;
  saved: boolean;
  onRoleChange: (role: UserRole) => void;
  onStatusChange: (status: MemberStatus) => void;
}) {
  const role = roleConfig[user.role];

  return (
    <div className="flex flex-col gap-5 px-6 py-5 transition hover:bg-white/[0.025] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70"><UserRound size={21} /></div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-white">{user.name}</p>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${role.className}`}>{role.label}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${user.status === "active" ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300/80" : "border-white/10 bg-white/[0.04] text-white/35"}`}>{user.status === "active" ? "Aktiv" : "Inaktiv"}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/35"><span>{user.services} Dienste</span><span>{user.points} Punkte</span><span className="font-mono">{user.id.slice(0, 8)}…</span></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <select value={user.role} onChange={(event) => onRoleChange(event.target.value as UserRole)} disabled={saving} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/30 disabled:opacity-50">
          {roleOptions.map((option) => <option key={option} value={option}>{roles[option].label}</option>)}
        </select>
        <button type="button" disabled={saving} onClick={() => onStatusChange(user.status === "active" ? "inactive" : "active")} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${user.status === "active" ? "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.07] hover:text-white" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"}`}>
          {user.status === "active" ? "Deaktivieren" : "Aktivieren"}
        </button>
        {saving && <RefreshCw size={17} className="animate-spin text-amber-300" />}
        {saved && <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300"><CheckCircle2 size={16} />Gespeichert</span>}
      </div>
    </div>
  );
}
