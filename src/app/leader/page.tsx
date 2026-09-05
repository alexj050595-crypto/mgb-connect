"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";
import { useServices } from "@/context/ServiceContext";

export default function LeaderDashboard() {
  const {
    hasPermission,
    isLeader,
    isPlanner,
    isAdmin,
  } = useRole();

  const { services } = useServices();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  /*
   * ============================================================
   * BERECHTIGUNGEN
   * ============================================================
   */

  const canViewLeaderArea =
    hasPermission("view_leader_area");

  const canViewMembers =
    hasPermission("view_team");

  const canViewStatistics =
    hasPermission("view_statistics");

  const canConfirmRequests =
    hasPermission("confirm_requests");

  /*
   * ============================================================
   * ÜBERNOMMENE DIENSTE
   * ============================================================
   *
   * Übernahmen werden automatisch bestätigt:
   *
   * exchange_requested
   *        ↓
   * taken_over
   *
   * Dienste mit diesem Status können weiterhin
   * von der Leitung eingesehen und bei Bedarf
   * abgelehnt werden.
   */

  const takeoverRequests = useMemo(() => {
    return services.filter(
      (service) =>
        service.status === "taken_over"
    );
  }, [services]);

  /*
   * ============================================================
   * ZUGRIFFSSCHUTZ
   * ============================================================
   */

  if (
    !canViewLeaderArea ||
    (!isLeader && !isPlanner && !isAdmin)
  ) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Background />

        <section
          className="
            relative
            z-10
            flex
            min-h-screen
            items-center
            justify-center
            px-6
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              border
              border-white/10
              bg-white/[0.045]
              p-8
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
                border-red-400/20
                bg-red-400/10
                text-red-300
              "
            >
              <AlertCircle size={26} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-white">
              Kein Zugriff
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Dieser Bereich steht nur der Leitung zur Verfügung.
            </p>

            <Link
              href="/"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-2xl
                border
                border-white/10
                bg-white/5
                px-5
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-white/10
                hover:text-amber-300
              "
            >
              Zum Dashboard

              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
          NAVIGATION
      ======================================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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
          pb-12
          pt-36
        "
      >
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
            Leiterbereich
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
            Zentrale Anlaufstelle für die wichtigsten
            Leitungsfunktionen.
          </p>
        </div>

        {/* ======================================================
            ÜBERNOMMENE DIENSTE
        ====================================================== */}

        {canConfirmRequests && (
          <Link
            href="/leader/requests"
            className="
              group
              mb-8
              block
              rounded-3xl
              border
              border-amber-400/20
              bg-amber-400/[0.055]
              p-6
              backdrop-blur-2xl
              transition
              hover:border-amber-400/35
              hover:bg-amber-400/[0.08]
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div className="flex items-center gap-5">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-amber-400/20
                    bg-amber-400/10
                    text-amber-300
                  "
                >
                  <CheckCircle2 size={24} />
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
                    Überblick
                  </p>

                  <h2
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-white
                    "
                  >
                    Übernommene Dienste
                  </h2>

                  <p className="mt-1 text-sm text-white/45">
                    {takeoverRequests.length === 0
                      ? "Aktuell wurden keine Dienste übernommen."
                      : `${takeoverRequests.length} ${
                          takeoverRequests.length === 1
                            ? "Dienst wurde übernommen."
                            : "Dienste wurden übernommen."
                        }`}
                  </p>
                </div>
              </div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-white/50
                  transition
                  group-hover:text-amber-300
                "
              >
                Übernahmen öffnen

                <ArrowRight size={17} />
              </div>
            </div>
          </Link>
        )}

        {/* ======================================================
            HAUPTNAVIGATION
        ====================================================== */}

        <div>
          <div className="mb-5">
            <p
              className="
                text-sm
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Schnellzugriff
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-bold
                text-white
              "
            >
              Leitungsfunktionen
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* ==================================================
                MESSDIENERPLAN
            ================================================== */}

            <LeaderAction
              href="/leader/schedule"
              icon={FileText}
              title="Aktueller Messdienerplan"
              description="Den aktuell gültigen Messdienerplan direkt öffnen."
            />

            {/* ==================================================
                MESSDIENER
            ================================================== */}

            {canViewMembers && (
              <LeaderAction
                href="/leader/team"
                icon={Users}
                title="Messdiener"
                description="Mitglieder und ihre relevanten Dienste einsehen."
              />
            )}

            {/* ==================================================
                DIENSTVERWALTUNG
            ================================================== */}

            <LeaderAction
              href="/leader/services"
              icon={ClipboardList}
              title="Dienstverwaltung"
              description="Dienste und laufende Vorgänge zentral verwalten."
            />

            {/* ==================================================
                STATISTIKEN
            ================================================== */}

            {canViewStatistics && (
              <LeaderAction
                href="/leader/statistics"
                icon={BarChart3}
                title="Statistiken"
                description="Dienste und Punkte auswerten."
              />
            )}
          </div>
        </div>

        {/* ======================================================
            PLAN-HINWEIS
        ====================================================== */}

        <div
          className="
            mt-8
            rounded-3xl
            border
            border-white/10
            bg-white/[0.035]
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
                bg-white/5
                text-white/60
              "
            >
              <CalendarDays size={20} />
            </div>

            <div>
              <p className="font-semibold text-white">
                Messdienerplan
              </p>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/45">
                Der aktuelle Plan bleibt die zentrale Übersicht
                über die kommenden Dienste. Einzelne Dienste,
                Tauschanfragen und Übernahmen werden separat über
                die entsprechenden Bereiche verwaltet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   ACTION CARD
=============================================================== */

function LeaderAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof CalendarDays;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-3xl
        border
        border-white/10
        bg-white/[0.045]
        p-6
        backdrop-blur-2xl
        transition
        hover:border-amber-400/20
        hover:bg-white/[0.06]
      "
    >
      <div className="flex items-center gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-amber-400/15
            bg-amber-400/10
            text-amber-300
          "
        >
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">
            {title}
          </p>

          <p className="mt-1 text-sm leading-6 text-white/45">
            {description}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="
            shrink-0
            text-white/20
            transition
            group-hover:text-amber-300
          "
        />
      </div>
    </Link>
  );
}