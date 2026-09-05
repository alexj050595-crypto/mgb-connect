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

import {
  CalendarDays,
  Clock,
  MapPin,
  RefreshCcw,
} from "lucide-react";

import { useServices } from "@/context/ServiceContext";
import type { ServiceStatus } from "@/data/services";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { services } = useServices();

  /*
   * ============================================================
   * NÄCHSTER RELEVANTER DIENST
   * ============================================================
   *
   * Nur Dienste, für die der aktuelle Messdiener weiterhin
   * verantwortlich ist, werden hier berücksichtigt.
   *
   * Nicht berücksichtigt werden:
   * - excused
   * - taken_over
   * - completed
   *
   * Die echte Datums-Sortierung bauen wir später ein,
   * sobald wir die Datumsdaten strukturiert behandeln.
   */

  const nextService = useMemo(() => {
    return services.find(
      (service) =>
        service.status === "scheduled" ||
        service.status === "exchange_requested" ||
        service.status === "taken_over"
    );
  }, [services]);

  /*
   * ============================================================
   * OFFENE DIENSTE
   * ============================================================
   */

  const openExchangeCount = useMemo(() => {
    return services.filter(
      (service) => service.status === "exchange_requested"
    ).length;
  }, [services]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* ========================================================
          GLOBALES TOP-OVERLAY
      ======================================================== */}

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

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ========================================================
          TOPBAR
      ======================================================== */}

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* ========================================================
          CONTENT
      ======================================================== */}

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
        {/* ======================================================
            BEGRÜSSUNG
        ====================================================== */}

        <div className="mb-10">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.22em]
              text-amber-300/80
            "
          >
            Dashboard
          </p>

          <h1
            className="
              mt-2
              text-5xl
              font-black
              tracking-tight
              text-white
            "
          >
            Guten Tag, Tim 👋
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-lg
              leading-8
              text-white/60
            "
          >
            Willkommen zurück bei MGB Connect. Alle wichtigen
            Informationen der MGB auf einen Blick.
          </p>
        </div>

        {/* ======================================================
            DASHBOARD-KARTEN
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            xl:grid-cols-4
          "
        >
          {/* ====================================================
              NÄCHSTER DIENST

              WICHTIG:
              ServiceCard besitzt seinen eigenen Link.
              Deshalb KEIN Link darum herum.
          ==================================================== */}

          <ServiceCard />

          {/* ====================================================
              PUNKTE
          ==================================================== */}

          <PointsCard />

          {/* ====================================================
              TAUSCHBÖRSE

              ExchangeCard besitzt ebenfalls seinen eigenen Link.
              Deshalb KEIN Link darum herum.
          ==================================================== */}

          <ExchangeCard />

          {/* ====================================================
              NEWS
          ==================================================== */}

          <NewsCard />
        </div>

        {/* ======================================================
            DIREKTER STATUSBEREICH
        ====================================================== */}

        {nextService && (
          <Link
            href={`/services/${nextService.id}`}
            className="
              group
              mt-10
              block
              rounded-[30px]
              border
              border-amber-400/20
              bg-amber-400/10
              p-6
              backdrop-blur-2xl
              transition
              hover:border-amber-400/30
              hover:bg-amber-400/[0.13]
              focus:outline-none
              focus:ring-2
              focus:ring-amber-300/40
            "
          >
            <div
              className="
                flex
                min-h-[180px]
                flex-col
                gap-5
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              {/* ==================================================
                  DIENSTINFORMATIONEN
              ================================================== */}

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p
                    className="
                      text-sm
                      uppercase
                      tracking-[0.18em]
                      text-amber-300/80
                    "
                  >
                    Nächster Dienst
                  </p>

                  <span
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/5
                      px-3
                      py-1
                      text-xs
                      text-white/50
                      transition
                      group-hover:border-amber-400/20
                      group-hover:text-amber-300
                    "
                  >
                    Öffnen
                  </span>
                </div>

                <h2
                  className="
                    mt-2
                    text-3xl
                    font-black
                    text-white
                  "
                >
                  {nextService.title}
                </h2>

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-x-5
                    gap-y-2
                    text-sm
                    text-white/65
                  "
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    <span>{nextService.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{nextService.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{nextService.church}</span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-white/50">
                  Treffen {nextService.meeting}
                </p>
              </div>

              {/* ==================================================
                  STATUS
              ================================================== */}

              <DashboardServiceStatus
                status={nextService.status}
              />
            </div>
          </Link>
        )}

        {/* ======================================================
            WOCHENÜBERSICHT
        ====================================================== */}

        <div
          className="
            mt-10
            rounded-3xl
            border
            border-white/10
            bg-white/[0.045]
            p-6
            backdrop-blur-2xl
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p
                className="
                  text-sm
                  uppercase
                  tracking-[0.18em]
                  text-white/40
                "
              >
                Zeitplan
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-white
                "
              >
                Diese Woche
              </h2>
            </div>

            <Link
              href="/services"
              className="
                flex
                items-center
                gap-2
                text-sm
                text-white/40
                transition
                hover:text-amber-300
                focus:outline-none
                focus:text-amber-300
              "
            >
              <RefreshCcw size={15} />

              <span>
                {services.length}{" "}
                {services.length === 1
                  ? "Dienst"
                  : "Dienste"}
              </span>
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {/* ==================================================
                NÄCHSTER DIENST
            ================================================== */}

            {nextService ? (
              <Link
                href={`/services/${nextService.id}`}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-5
                  py-4
                  transition
                  hover:border-amber-400/20
                  hover:bg-amber-400/[0.06]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-amber-300/30
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-amber-400/15
                      bg-amber-400/10
                      text-amber-300
                    "
                  >
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {nextService.title}
                    </p>

                    <p className="text-sm text-white/50">
                      {nextService.date} •{" "}
                      {nextService.time}
                    </p>
                  </div>
                </div>

                <span
                  className="
                    text-sm
                    text-white/40
                    transition
                    group-hover:text-amber-300
                  "
                >
                  Öffnen
                </span>
              </Link>
            ) : (
              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-5
                  py-4
                "
              >
                <p className="font-semibold text-white">
                  Keine kommenden Dienste
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Aktuell sind keine weiteren Dienste
                  eingeplant.
                </p>
              </div>
            )}

            {/* ==================================================
                TAUSCHBÖRSE
            ================================================== */}

            {openExchangeCount > 0 && (
              <Link
                href="/exchange"
                className="
                  group
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-amber-400/15
                  bg-amber-400/[0.06]
                  px-5
                  py-4
                  transition
                  hover:border-amber-400/25
                  hover:bg-amber-400/[0.09]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-amber-300/30
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-amber-400/15
                      bg-amber-400/10
                      text-amber-300
                    "
                  >
                    <RefreshCcw size={18} />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      Offene Dienste
                    </p>

                    <p className="text-sm text-white/50">
                      {openExchangeCount}{" "}
                      {openExchangeCount === 1
                        ? "Dienst sucht"
                        : "Dienste suchen"}{" "}
                      eine Vertretung
                    </p>
                  </div>
                </div>

                <span
                  className="
                    text-sm
                    text-amber-300/70
                    transition
                    group-hover:text-amber-300
                  "
                >
                  Tauschbörse
                </span>
              </Link>
            )}

            {/* ==================================================
                PUNKTESYSTEM
            ================================================== */}

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-white/8
                bg-white/[0.03]
                px-5
                py-4
              "
            >
              <div>
                <p className="font-semibold text-white">
                  Punktestand
                </p>

                <p className="text-sm text-white/50">
                  Dein Punktestand wird mit deinen Diensten
                  aktualisiert.
                </p>
              </div>

              <span className="text-sm text-white/40">
                Diese Woche
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            SCHNELLZUGRIFFE
        ====================================================== */}

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/services"
            className="
              group
              rounded-2xl
              border
              border-white/10
              bg-white/[0.045]
              p-5
              backdrop-blur-2xl
              transition
              hover:border-amber-400/20
              hover:bg-white/[0.06]
              focus:outline-none
              focus:ring-2
              focus:ring-amber-300/30
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-amber-400/15
                  bg-amber-400/10
                  text-amber-300
                "
              >
                <CalendarDays size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  Meine Dienste
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Alle deine Dienste anzeigen
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/exchange"
            className="
              group
              rounded-2xl
              border
              border-white/10
              bg-white/[0.045]
              p-5
              backdrop-blur-2xl
              transition
              hover:border-amber-400/20
              hover:bg-white/[0.06]
              focus:outline-none
              focus:ring-2
              focus:ring-amber-300/30
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-amber-400/15
                  bg-amber-400/10
                  text-amber-300
                "
              >
                <RefreshCcw size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  Tauschbörse
                </p>

                <p className="mt-1 text-sm text-white/50">
                  Offene Dienste übernehmen
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   STATUS DES NÄCHSTEN DIENSTES
=============================================================== */

function DashboardServiceStatus({
  status,
}: {
  status: ServiceStatus;
}) {
  const config: Record<
    ServiceStatus,
    {
      wrapper: string;
      text: string;
      label: string;
    }
  > = {
    scheduled: {
      wrapper:
        "border-emerald-400/20 bg-emerald-400/10",
      text: "text-emerald-300",
      label: "Eingeplant",
    },

    exchange_requested: {
      wrapper:
        "border-amber-400/20 bg-amber-400/10",
      text: "text-amber-300",
      label: "Vertretung gesucht",
    },

    taken_over: {
      wrapper:
        "border-violet-400/20 bg-violet-400/10",
      text: "text-violet-300",
      label: "Übernommen",
    },

    excused: {
      wrapper:
        "border-red-400/20 bg-red-400/10",
      text: "text-red-300",
      label: "Abgemeldet",
    },

    completed: {
      wrapper:
        "border-white/10 bg-white/5",
      text: "text-white/50",
      label: "Abgeschlossen",
    },
  };

  const current = config[status];

  return (
    <div
      className={`
        flex
        min-w-[180px]
        shrink-0
        flex-col
        justify-center
        rounded-2xl
        border
        px-5
        py-4
        text-center
        transition
        group-hover:border-amber-400/25
        ${current.wrapper}
      `}
    >
      <p className={`text-sm ${current.text}`}>
        Status
      </p>

      <p className="mt-1 text-lg font-bold text-white">
        {current.label}
      </p>
    </div>
  );
}