"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Search, User, Users, ShieldCheck, CheckCircle2, Clock3 } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";

const demoMembers = [
  { name: "Tim Mustermann", role: "Messdiener", status: "Aktiv", services: 8, points: 24 },
  { name: "Max Mustermann", role: "Messdiener", status: "Aktiv", services: 6, points: 18 },
  { name: "Anna Beispiel", role: "Leiter", status: "Leitung", services: 12, points: 36 },
  { name: "Thomas Leiter", role: "Leiter", status: "Leitung", services: 10, points: 30 },
];

export default function LeaderTeamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Alle");
  const { isLeader } = useRole();

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return demoMembers.filter((member) => {
      const matchesSearch = !query || member.name.toLowerCase().includes(query);
      const matchesFilter = filter === "Alle" || member.role === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  if (!isLeader) return <main className="relative min-h-screen overflow-hidden"><Background /><div className="relative z-10 flex min-h-screen items-center justify-center px-6"><div className="text-center"><h1 className="text-2xl font-bold text-white">Kein Zugriff</h1><Link href="/" className="mt-5 inline-flex items-center gap-2 text-white/50 hover:text-white"><ArrowLeft size={16} />Dashboard</Link></div></div></main>;

  return (
    <main className="relative min-h-screen overflow-hidden"><Background /><div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" /><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-36">
        <Link href="/leader" className="mb-8 inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Leiterbereich</Link>
        <div className="mb-10"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Leitung</p><h1 className="mt-2 text-5xl font-black tracking-tight text-white">Messdiener</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Übersicht über Mitglieder, Rollen, Punkte und aktuellen Status.</p></div>
        <div className="mb-6 grid gap-4 sm:grid-cols-3"><Stat icon={<Users size={20} />} label="Mitglieder" value={String(demoMembers.length)} /><Stat icon={<CheckCircle2 size={20} />} label="Aktiv" value={String(demoMembers.filter((m) => m.status === "Aktiv").length)} /><Stat icon={<Clock3 size={20} />} label="Gesamt Dienste" value={String(demoMembers.reduce((sum, m) => sum + m.services, 0))} /></div>
        <div className="mb-6 rounded-[26px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl"><div className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Messdiener suchen..." className="w-full rounded-2xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/25" /></div><div className="flex gap-2">{["Alle", "Messdiener", "Leiter"].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${filter === item ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06]"}`}>{item}</button>)}</div></div></div>
        <div className="space-y-3">{filteredMembers.map((member) => <div key={member.name} className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl transition hover:border-white/15 hover:bg-white/[0.06]"><div className="flex flex-col gap-5 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/45"><User size={20} /></div><div className="min-w-0"><p className="truncate font-semibold text-white">{member.name}</p><div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/40"><span>{member.role}</span><span>•</span><span>{member.services} Dienste</span><span>•</span><span>{member.points} Punkte</span></div></div></div><div className="flex items-center gap-3"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">{member.status}</span><div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50">{member.points} Pkt.</div></div></div></div>)}{!filteredMembers.length && <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-10 text-center"><Search size={28} className="mx-auto text-white/20" /><h2 className="mt-4 text-lg font-bold text-white">Keine Mitglieder gefunden</h2><p className="mt-2 text-sm text-white/40">Passe deine Suche oder den Filter an.</p></div>}</div>
        <div className="mt-8 rounded-[26px] border border-white/10 bg-white/[0.035] p-5"><div className="flex items-start gap-3"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-blue-300" /><p className="text-sm leading-6 text-white/45">Diese Ansicht ist zunächst eine Übersicht. Bearbeitung von Accounts, Rollen und persönlichen Daten bleibt den dafür vorgesehenen Verwaltungsrechten vorbehalten.</p></div></div>
      </section>
    </main>
  );
}
function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-xs text-white/35">{label}</p><p className="mt-0.5 text-xl font-black text-white">{value}</p></div></div></div>; }
