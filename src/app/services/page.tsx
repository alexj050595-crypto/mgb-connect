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

  const sortedServices = useMemo(
    () =>
      [...myServices].sort(
        (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
      ),
    [myServices]
  );

  const upcomingServices = useMemo(() => {
    const now = Date.now();
    return sortedServices.filter(
      (service) =>
        service.status !== "completed" &&
        new Date(service.dateISO).getTime() >= now
    );
  }, [sortedServices]);

  const pastServices = useMemo(() => {
    const now = Date.now();
    return sortedServices
      .filter(
        (service) =>
          service.status === "completed" ||
          new Date(service.dateISO).getTime() < now
      )
      .sort(
        (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
      );
  }, [sortedServices]);

  const nextService = upcomingServices[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-36">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Meine Dienste</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Deine eingeteilten Dienste</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Alle deine kommenden und vergangenen Dienste auf einen Blick.
          </p>
        </div>

        {nextService && (
          <div className="mb-8 rounded-[30px] border border-amber-400/20 bg-amber-400/10 p-6 backdrop-blur-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-amber-300/80">Nächster Dienst</p>
                <h2 className="mt-2 text-3xl font-black text-white">{nextService.title}</h2>
                <p className="mt-2 text-white/70">{nextService.date} • {nextService.time}</p>
                <p className="mt-1 text-white/60">Treffen {nextService.meeting}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-center">
                <p className="text-sm text-white/50">Status</p>
                <p className="mt-1 text-lg font-bold text-white">{getStatusLabel(nextService.status)}</p>
              </div>
            </div>
          </div>
        )}

        {upcomingServices.length > 0 && (
          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">Kommende Dienste</h2>
              <p className="mt-1 text-white/50">Chronologisch nach dem nächsten Einsatz sortiert.</p>
            </div>
            <div className="space-y-5">
              {upcomingServices.map((service) => (
                <ServiceListItem key={service.id} id={service.id} date={service.date} time={service.time} title={service.title} status={service.status} />
              ))}
            </div>
          </section>
        )}

        {pastServices.length > 0 && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">Vergangene Dienste</h2>
              <p className="mt-1 text-white/50">Die zuletzt vergangenen Dienste stehen oben.</p>
            </div>
            <div className="space-y-5">
              {pastServices.map((service) => (
                <ServiceListItem key={service.id} id={service.id} date={service.date} time={service.time} title={service.title} status={service.status} />
              ))}
            </div>
          </section>
        )}

        {myServices.length === 0 && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-10 text-center backdrop-blur-2xl">
            <h3 className="text-2xl font-bold text-white">Keine Dienste vorhanden</h3>
            <p className="mt-2 text-white/60">Aktuell wurden dir keine Dienste zugewiesen.</p>
          </div>
        )}
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
