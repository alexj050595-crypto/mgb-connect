"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, Clock, Search, Users } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useRole } from "@/context/RoleContext";
import { services } from "@/data/services";

export default function LeaderSchedulePage() {
  const { hasPermission } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Alle");
  const canManageSchedule = hasPermission("manage_schedule");

  const sortedServices = useMemo(() => [...services].sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()), []);
  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedServices.filter((service) => {
      const matchesSearch = !q || [service.title, service.leader, service.date, service.meeting].some((value) => value.toLowerCase().includes(q));
      const matchesFilter = filter === "Alle" || (filter === "Offen" && service.status === "exchange_requested") || (filter === "Eingeplant" && service.status === "scheduled") || (filter === "Abgeschlossen" && service.status === "completed");
      return matchesSearch && matchesFilter;
    });
  }, [sortedServices, search, filter]);

  const months = useMemo(() => {
    const names = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    const map = new Map<string, string>();
    filteredServices.forEach((service) => { const key = service.dateISO.slice(0, 7); if (!map.has(key)) { const [year, month] = key.split("-").map(Number); map.set(key, `${names[month - 1]} ${year}`); } });
    return [...map.entries()].map(([key, label]) => ({ key, label }));
  }, [filteredServices]);

  const status = (value: (typeof services)[number]["status"]) => {
    if (value === "scheduled") return ["Eingeplant", "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"];
    if (value === "exchange_requested") return ["Vertretung gesucht", "border-amber-400/20 bg-amber-400/10 text-amber-300"];
    if (value === "taken_over") return ["Übernommen", "border-purple-400/20 bg-purple-400/10 text-purple-300"];
    if (value === "excused") return ["Abgemeldet", "border-red-400/20 bg-red-400/10 text-red-300"];
    return ["Abgeschlossen", "border-white/10 bg-white/5 text-white/50"];
  };

  if (!canManageSchedule) return <main className="relative min-h-screen overflow-hidden"><Background /><section className="relative z-10 flex min-h-screen items-center justify-center px-6"><div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-8 text-center"><AlertCircle size={28} className="mx-auto text-red-300" /><h1 className="mt-5 text-2xl font-bold text-white">Kein Zugriff</h1><p className="mt-2 text-sm text-white/50">Du hast keine Berechtigung, den Messdienerplan zu verwalten.</p><Link href="/leader" className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10"><ArrowLeft size={16} />Zum Leiterbereich</Link></div></section></main>;

  return <main className="relative min-h-screen overflow-hidden"><Background /><div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" /><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} /><section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-36">
    <Link href="/leader" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-amber-300"><ArrowLeft size={15} />Leiterbereich</Link>
    <div className="mt-8"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Planung</p><h1 className="mt-2 text-5xl font-black tracking-tight text-white">Messdienerplan</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Alle geplanten Dienste chronologisch auf einen Blick.</p></div>
    <div className="mt-10 grid gap-4 sm:grid-cols-3"><ScheduleStat icon={<CalendarDays size={20} />} label="Dienste" value={String(sortedServices.length)} /><ScheduleStat icon={<Users size={20} />} label="Offene Vertretungen" value={String(sortedServices.filter((s) => s.status === "exchange_requested").length)} /><ScheduleStat icon={<CheckCircle2 size={20} />} label="Abgeschlossen" value={String(sortedServices.filter((s) => s.status === "completed").length)} /></div>
    <div className="mt-8 rounded-[26px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl"><div className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Dienst, Leiter oder Datum suchen..." className="w-full rounded-2xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/25" /></div><div className="flex flex-wrap gap-2">{["Alle", "Eingeplant", "Offen", "Abgeschlossen"].map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-2xl border px-4 py-3 text-sm transition ${filter === item ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06]"}`}>{item}</button>)}</div></div></div>
    <div className="mt-10 space-y-10">{months.map((month) => { const monthServices = filteredServices.filter((s) => s.dateISO.startsWith(month.key)); return <section key={month.key}><div className="mb-4 flex items-center gap-4"><h2 className="text-xl font-bold text-white">{month.label}</h2><div className="h-px flex-1 bg-white/10" /><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">{monthServices.length} {monthServices.length === 1 ? "Dienst" : "Dienste"}</span></div><div className="space-y-3">{monthServices.map((service) => { const [label, className] = status(service.status); return <div key={service.id} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-white/15 hover:bg-white/[0.06]"><div className="flex flex-col gap-5 lg:flex-row lg:items-center"><div className="flex shrink-0 items-center gap-4 lg:w-56"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-amber-300"><CalendarDays size={21} /></div><div><p className="font-semibold text-white">{service.date}</p><div className="mt-1 flex items-center gap-2 text-sm text-white/45"><Clock size={14} />{service.time}</div></div></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-semibold text-white">{service.title}</h3><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>{label}</span></div><div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50"><span className="flex items-center gap-2"><Users size={15} />Leiter: {service.leader}</span><span>{service.meeting}</span></div></div><div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 lg:text-right"><p className="text-xs text-white/35">Punkte</p><p className="mt-0.5 text-lg font-bold text-amber-300">+{service.points}</p></div></div></div>; })}</div></section>; })}</div>
    {!filteredServices.length && <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center"><Search size={32} className="mx-auto text-white/20" /><h2 className="mt-4 text-xl font-bold text-white">Keine Dienste gefunden</h2><p className="mt-2 text-sm text-white/40">Passe deine Suche oder den Filter an.</p></div>}
  </section></main>;
}
function ScheduleStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-xs text-white/35">{label}</p><p className="mt-0.5 font-semibold text-white">{value}</p></div></div></div>; }
