"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Search, Star, Trophy } from "lucide-react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useServices } from "@/context/ServiceContext";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import { createClient } from "@/lib/supabase/client";

type RankingMember = { id: string; name: string; points: number };

export default function PointsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("Alle");
  const [ranking, setRanking] = useState<RankingMember[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const { myServices } = useServices();
  const { user } = useAuth();
  const { enabled: demoMode, loading: demoLoading } = useDemoMode();

  const completedServices = useMemo(() => myServices.filter((s) => s.status === "completed"), [myServices]);
  const totalPoints = useMemo(() => completedServices.reduce((sum, s) => sum + s.points, 0), [completedServices]);
  const averagePoints = completedServices.length ? Math.round(totalPoints / completedServices.length) : 0;

  useEffect(() => {
    if (!user || demoLoading) return;
    async function loadRanking() {
      setRankingLoading(true);
      const supabase = createClient();

      if (demoMode) {
        const { data: services } = await supabase
          .from("demo_services")
          .select("assigned_to, taken_by, points, status");
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .eq("active", true);

        const totals = new Map<string, number>();
        for (const service of services ?? []) {
          if (service.status !== "completed") continue;
          if (service.assigned_to) totals.set(service.assigned_to, (totals.get(service.assigned_to) ?? 0) + service.points);
          if (service.taken_by && service.taken_by !== service.assigned_to) totals.set(service.taken_by, (totals.get(service.taken_by) ?? 0) + service.points);
        }
        setRanking((profiles ?? [])
          .map((profile) => ({ id: profile.id, name: profile.display_name || "Unbenannter Benutzer", points: totals.get(profile.id) ?? 0 }))
          .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "de"))
          .slice(0, 10));
      } else {
        const { data } = await supabase.from("profiles").select("id, display_name, points").eq("active", true).order("points", { ascending: false }).limit(10);
        setRanking((data ?? []).map((member) => ({ id: member.id, name: member.display_name || "Unbenannter Benutzer", points: member.points })));
      }
      setRankingLoading(false);
    }
    void loadRanking();
  }, [user, demoMode, demoLoading]);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return completedServices.filter((service) => {
      const matchesSearch = !q || service.title.toLowerCase().includes(q) || service.date.toLowerCase().includes(q);
      const matchesPeriod = period === "Alle" || service.date.toLowerCase().includes(period.toLowerCase());
      return matchesSearch && matchesPeriod;
    });
  }, [completedServices, search, period]);

  return <main className="relative min-h-screen overflow-hidden"><Background /><div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" /><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-36">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-white/55 hover:text-white"><ArrowLeft size={18} />Zurück zum Dashboard</Link>
      <div className="mb-10"><p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Punktesystem</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Dein Punktestand</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">Deine Punkte und abgeschlossenen Dienste aus dem aktuellen Datenbestand.</p></div>
      <div className="rounded-[32px] border border-amber-400/20 bg-amber-400/[0.08] p-7 backdrop-blur-2xl"><div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300"><Trophy size={23} /></div><div><p className="text-sm uppercase tracking-[0.18em] text-amber-300/70">Gesamtpunktestand</p><p className="text-sm text-white/40">Deine abgeschlossenen Dienste</p></div></div><div className="mt-5 flex items-end gap-3"><span className="text-6xl font-black tracking-tight text-white">{totalPoints}</span><span className="mb-2 text-lg text-white/40">Punkte</span></div></div><div className="grid grid-cols-2 gap-3"><StatBox icon={<CheckCircle2 size={18} />} value={completedServices.length} label="Abgeschlossen" /><StatBox icon={<Star size={18} />} value={averagePoints} label="Ø Punkte" /></div></div></div>
      <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl"><div className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Dienst oder Datum suchen..." className="w-full rounded-2xl border border-white/10 bg-black/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-400/25" /></div><div className="flex gap-2">{["Alle", "August", "September"].map((item) => <button key={item} type="button" onClick={() => setPeriod(item)} className={`rounded-2xl border px-4 py-3 text-sm transition ${period === item ? "border-amber-400/25 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.03] text-white/45 hover:bg-white/[0.06]"}`}>{item}</button>)}</div></div></div>
      <div className="mt-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-sm uppercase tracking-[0.18em] text-white/40">Verlauf</p><h2 className="mt-1 text-2xl font-bold text-white">Verdiente Punkte</h2></div><span className="text-sm text-white/35">{filteredServices.length} {filteredServices.length === 1 ? "Dienst" : "Dienste"}</span></div>{filteredServices.length ? <div className="space-y-4">{filteredServices.map((service) => <Link key={service.id} href={`/services/${service.id}`} className="group flex flex-col gap-4 rounded-[26px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl transition hover:border-amber-400/20 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-300"><CheckCircle2 size={20} /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{service.title}</h3><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">Abgeschlossen</span></div><div className="mt-2 flex items-center gap-2 text-sm text-white/45"><CalendarDays size={14} />{service.date} · {service.time}</div></div></div><div className="flex items-center gap-4"><span className="text-lg font-black text-amber-300">+{service.points}</span><ArrowUpRight size={18} className="text-white/20 group-hover:text-amber-300" /></div></Link>)}</div> : <EmptyPoints />}</div>
      <div className="mt-10 rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl"><div className="flex items-start gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45"><Trophy size={20} /></div><div className="min-w-0 flex-1"><p className="text-sm uppercase tracking-[0.18em] text-white/35">Rangliste</p><h2 className="mt-1 text-xl font-bold text-white">MGB Rangliste</h2>{rankingLoading ? <p className="mt-5 text-sm text-white/35">Rangliste wird geladen...</p> : ranking.length ? <div className="mt-5 space-y-2">{ranking.map((member, index) => <div key={member.id} className={`flex items-center gap-4 rounded-2xl border p-4 ${member.id === user?.id ? "border-amber-400/20 bg-amber-400/[0.07]" : "border-white/[0.07] bg-black/[0.06]"}`}><span className="w-8 text-center text-sm font-black text-white/35">#{index + 1}</span><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-white/40"><Trophy size={16} /></div><p className="flex-1 font-semibold text-white">{member.name}{member.id === user?.id ? <span className="ml-2 text-xs font-normal text-amber-300">Du</span> : null}</p><span className="font-bold text-amber-300">{member.points} Pkt.</span></div>)}</div> : <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/40">Noch keine Punktedaten vorhanden.</div>}</div></div></div>
      <div className="mt-10 grid gap-4 md:grid-cols-2"><Link href="/services" className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-amber-400/20 hover:bg-white/[0.06]"><div className="flex items-center justify-between"><div><p className="font-semibold text-white">Meine Dienste</p><p className="mt-1 text-sm text-white/45">Dienste und Punktwerte anzeigen</p></div><ArrowUpRight size={19} className="text-white/25 group-hover:text-amber-300" /></div></Link><Link href="/exchange" className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-amber-400/20 hover:bg-white/[0.06]"><div className="flex items-center justify-between"><div><p className="font-semibold text-white">Tauschbörse</p><p className="mt-1 text-sm text-white/45">Offene Dienste übernehmen</p></div><ArrowUpRight size={19} className="text-white/25 group-hover:text-amber-300" /></div></Link></div>
    </section></main>;
}
function StatBox({ icon, value, label }: { icon: ReactNode; value: number; label: string }) { return <div className="min-w-[125px] rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"><div className="flex items-center gap-2 text-white/40">{icon}<span className="text-xs">{label}</span></div><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>; }
function EmptyPoints() { return <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/30"><Trophy size={25} /></div><h3 className="mt-5 text-xl font-bold text-white">Noch keine Punktedaten</h3><p className="mx-auto mt-2 max-w-md text-white/45">Sobald abgeschlossene Dienste mit Punktwerten vorhanden sind, erscheinen sie hier.</p></div>; }
