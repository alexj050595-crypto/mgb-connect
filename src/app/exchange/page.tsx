"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  RefreshCcw,
  User,
  CheckCircle2,
  Inbox,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import TakeoverDialog from "@/components/services/TakeoverDialog";
import { useServices } from "@/context/ServiceContext";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import type { Service } from "@/data/services";

export default function ExchangePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [takeoverOpen, setTakeoverOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const { services, takeService } = useServices();
  const { user } = useAuth();
  const { enabled: demoMode } = useDemoMode();

  const openServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.status === "exchange_requested" &&
        (demoMode || service.assignedTo !== user?.id)
    );
  }, [services, user?.id, demoMode]);

  const handleTakeService = (id: string) => {
    setSelectedServiceId(id);
    setTakeoverOpen(true);
  };

  const handleTakeoverConfirm = async () => {
    if (!selectedServiceId) return;
    await takeService(selectedServiceId);
    setTakeoverOpen(false);
    setSelectedServiceId(null);
  };

  const handleTakeoverClose = () => {
    setTakeoverOpen(false);
    setSelectedServiceId(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-32 bg-gradient-to-b from-[#050505] via-[#050505]/92 to-transparent" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-36">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-white/55 transition hover:text-white">
          <ArrowLeft size={18} />
          <span>Zurück zum Dashboard</span>
        </Link>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">Tauschbörse</p>
          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Offene Dienste</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">
            Hier findest du Dienste, für die aktuell eine Vertretung gesucht wird. Du kannst einen offenen Dienst unabhängig von einem eigenen Tausch übernehmen.
          </p>
        </div>

        <div className="mb-8 rounded-[28px] border border-amber-400/20 bg-amber-400/[0.07] p-6 backdrop-blur-2xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
              <RefreshCcw size={21} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-amber-300/80">So funktioniert es</p>
              <h2 className="mt-1 text-xl font-bold text-white">Einen Dienst übernehmen</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Öffne einen verfügbaren Dienst und wähle „Übernehmen“. Nach deiner Bestätigung wird der Dienst direkt auf dich übertragen. Ein Gegentausch ist nicht erforderlich.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-white/40">Verfügbarkeit</p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              {openServices.length === 0 ? "Keine offenen Dienste" : `${openServices.length} offene ${openServices.length === 1 ? "Dienst" : "Dienste"}`}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/35">
            <Inbox size={16} />
            <span>Direkte Übernahme ohne Gegentausch</span>
          </div>
        </div>

        {openServices.length === 0 ? (
          <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-10 text-center backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-white">Alles erledigt</h3>
            <p className="mx-auto mt-2 max-w-md text-white/50">
              Momentan gibt es keine offenen Dienste, für die eine Vertretung gesucht wird.
            </p>
            <Link href="/services" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-amber-400/20 hover:bg-amber-400/10 hover:text-amber-200">
              Meine Dienste öffnen
              <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {openServices.map((service) => {
              const isOwnDemoRelease = demoMode && service.assignedTo === user?.id;
              return (
                <ExchangeServiceCard
                  key={service.id}
                  service={service}
                  ownDemoRelease={isOwnDemoRelease}
                  onTake={() => handleTakeService(service.id)}
                />
              );
            })}
          </div>
        )}
      </section>

      <TakeoverDialog open={takeoverOpen} onClose={handleTakeoverClose} onConfirm={handleTakeoverConfirm} />
    </main>
  );
}

function ExchangeServiceCard({
  service,
  onTake,
  ownDemoRelease = false,
}: {
  service: Service;
  onTake: () => void;
  ownDemoRelease?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl transition hover:border-amber-400/20 hover:bg-white/[0.06]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
              <CalendarDays size={21} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-amber-300/70">
                {ownDemoRelease ? "Deine Freigabe · Demo" : "Vertretung gesucht"}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-white">{service.title}</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ExchangeInfo icon={<CalendarDays size={17} />} label="Datum" value={service.date} />
            <ExchangeInfo icon={<Clock size={17} />} label="Uhrzeit" value={service.time} />
            <ExchangeInfo icon={<User size={17} />} label="Leiter" value={service.leader || "Nicht angegeben"} />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/45">
            <span>Treffen: {service.meeting}</span>
            <span>{service.points} Punkte</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 lg:w-56">
          {ownDemoRelease ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center font-semibold text-white/45">
              <CheckCircle2 size={18} />
              Freigegeben
            </div>
          ) : (
            <button type="button" onClick={onTake} className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-4 font-semibold text-amber-200 transition hover:border-amber-400/40 hover:bg-amber-400/15 hover:text-amber-100">
              <RefreshCcw size={18} />
              Übernehmen
            </button>
          )}
          <Link href={`/services/${service.id}`} className="rounded-xl px-4 py-2 text-center text-sm text-white/40 transition hover:text-white/70">
            Details anzeigen
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExchangeInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-white/35">{label}</p>
        <p className="truncate text-sm font-medium text-white/75">{value}</p>
      </div>
    </div>
  );
}
