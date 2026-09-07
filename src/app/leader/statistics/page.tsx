"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Trophy,
  Users,
  BarChart3,
  Star,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useServices } from "@/context/ServiceContext";

export default function LeaderStatisticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { services } = useServices();

  /* ============================================================
     STATISTIK
  ============================================================ */

  const totalServices = services.length;

  const completedServices = useMemo(() => {
    return services.filter(
      (service) => service.status === "completed"
    );
  }, [services]);

  const scheduledServices = useMemo(() => {
    return services.filter(
      (service) => service.status === "scheduled"
    );
  }, [services]);

  const exchangeServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.status === "exchange_requested"
    );
  }, [services]);

  const excusedServices = useMemo(() => {
    return services.filter(
      (service) => service.status === "excused"
    );
  }, [services]);

  const totalPoints = useMemo(() => {
    return completedServices.reduce(
      (total, service) => total + service.points,
      0
    );
  }, [completedServices]);

  const averagePoints =
    completedServices.length > 0
      ? Math.round(
          totalPoints / completedServices.length
        )
      : 0;

  const completionRate =
    totalServices > 0
      ? Math.round(
          (completedServices.length / totalServices) *
            100
        )
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* ======================================================
          TOP OVERLAY
      ====================================================== */}

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

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ======================================================
          TOPBAR
      ====================================================== */}

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section
        className="
          relative
          z-10
          mx-auto
          max-w-6xl
          px-6
          pb-12
          pt-36
        "
      >
        {/* ====================================================
            BACK
        ==================================================== */}

        <Link
          href="/leader"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            text-white/55
            transition
            hover:text-white
          "
        >
          <ArrowLeft size={18} />

          <span>
            Zurück zur Leitung
          </span>
        </Link>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-10">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.22em]
              text-amber-300/80
            "
          >
            Leitung
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
            Statistiken
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
            Überblick über Dienste, Abschlüsse,
            Punkte und aktuelle Aktivitäten.
          </p>
        </div>

        {/* ====================================================
            HERO STATISTICS
        ==================================================== */}

        <div
          className="
            rounded-[32px]
            border
            border-amber-400/20
            bg-amber-400/[0.08]
            p-7
            backdrop-blur-2xl
          "
        >
          <div
            className="
              flex
              flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-amber-400/20
                    bg-amber-400/10
                    text-amber-300
                  "
                >
                  <BarChart3 size={23} />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      uppercase
                      tracking-[0.18em]
                      text-amber-300/70
                    "
                  >
                    Gesamtübersicht
                  </p>

                  <p className="text-sm text-white/40">
                    Aktueller Datenstand
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p
                  className="
                    text-6xl
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  {totalServices}
                </p>

                <p className="mt-1 text-white/45">
                  Dienste insgesamt
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatisticBox
                icon={<CheckCircle2 size={18} />}
                value={completedServices.length}
                label="Abgeschlossen"
              />

              <StatisticBox
                icon={<Trophy size={18} />}
                value={totalPoints}
                label="Punkte vergeben"
              />

              <StatisticBox
                icon={<Star size={18} />}
                value={`${completionRate}%`}
                label="Abschlussrate"
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatisticCard
            icon={<CalendarDays size={21} />}
            value={scheduledServices.length}
            label="Eingeplant"
            description="Aktiv geplante Dienste"
          />

          <StatisticCard
            icon={<CheckCircle2 size={21} />}
            value={completedServices.length}
            label="Abgeschlossen"
            description="Bereits erledigte Dienste"
          />

          <StatisticCard
            icon={<Users size={21} />}
            value={exchangeServices.length}
            label="Vertretung gesucht"
            description="Aktuell in der Tauschbörse"
          />

          <StatisticCard
            icon={<Clock size={21} />}
            value={excusedServices.length}
            label="Abgemeldet"
            description="Entschuldigte Dienste"
          />
        </div>

        {/* ====================================================
            POINT STATISTICS
        ==================================================== */}

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div
            className="
              rounded-[30px]
              border
              border-white/10
              bg-white/[0.045]
              p-7
              backdrop-blur-2xl
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-amber-400/15
                  bg-amber-400/10
                  text-amber-300
                "
              >
                <Trophy size={20} />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    uppercase
                    tracking-[0.18em]
                    text-white/40
                  "
                >
                  Punktesystem
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Punkteübersicht
                </h2>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/40">
                  Vergebene Punkte
                </p>

                <p className="mt-2 text-3xl font-black text-white">
                  {totalPoints}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/40">
                  Ø pro Dienst
                </p>

                <p className="mt-2 text-3xl font-black text-amber-300">
                  {averagePoints}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              STATUS OVERVIEW
          ================================================== */}

          <div
            className="
              rounded-[30px]
              border
              border-white/10
              bg-white/[0.045]
              p-7
              backdrop-blur-2xl
            "
          >
            <p
              className="
                text-sm
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Dienststatus
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Aktuelle Verteilung
            </h2>

            <div className="mt-6 space-y-4">
              <StatusRow
                label="Eingeplant"
                value={scheduledServices.length}
              />

              <StatusRow
                label="Abgeschlossen"
                value={completedServices.length}
              />

              <StatusRow
                label="Vertretung gesucht"
                value={exchangeServices.length}
              />

              <StatusRow
                label="Abgemeldet"
                value={excusedServices.length}
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            INFO
        ==================================================== */}

        <div
          className="
            mt-10
            rounded-[30px]
            border
            border-white/10
            bg-white/[0.045]
            p-7
            backdrop-blur-2xl
          "
        >
          <p
            className="
              text-sm
              uppercase
              tracking-[0.18em]
              text-white/40
            "
          >
            Später
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Erweiterte Statistiken
          </h2>

          <p
            className="
              mt-3
              max-w-3xl
              leading-7
              text-white/55
            "
          >
            Sobald die Datenbank und Benutzerverwaltung
            angebunden sind, können hier Statistiken für
            alle Messdiener, einzelne Personen, Zeiträume
            und die gesamte Gruppe angezeigt werden.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   STATISTIC BOX
=============================================================== */

function StatisticBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="
        min-w-[140px]
        rounded-2xl
        border
        border-white/10
        bg-white/[0.04]
        p-5
      "
    >
      <div className="flex items-center gap-2 text-white/40">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

/* ===============================================================
   STATISTIC CARD
=============================================================== */

function StatisticCard({
  icon,
  value,
  label,
  description,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-[26px]
        border
        border-white/10
        bg-white/[0.045]
        p-5
        backdrop-blur-2xl
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-amber-400/15
          bg-amber-400/10
          text-amber-300
        "
      >
        {icon}
      </div>

      <p className="mt-5 text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 font-semibold text-white">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-white/40">
        {description}
      </p>
    </div>
  );
}

/* ===============================================================
   STATUS ROW
=============================================================== */

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-white/10
        bg-white/[0.03]
        px-4
        py-3
      "
    >
      <span className="text-sm text-white/55">
        {label}
      </span>

      <span className="font-bold text-white">
        {value}
      </span>
    </div>
  );
}