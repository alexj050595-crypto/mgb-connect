"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import PointsCard from "@/components/dashboard/PointsCard";
import ServiceCard from "@/components/dashboard/ServiceCard";
import ExchangeCard from "@/components/dashboard/ExchangeCard";
import NewsCard from "@/components/dashboard/NewsCard";

import { CalendarDays, Clock, RefreshCcw } from "lucide-react";

import { useServices } from "@/context/ServiceContext";
import { useAuth } from "@/context/AuthContext";
import type { ServiceStatus } from "@/data/services";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { services, myServices } = useServices();
  const { profile, user } = useAuth();

  const displayName =
    profile?.display_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Messdiener";

  const nextService = useMemo(() => {
    return [...myServices]
      .filter(
        (service) =>
          service.status !== "completed" && service.status !== "excused"
      )
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0];
  }, [myServices]);

  const openExchangeCount = useMemo(
    () => services.filter((service) => service.status === "exchange_requested").length,
    [services]
  );

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:pt-36">
        <div className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300/80 sm:text-sm">Dashboard</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            Guten Tag, {displayName} 👋
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
            Willkommen zurück bei MGB Connect. Alle wichtigen Informationen auf einen Blick.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          <ServiceCard />
          <PointsCard />
          <ExchangeCard />
          <NewsCard />
        </div>

        {nextService && (
          <Link
            href={`/services/${nextService.id}`}
            className="group mt-6 block rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 backdrop-blur-2xl transition hover:border-amber-400/30 hover:bg-amber-400/[0.13] focus:outline-none focus:ring-2 focus:ring-amber-300/40 sm:mt-10 sm:rounded-[30px] sm:p-6"
          >
            <div className="flex min-h-[150px] flex-col gap-5 md:min-h-[180px] md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80 sm:text-sm">Nächster Dienst</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50 transition group-hover:border-amber-400/20 group-hover:text-amber-300">Öffnen</span>
                </div>
                <h2 className="mt-2 truncate text-2xl font-black text-white sm:text-3xl">{nextService.title}</h2>
                <div className="mt-3 flex flex-col gap-2 text-sm text-white/65 sm:flex-row sm:flex-wrap sm:gap-x-5">
                  <div className="flex items-center gap-2"><CalendarDays size={16} /><span>{nextService.date}</span></div>
                  <div className="flex items-center gap-2"><Clock size={16} /><span>{nextService.time}</span></div>
                </div>
                <p className="mt-3 text-sm text-white/50">Treffen {nextService.meeting}</p>
              </div>
              <DashboardServiceStatus status={nextService.status} />
            </div>
          </Link>
        )}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl sm:mt-10 sm:rounded-3xl sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-white/40 sm:text-sm">Zeitplan</p>
              <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">Meine Dienste</h2>
            </div>
            <Link href="/services" className="flex shrink-0 items-center gap-2 text-xs text-white/40 transition hover:text-amber-300 sm:text-sm">
              <RefreshCcw size={15} />
              <span>{myServices.length} {myServices.length === 1 ? "Dienst" : "Dienste"}</span>
            </Link>
          </div>

          <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
            {nextService ? (
              <Link href={`/services/${nextService.id}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-amber-400/20 hover:bg-amber-400/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-300/30 sm:px-5">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300"><CalendarDays size={18} /></div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{nextService.title}</p>
                    <p className="truncate text-sm text-white/50">{nextService.date} • {nextService.time}</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm text-white/40 transition group-hover:text-amber-300">Öffnen</span>
              </Link>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5">
                <p className="font-semibold text-white">Keine kommenden Dienste</p>
                <p className="mt-1 text-sm text-white/50">Aktuell bist du für keinen weiteren Dienst eingeteilt.</p>
              </div>
            )}

            {openExchangeCount > 0 && (
              <Link href="/exchange" className="group flex items-center justify-between gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-4 transition hover:border-amber-400/25 hover:bg-amber-400/[0.09] focus:outline-none focus:ring-2 focus:ring-amber-300/30 sm:px-5">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300"><RefreshCcw size={18} /></div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">Offene Dienste</p>
                    <p className="text-sm text-white/50">{openExchangeCount} {openExchangeCount === 1 ? "Dienst sucht" : "Dienste suchen"} eine Vertretung</p>
                  </div>
                </div>
                <span className="shrink-0 text-sm text-amber-300/70 transition group-hover:text-amber-300">Tauschbörse</span>
              </Link>
            )}

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5">
              <div className="min-w-0"><p className="font-semibold text-white">Punktestand</p><p className="text-sm text-white/50">Dein Punktestand wird mit deinen Diensten aktualisiert.</p></div>
              <span className="shrink-0 text-sm text-white/40">Persönlich</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2">
          <Link href="/services" className="group rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl transition hover:border-amber-400/20 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-300/30 sm:p-5">
            <div className="flex items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300"><CalendarDays size={20} /></div><div><p className="font-semibold text-white">Meine Dienste</p><p className="mt-1 text-sm text-white/50">Alle deine Dienste anzeigen</p></div></div>
          </Link>
          <Link href="/exchange" className="group rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl transition hover:border-amber-400/20 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-300/30 sm:p-5">
            <div className="flex items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300"><RefreshCcw size={20} /></div><div><p className="font-semibold text-white">Tauschbörse</p><p className="mt-1 text-sm text-white/50">Offene Dienste übernehmen</p></div></div>
          </Link>
        </div>
      </section>
    </main>
  );
}

function DashboardServiceStatus({ status }: { status: ServiceStatus }) {
  const config: Record<ServiceStatus, { wrapper: string; text: string; label: string }> = {
    scheduled: { wrapper: "border-emerald-400/20 bg-emerald-400/10", text: "text-emerald-300", label: "Eingeplant" },
    exchange_requested: { wrapper: "border-amber-400/20 bg-amber-400/10", text: "text-amber-300", label: "Vertretung gesucht" },
    taken_over: { wrapper: "border-violet-400/20 bg-violet-400/10", text: "text-violet-300", label: "Übernommen" },
    excused: { wrapper: "border-red-400/20 bg-red-400/10", text: "text-red-300", label: "Abgemeldet" },
    completed: { wrapper: "border-white/10 bg-white/5", text: "text-white/50", label: "Abgeschlossen" },
  };
  const current = config[status];
  return <div className={`flex min-w-0 shrink-0 flex-col justify-center rounded-2xl border px-4 py-3 text-center transition group-hover:border-amber-400/25 sm:min-w-[180px] sm:px-5 sm:py-4 ${current.wrapper}`}><p className={`text-sm ${current.text}`}>Status</p><p className="mt-1 text-base font-bold text-white sm:text-lg">{current.label}</p></div>;
}
