"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, Search, ShieldCheck, User, Users } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { roles, type UserRole } from "@/lib/permissions";

type Member = {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
  points: number;
  services: number;
};

export default function LeaderTeamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Alle" | UserRole>("Alle");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLeader } = useRole();
  const { user } = useAuth();

  const loadMembers = useCallback(async () => {
    if (!user || !isLeader) return;

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const [{ data: profiles, error: profileError }, { data: services, error: serviceError }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, role, active, points").order("display_name"),
      supabase.from("services").select("assigned_to, taken_by"),
    ]);

    if (profileError) {
      setError("Mitglieder konnten nicht geladen werden.");
      setLoading(false);
      return;
    }

    if (serviceError) {
      setError("Mitglieder wurden geladen, Dienststatistiken konnten aber nicht geladen werden.");
    }

    const serviceCounts = new Map<string, number>();
    for (const service of services ?? []) {
      if (service.assigned_to) serviceCounts.set(service.assigned_to, (serviceCounts.get(service.assigned_to) ?? 0) + 1);
      if (service.taken_by && service.taken_by !== service.assigned_to) serviceCounts.set(service.taken_by, (serviceCounts.get(service.taken_by) ?? 0) + 1);
    }

    setMembers(
      (profiles ?? []).map((profile) => ({
        id: profile.id,
        name: profile.display_name || "Unbenannter Benutzer",
        role: profile.role as UserRole,
        active: profile.active,
        points: profile.points,
        services: serviceCounts.get(profile.id) ?? 0,
      }))
    );
    setLoading(false);
  }, [isLeader, user]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch = !query || member.name.toLowerCase().includes(query);
      const matchesFilter = filter === "Alle" || member.role === filter;
      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  const activeCount = members.filter((member) => member.active).length;
  const serviceCount = members.reduce((sum, member) => sum + member.services, 0);

  if (!isLeader) return <main className="relative min-h-screen overflow-hidden"><Background /><div className="relative z-10 flex min-h-screen items-center justify-center px-6"><div className="text-center"><h1 className="text-2xl font-bold text-white">Kein Zugriff</h1><Link href="/" className="mt-5 inline-flex items-center gap-2 text-white/50 hover:text-white"><ArrowLeft size={16} />Dashboard</Link></div></div></main>;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-36">
        <div className="flex items-center justify-between gap-4">
          <Link href="/leader" className="inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Leiterbereich</Link>
          <button type="button" onClick={() => void loadMembers()} disabled={loading} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40">Aktualisieren</button>
        </div>

        <div className="mb-10 mt-8"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Leitung</p><h1 className="mt-2 text-5xl font-black tracking-tight text-white">Messdiener</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Live-Übersicht über Mitglieder, Rollen, Punkte und Dienstbeteiligung.</p></div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat icon={<Users size={20} />} label="Mitglieder" value={String(members.length)} />
          <Stat icon={<CheckCircle2 size={20} />} label="Aktiv" value={String(activeCount)} />
          <Stat icon={<Clock3 size={20} />} label="Dienste" value={String(serviceCount)} />
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-200">{error}</div>}

        <div className="mb-6 rounded-[26px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Messdiener suchen..." className="w-full rounded-2xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/25" /></div>
            <div className="flex flex-wrap gap-2">
              {(["Alle", "messdiener", "leiter", "planschreiber", "admin"] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item === "Alle" ? "Alle" : item)} className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${filter === item ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06]"}`}>{item === "Alle" ? "Alle" : roles[item].label}</button>)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-10 text-center text-white/40">Mitglieder werden geladen...</div> : filteredMembers.map((member) => <MemberRow key={member.id} member={member} />)}
          {!loading && !filteredMembers.length && <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-10 text-center"><Search size={28} className="mx-auto text-white/20" /><h2 className="mt-4 text-lg font-bold text-white">Keine Mitglieder gefunden</h2><p className="mt-2 text-sm text-white/40">Passe deine Suche oder den Filter an.</p></div>}
        </div>

        <div className="mt-8 rounded-[26px] border border-white/10 bg-white/[0.035] p-5"><div className="flex items-start gap-3"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-blue-300" /><p className="text-sm leading-6 text-white/45">Diese Ansicht nutzt die echten Supabase-Profile. Rollen und Account-Änderungen bleiben der Benutzer- und Rollenverwaltung vorbehalten.</p></div></div>
      </section>
    </main>
  );
}

function MemberRow({ member }: { member: Member }) {
  return <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl transition hover:border-white/15 hover:bg-white/[0.06]"><div className="flex flex-col gap-5 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/45"><User size={20} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold text-white">{member.name}</p><span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/55">{roles[member.role].label}</span></div><div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/40"><span>{member.services} Dienste</span><span>•</span><span>{member.points} Punkte</span></div></div></div><div className="flex items-center gap-3"><span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${member.active ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/[0.04] text-white/35"}`}>{member.active ? "Aktiv" : "Inaktiv"}</span><div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50">{member.points} Pkt.</div></div></div></div>;
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-xs text-white/35">{label}</p><p className="mt-0.5 text-xl font-black text-white">{value}</p></div></div></div>; }
