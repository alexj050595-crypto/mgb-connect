"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UserRound,
  Users,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";
import { hasPermission, roles, type UserRole } from "@/lib/permissions";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  points: number;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
};

const roleOptions: UserRole[] = ["messdiener", "leiter", "planschreiber", "admin"];

const roleStyles: Record<UserRole, string> = {
  messdiener: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  leiter: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  planschreiber: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  admin: "border-amber-400/20 bg-amber-400/10 text-amber-300",
};

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "password" | "delete" | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { role } = useRole();
  const allowed = hasPermission(role, "manage_members");

  const loadUsers = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as { users?: AdminUser[]; error?: string };
    if (!response.ok) {
      setError(data.error ?? "Benutzer konnten nicht geladen werden.");
      setLoading(false);
      return;
    }
    setUsers(data.users ?? []);
    setLoading(false);
  }, [allowed]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const activeUsers = users.filter((user) => user.active).length;
  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);

  async function updateUser(userId: string, body: { role?: UserRole; active?: boolean; displayName?: string }) {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update", userId, ...body }) });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Änderung konnte nicht gespeichert werden.");
      return;
    }
    setNotice("Änderung gespeichert.");
    await loadUsers();
    window.setTimeout(() => setNotice(null), 1800);
  }

  async function deleteUser() {
    if (!selectedUser) return;
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", userId: selectedUser.id }) });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Benutzer konnte nicht gelöscht werden.");
      return;
    }
    setModal(null);
    setSelectedUser(null);
    setNotice("Benutzer endgültig gelöscht.");
    await loadUsers();
    window.setTimeout(() => setNotice(null), 2200);
  }

  async function setPassword(password: string) {
    if (!selectedUser) return;
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set_password", userId: selectedUser.id, password }) });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Passwort konnte nicht geändert werden.");
      return;
    }
    setModal(null);
    setNotice("Passwort wurde neu gesetzt.");
    window.setTimeout(() => setNotice(null), 2200);
  }

  async function createUser(email: string, password: string, displayName: string, newRole: UserRole) {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", email, password, displayName, role: newRole }) });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Benutzer konnte nicht erstellt werden.");
      return;
    }
    setModal(null);
    setNotice("Benutzer wurde erstellt.");
    await loadUsers();
    window.setTimeout(() => setNotice(null), 2200);
  }

  if (!allowed) {
    return <AccessDenied sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-36">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-white/55 transition hover:text-white"><ArrowLeft size={18} />Zurück zur Administration</Link>
          <div className="flex gap-2">
            <button type="button" onClick={() => void loadUsers()} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-white/65 hover:bg-white/[0.07] hover:text-white disabled:opacity-40"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Aktualisieren</button>
            <button type="button" onClick={() => { setError(null); setModal("create"); }} className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-400/15"><Plus size={17} />Benutzer anlegen</button>
          </div>
        </div>

        <div className="mb-10 mt-8"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Administration</p><h1 className="mt-2 text-5xl font-black tracking-tight text-white">Benutzerverwaltung</h1><p className="mt-3 text-lg text-white/60">Accounts, Rollen, Aktivierung und Zugangsdaten direkt aus MGB Connect verwalten.</p></div>

        <div className="grid gap-4 md:grid-cols-3">
          <AdminStat icon={<Users size={20} />} value={users.length} label="Benutzer insgesamt" />
          <AdminStat icon={<CheckCircle2 size={20} />} value={activeUsers} label="Aktive Benutzer" />
          <AdminStat icon={<UserCog size={20} />} value={totalPoints} label="Gesamtpunkte" />
        </div>

        {notice && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-200"><CheckCircle2 size={18} />{notice}</div>}
        {error && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1"><Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name oder E-Mail suchen..." className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-12 pr-4 text-white outline-none placeholder:text-white/30 focus:border-amber-400/30" /></div>
            <div className="relative"><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)} className="appearance-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pr-11 text-white outline-none focus:border-amber-400/30"><option value="all">Alle Rollen</option>{roleOptions.map((r) => <option key={r} value={r}>{roles[r].label}</option>)}</select><ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40" /></div>
          </div>
          <p className="mt-4 text-sm text-white/40">{filteredUsers.length} von {users.length} Benutzern</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-6 py-5"><div className="flex items-center gap-3"><UserCog size={21} className="text-amber-300" /><div><h2 className="font-bold text-white">Accounts</h2><p className="mt-1 text-sm text-white/45">Direkt mit Supabase Auth und profiles verbunden.</p></div></div></div>
          {loading ? <div className="px-6 py-16 text-center text-white/40">Benutzer werden geladen...</div> : filteredUsers.length === 0 ? <div className="px-6 py-16 text-center"><UserRound size={34} className="mx-auto text-white/25" /><h3 className="mt-4 text-xl font-bold text-white">Keine Benutzer gefunden</h3></div> : <div className="divide-y divide-white/10">{filteredUsers.map((user) => <UserRow key={user.id} user={user} busy={busy} onRoleChange={(next) => void updateUser(user.id, { role: next })} onToggle={() => void updateUser(user.id, { active: !user.active })} onPassword={() => { setSelectedUser(user); setModal("password"); }} onDelete={() => { setSelectedUser(user); setModal("delete"); }} />)}</div>}
        </div>

        <div className="mt-8 rounded-[26px] border border-amber-400/15 bg-amber-400/[0.05] p-5"><div className="flex items-start gap-4"><ShieldCheck size={22} className="mt-0.5 shrink-0 text-amber-300" /><div><h3 className="font-bold text-white">Wichtiger Unterschied bei Passwörtern</h3><p className="mt-2 leading-6 text-white/55">Aus Sicherheitsgründen kann weder diese Website noch ein Administrator das bestehende Passwort eines Benutzers auslesen. Du kannst aber jederzeit ein neues Passwort setzen. Das Passwort wird dabei nicht in <code className="text-white/70">profiles</code> gespeichert.</p></div></div></div>
      </section>

      {modal === "create" && <CreateModal busy={busy} onClose={() => setModal(null)} onCreate={createUser} />}
      {modal === "password" && selectedUser && <PasswordModal user={selectedUser} busy={busy} onClose={() => setModal(null)} onSave={setPassword} />}
      {modal === "delete" && selectedUser && <DeleteModal user={selectedUser} busy={busy} onClose={() => setModal(null)} onDelete={deleteUser} />}
    </main>
  );
}

