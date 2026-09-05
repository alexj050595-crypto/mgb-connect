"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Trophy,
  Star,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useServices } from "@/context/ServiceContext";

export default function PointsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { services } = useServices();

  /*
   * ============================================================
   * ABGESCHLOSSENE DIENSTE
   * ============================================================
   *
   * Nur tatsächlich abgeschlossene Dienste zählen für den
   * aktuellen Punktestand.
   *
   * Dienste mit den Status:
   * - scheduled
   * - exchange_requested
   * - taken_over
   * - excused
   *
   * werden hier nicht berücksichtigt.
   */

  const completedServices = useMemo(() => {
    return services.filter(
      (service) => service.status === "completed"
    );
  }, [services]);

  /*
   * ============================================================
   * PUNKTESUMME
   * ============================================================
   *
   * Die Punkte werden direkt aus den abgeschlossenen Diensten
   * berechnet.
   *
   * Dadurch benötigen wir keine zusätzliche getTotalPoints-
   * Funktion im ServiceContext.
   */

  const totalPoints = useMemo(() => {
    return completedServices.reduce(
      (total, service) => total + service.points,
      0
    );
  }, [completedServices]);

  /*
   * ============================================================
   * DURCHSCHNITT
   * ============================================================
   */

  const averagePoints =
    completedServices.length > 0
      ? Math.round(
          totalPoints / completedServices.length
        )
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* ========================================================
          TOP OVERLAY
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
          max-w-6xl
          px-6
          pb-12
          pt-36
        "
      >
        {/* ======================================================
            ZURÜCK
        ====================================================== */}

        <Link
          href="/"
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
            Zurück zum Dashboard
          </span>
        </Link>

        {/* ======================================================
            HEADER
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
            Punktesystem
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
            Dein Punktestand
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
            Hier siehst du deine bisher verdienten Punkte
            und die Dienste, durch die sie entstanden sind.
          </p>
        </div>

        {/* ======================================================
            PUNKTE HERO
        ====================================================== */}

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
              gap-7
              md:flex-row
              md:items-center
              md:justify-between
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
                  <Trophy size={23} />
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
                    Gesamtpunktestand
                  </p>

                  <p className="text-sm text-white/40">
                    Aktueller Stand
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-end gap-3">
                <span
                  className="
                    text-6xl
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  {totalPoints}
                </span>

                <span className="mb-2 text-lg text-white/40">
                  Punkte
                </span>
              </div>
            </div>

            {/* Statistik */}

            <div className="grid grid-cols-2 gap-3">
              <StatBox
                icon={<CheckCircle2 size={18} />}
                value={completedServices.length}
                label="Abgeschlossen"
              />

              <StatBox
                icon={<Star size={18} />}
                value={averagePoints}
                label="Ø Punkte"
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            PUNKTEVERLAUF
        ====================================================== */}

        <div className="mt-10">
          <div
            className="
              mb-5
              flex
              items-end
              justify-between
              gap-4
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
                Verlauf
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Verdiente Punkte
              </h2>
            </div>

            <span className="text-sm text-white/35">
              {completedServices.length}{" "}
              {completedServices.length === 1
                ? "Dienst"
                : "Dienste"}
            </span>
          </div>

          {completedServices.length > 0 ? (
            <div className="space-y-4">
              {completedServices.map((service) => (
                <CompletedService
                  key={service.id}
                  title={service.title}
                  date={service.date}
                  time={service.time}
                  points={service.points}
                  id={service.id}
                />
              ))}
            </div>
          ) : (
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
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  text-white/30
                "
              >
                <Trophy size={25} />
              </div>

              <h3
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-white
                "
              >
                Noch keine Punkte
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-white/45
                "
              >
                Sobald du einen Dienst abgeschlossen hast,
                werden die dafür erhaltenen Punkte hier
                angezeigt.
              </p>
            </div>
          )}
        </div>

        {/* ======================================================
            RANGLISTE
        ====================================================== */}

        <div className="mt-10">
          <div
            className="
              rounded-[30px]
              border
              border-white/10
              bg-white/[0.045]
              p-6
              backdrop-blur-2xl
            "
          >
            <div className="flex items-start gap-4">
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
                  border-white/10
                  bg-white/[0.04]
                  text-white/45
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
                    text-white/35
                  "
                >
                  Rangliste
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  MGB Rangliste
                </h2>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    text-white/50
                  "
                >
                  Die Rangliste wird später mit den
                  Punkteständen aller Messdiener verbunden.
                  Dein aktueller Punktestand ist bereits
                  vorbereitet.
                </p>

                <div
                  className="
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    px-4
                    py-2.5
                    text-sm
                    text-white/40
                  "
                >
                  <span>
                    Rangliste folgt
                  </span>

                  <ArrowUpRight size={15} />
                </div>
              </div>
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
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  Meine Dienste
                </p>

                <p className="mt-1 text-sm text-white/45">
                  Dienste und Punktwerte anzeigen
                </p>
              </div>

              <ArrowUpRight
                size={19}
                className="
                  text-white/25
                  transition
                  group-hover:text-amber-300
                "
              />
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
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  Tauschbörse
                </p>

                <p className="mt-1 text-sm text-white/45">
                  Offene Dienste übernehmen
                </p>
              </div>

              <ArrowUpRight
                size={19}
                className="
                  text-white/25
                  transition
                  group-hover:text-amber-300
                "
              />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   STATISTIK
=============================================================== */

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div
      className="
        min-w-[125px]
        rounded-2xl
        border
        border-white/10
        bg-white/[0.04]
        px-5
        py-4
      "
    >
      <div className="flex items-center gap-2 text-white/40">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

/* ===============================================================
   ABGESCHLOSSENER DIENST
=============================================================== */

function CompletedService({
  id,
  title,
  date,
  time,
  points,
}: {
  id: string;
  title: string;
  date: string;
  time: string;
  points: number;
}) {
  return (
    <Link
      href={`/services/${id}`}
      className="
        group
        flex
        flex-col
        gap-5
        rounded-[26px]
        border
        border-white/10
        bg-white/[0.045]
        p-5
        backdrop-blur-2xl
        transition
        hover:border-amber-400/20
        hover:bg-white/[0.06]
        sm:flex-row
        sm:items-center
        sm:justify-between
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
            border-emerald-400/15
            bg-emerald-400/10
            text-emerald-300
          "
        >
          <CheckCircle2 size={20} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">
              {title}
            </h3>

            <span
              className="
                rounded-full
                border
                border-emerald-400/20
                bg-emerald-400/10
                px-2.5
                py-1
                text-xs
                font-semibold
                text-emerald-300
              "
            >
              Abgeschlossen
            </span>
          </div>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-1
              text-sm
              text-white/45
            "
          >
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />

              {date}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock size={14} />

              {time}
            </span>
          </div>
        </div>
      </div>

      <div
        className="
          flex
          items-center
          gap-3
          sm:justify-end
        "
      >
        <div className="text-right">
          <p className="text-xs text-white/35">
            Verdient
          </p>

          <p
            className="
              text-xl
              font-black
              text-amber-300
            "
          >
            +{points}
          </p>
        </div>

        <ArrowUpRight
          size={18}
          className="
            text-white/25
            transition
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:text-amber-300
          "
        />
      </div>
    </Link>
  );
}