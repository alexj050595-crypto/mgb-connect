"use client";

import { useMemo, useState } from "react";
import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import ServiceListItem from "@/components/services/ServiceListItem";
import { useServices } from "@/context/ServiceContext";

export default function ServicesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { myServices } = useServices();
  const sortedServices = useMemo(() => [...myServices].sort((a, b) => a.dateISO.localeCompare(b.dateISO)), [myServices]);
  const upcomingServices = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    return sortedServices.filter((service) => service.status !== "completed" && new Date(service.dateISO).getTime() >= todayTime);
  }, [sortedServices]);
  const pastServices = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    return sortedServices.filter((service) => service.status === "completed" || new Date(service.dateISO).getTime() < todayTime).sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [sortedServices]);
  const nextService = upcomingServices[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 sm:pt-36">
        <div className="mb-8 sm:mb-10"><p className="text-xs uppercase tracking-[0.22em] text-amber-300/80 sm:text-sm">Meine Dienste</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">Deine eingeteilten Dienste</h1><p className="mt-3 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">Alle deine kommenden und vergangenen Dienste auf einen Blick.</p></div>
        {nextService && <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 backdrop-blur-2xl sm:mb-8 sm:rounded-[30px] sm:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><p className="text-xs uppercase tracking-[0.18em] text-amber-300/80 sm:text-sm">Nächster Dienst</p><h2 className="mt-2 truncate text-2xl font-black text-white sm:text-3xl">{nextService.title}</h2><p className="mt-2 text-sm text-white/70 sm:text-base">{nextService.date} • {nextService.time}</p><p className="mt-1 text-sm text-white/60">Treffen {nextService.meeting}</p></div><div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-center sm:py-4"><p className="text-sm text-white/50">Status</p><p className="mt-1 text-base font-bold text-white sm:text-lg">{getStatusLabel(nextService.status)}</p></div></div></div>}
        {upcomingServices.length > 0 && <section className="mb-8 sm:mb-10"><div className="mb-4 sm:mb-5"><h2 className="text-xl font-bold text-white sm:text-2xl">Kommende Dienste</h2><p className="mt-1 text-sm text-white/50 sm:text-base">Chronologisch nach dem nächsten Einsatz sortiert.</p></div><div className="space-y-3 sm:space-y-5">{upcomingServices.map((service) => <ServiceListItem key={service.id} id={service.id} date={service.date} time={service.time} title={service.title} status={service.status} />)}</div></section>}
        {pastServices.length > 0 && <section><div className="mb-4 sm:mb-5"><h2 className="text-xl font-bold text-white sm:text-2xl">Vergangene Dienste</h2><p className="mt-1 text-sm text-white/50 sm:text-base">Die zuletzt vergangenen Dienste stehen oben.</p></div><div className="space-y-3 sm:space-y-5">{pastServices.map((service) => <ServiceListItem key={service.id} id={service.id} date={service.date} time={service.time} title={service.title} status={service.status} />)}</div></section>}
        {myServices.length === 0 && <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-8 text-center backdrop-blur-2xl sm:rounded-[28px] sm:p-10"><h3 className="text-xl font-bold text-white sm:text-2xl">Keine Dienste vorhanden</h3><p className="mt-2 text-sm text-white/60 sm:text-base">Aktuell wurden dir keine Dienste zugewiesen.</p></div>}
      </section>
    </main>
  );
}

function getStatusLabel(status: "scheduled" | "exchange_requested" | "taken_over" | "excused" | "completed") {
  switch (status) {
    case "scheduled": return "Eingeplant";
    case "exchange_requested": return "Vertretung gesucht";
    case "taken_over": return "Übernommen";
    case "excused": return "Abgemeldet";
    case "completed": return "Abgeschlossen";
    default: return "Unbekannt";
  }
}