function UserRow({ user, busy, onRoleChange, onToggle, onPassword, onDelete }: { user: AdminUser; busy: boolean; onRoleChange: (role: UserRole) => void; onToggle: () => void; onPassword: () => void; onDelete: () => void }) {
  return <div className="flex flex-col gap-5 px-6 py-5 transition hover:bg-white/[0.025] lg:flex-row lg:items-center lg:justify-between">
    <div className="flex min-w-0 items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/70"><UserRound size={21} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold text-white">{user.name}</p><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${roleStyles[user.role]}`}>{roles[user.role].label}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${user.active ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300/80" : "border-white/10 bg-white/[0.04] text-white/35"}`}>{user.active ? "Aktiv" : "Inaktiv"}</span></div><p className="mt-1 truncate text-sm text-white/45">{user.email}</p><div className="mt-2 flex flex-wrap gap-4 text-xs text-white/30"><span>{user.points} Punkte</span><span>{user.emailConfirmed ? "E-Mail bestätigt" : "E-Mail nicht bestätigt"}</span><span>{user.lastSignInAt ? `Zuletzt ${new Date(user.lastSignInAt).toLocaleDateString("de-DE")}` : "Noch nicht angemeldet"}</span></div></div></div>
    <div className="flex flex-wrap items-center gap-2 lg:justify-end"><select value={user.role} onChange={(e) => onRoleChange(e.target.value as UserRole)} disabled={busy} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/30 disabled:opacity-50">{roleOptions.map((r) => <option key={r} value={r}>{roles[r].label}</option>)}</select><button type="button" disabled={busy} onClick={onToggle} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/55 hover:bg-white/[0.07] hover:text-white disabled:opacity-50">{user.active ? "Deaktivieren" : "Aktivieren"}</button><button type="button" disabled={busy} onClick={onPassword} title="Passwort neu setzen" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white/55 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"><KeyRound size={16} />Passwort</button><button type="button" disabled={busy} onClick={onDelete} title="Benutzer löschen" className="inline-flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-3 py-2.5 text-sm font-semibold text-red-300/75 hover:bg-red-400/10 hover:text-red-200 disabled:opacity-50"><Trash2 size={16} />Löschen</button></div>
  </div>;
}

function ModalShell({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"><div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black text-white">{title}</h2><button type="button" onClick={onClose} className="rounded-xl p-2 text-white/40 hover:bg-white/5 hover:text-white">×</button></div>{children}</div></div>;
}

function CreateModal({ busy, onClose, onCreate }: { busy: boolean; onClose: () => void; onCreate: (email: string, password: string, name: string, role: UserRole) => Promise<void> }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState(""); const [role, setRole] = useState<UserRole>("messdiener"); const [show, setShow] = useState(false);
  return <ModalShell title="Benutzer anlegen" onClose={onClose}><p className="mt-2 text-sm leading-6 text-white/45">Der Account wird direkt in Supabase Auth erstellt und erhält gleichzeitig sein Profil und seine Rolle.</p><div className="mt-6 space-y-4"><Field label="Name" value={name} onChange={setName} placeholder="z. B. Max Mustermann" /><Field label="E-Mail" value={email} onChange={setEmail} placeholder="name@example.de" type="email" /><div><label className="mb-2 block text-sm font-semibold text-white/65">Rolle</label><select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-amber-400/30">{roleOptions.map((r) => <option key={r} value={r}>{roles[r].label}</option>)}</select></div><PasswordField label="Startpasswort" value={password} onChange={setPassword} show={show} setShow={setShow} /></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-semibold text-white/45 hover:text-white">Abbrechen</button><button type="button" disabled={busy} onClick={() => void onCreate(email, password, name, role)} className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 disabled:opacity-50">{busy ? "Wird erstellt..." : "Benutzer erstellen"}</button></div></ModalShell>;
}

function PasswordModal({ user, busy, onClose, onSave }: { user: AdminUser; busy: boolean; onClose: () => void; onSave: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState(""); const [show, setShow] = useState(false);
  return <ModalShell title="Passwort neu setzen" onClose={onClose}><p className="mt-2 text-sm leading-6 text-white/45">Für <span className="text-white/70">{user.email}</span> wird ein neues Passwort gesetzt. Das bisherige Passwort kann nicht ausgelesen werden.</p><div className="mt-6"><PasswordField label="Neues Passwort" value={password} onChange={setPassword} show={show} setShow={setShow} /></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-semibold text-white/45 hover:text-white">Abbrechen</button><button type="button" disabled={busy} onClick={() => void onSave(password)} className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 disabled:opacity-50">{busy ? "Wird gespeichert..." : "Passwort setzen"}</button></div></ModalShell>;
}

function DeleteModal({ user, busy, onClose, onDelete }: { user: AdminUser; busy: boolean; onClose: () => void; onDelete: () => Promise<void> }) {
  return <ModalShell title="Benutzer endgültig löschen" onClose={onClose}><div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4"><p className="font-semibold text-red-200">{user.name}</p><p className="mt-1 text-sm text-red-200/60">{user.email}</p><p className="mt-3 text-sm leading-6 text-red-100/60">Der Auth-Account wird dauerhaft gelöscht. Sein Profil wird durch die bestehende Cascade-Beziehung ebenfalls entfernt. Diese Aktion kann nicht über die Website rückgängig gemacht werden.</p></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-semibold text-white/45 hover:text-white">Abbrechen</button><button type="button" disabled={busy} onClick={() => void onDelete()} className="rounded-xl border border-red-400/25 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 disabled:opacity-50">{busy ? "Wird gelöscht..." : "Endgültig löschen"}</button></div></ModalShell>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <div><label className="mb-2 block text-sm font-semibold text-white/65">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" /></div>; }
function PasswordField({ label, value, onChange, show, setShow }: { label: string; value: string; onChange: (value: string) => void; show: boolean; setShow: (value: boolean) => void }) { return <div><label className="mb-2 block text-sm font-semibold text-white/65">{label}</label><div className="relative"><input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Mindestens 8 Zeichen" className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-white outline-none placeholder:text-white/25 focus:border-amber-400/30" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>; }
function AdminStat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl"><div className="flex items-center gap-2 text-amber-300">{icon}<span className="text-sm text-white/45">{label}</span></div><p className="mt-4 text-3xl font-black text-white">{value}</p></div>; }
function AccessDenied({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (value: boolean) => void }) { return <main className="relative min-h-screen overflow-hidden"><Background /><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} /><section className="relative z-10 mx-auto max-w-5xl px-6 pb-12 pt-36"><Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Zurück zur Administration</Link><div className="rounded-[30px] border border-red-400/20 bg-red-400/[0.07] p-8 backdrop-blur-2xl"><ShieldCheck size={25} className="text-red-300" /><h1 className="mt-5 text-3xl font-black text-white">Kein Zugriff</h1><p className="mt-3 text-white/60">Du besitzt aktuell keine Berechtigung, Benutzer zu verwalten.</p></div></section></main>; }
