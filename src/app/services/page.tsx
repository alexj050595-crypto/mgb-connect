"use client";

import { useMemo, useState } from "react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import ServiceListItem from "@/components/services/ServiceListItem";
import { useServices } from "@/context/ServiceContext";

export default function ServicesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { services } = useServices();

  const upcomingServices = useMemo(() => {
    return services.filter(
      (service) => service.status !== "completed"
    );
  }, [services]);

  const nextService = upcomingServices[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* Globales Top-Overlay */}
      <div
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          z-30
          h-32
          bg-gradient-to-b
          from-[#050505]
          via-[#050505]/92
          to-transparent
        "
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <section
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          pb-10
          pt-36
        "
      >
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.22em] text-amber-300/80">
            Meine Dienste
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            Deine eingeteilten Dienste
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-white/60">
            Alle kommenden und vergangenen Dienste auf einen
            Blick. Du bist standardmäßig für deine eingeteilten
            Dienste eingeplant und wirst nur dann aktiv, wenn
            du dich abmelden oder einen Dienst freigeben
            möchtest.
          </p>
        </div>

        {/* Nächster Dienst */}
        {nextService && (
          <div
            className="
              mb-8
              rounded-[30px]
              border
              border-amber-400/20
              bg-amber-400/10
              p-6
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-amber-300/80">
                  Nächster Dienst
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {nextService.title}
                </h2>

                <p className="mt-2 text-white/70">
                  {nextService.date} • {nextService.time}
                </p>

                <p className="mt-1 text-white/60">
                  Treffen {nextService.meeting}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-center">
                <p className="text-sm text-white/50">
                  Status
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {getStatusLabel(nextService.status)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dienstliste */}
        <div className="space-y-5">
          {services.map((service) => (
            <ServiceListItem
              key={service.id}
              id={service.id}
              date={service.date}
              time={service.time}
              title={service.title}
              status={service.status}
            />
          ))}

          {services.length === 0 && (
            <div
              className="
                rounded-[28px]
                border
                border-white/10
                bg-white/[0.045]
                p-10
                text-center
                backdrop-blur-2xl
              "
            >
              <h3 className="text-2xl font-bold text-white">
                Keine Dienste vorhanden
              </h3>

              <p className="mt-2 text-white/60">
                Aktuell wurden dir keine Dienste zugewiesen.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function getStatusLabel(
  status:
    | "scheduled"
    | "exchange_requested"
    | "taken_over"
    | "excused"
    | "completed"
) {
  switch (status) {
    case "scheduled":
      return "Eingeplant";

    case "exchange_requested":
      return "Vertretung gesucht";

    case "taken_over":
      return "Übernommen";

    case "excused":
      return "Abgemeldet";

    case "completed":
      return "Abgeschlossen";

    default:
      return "Unbekannt";
  }
}