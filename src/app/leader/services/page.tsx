"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";
import { useServices } from "@/context/ServiceContext";

export default function LeaderServicesPage() {
  const { hasPermission, isAdmin } = useRole();
  const { services } = useServices();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * ============================================================
   * BERECHTIGUNGEN
   * ============================================================
   */

  const canViewServiceManagement = hasPermission(
    "view_service_management"
  );

  const canManageSchedule = hasPermission(
    "manage_schedule"
  );

  /*
   * ============================================================
   * DIENSTE
   * ============================================================
   */

  const scheduledServices = useMemo(() => {
    return services.filter(
      (service) => service.status === "scheduled"
    );
  }, [services]);

  const exchangeRequests = useMemo(() => {
    return services.filter(
      (service) =>
        service.status === "exchange_requested"
    );
  }, [services]);

  const completedServices = useMemo(() => {
    return services.filter(
      (service) => service.status === "completed"
    );
  }, [services]);

  /*
   * ============================================================
   * ZUGRIFFSSCHUTZ
   * ============================================================
   */

  if (!canViewServiceManagement) {
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
              Die Dienstverwaltung steht nur der Leitung
              zur Verfügung.
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

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

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

          <div
            className="
              mt-2
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div>
              <h1
                className="
                  text-5xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                Dienstverwaltung
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
                Alle Dienste der Gemeinschaft zentral
                einsehen und offene Vorgänge bearbeiten.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            STATUS ÜBERSICHT
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-3
          "
        >
          <ServiceOverviewCard
            icon={CalendarDays}
            label="Geplante Dienste"
            value={scheduledServices.length}
            description="Aktuell eingeplant"
          />

          <ServiceOverviewCard
            icon={RefreshCcw}
            label="Vertretungssuchen"
            value={exchangeRequests.length}
            description="Benötigen eine Vertretung"
          />

          <ServiceOverviewCard
            icon={CheckCircle2}
            label="Abgeschlossen"
            value={completedServices.length}
            description="Bereits durchgeführt"
          />
        </div>

        {/* ======================================================
            VERTRETUNGSSUCHEN
        ====================================================== */}

        {exchangeRequests.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <p
                className="
                  text-sm
                  uppercase
                  tracking-[0.18em]
                  text-white/40
                "
              >
                Vertretungen
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Offene Vertretungssuchen
              </h2>
            </div>

            <div className="space-y-3">
              {exchangeRequests.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    rounded-3xl
                    border
                    border-white/10
                    bg-white/[0.035]
                    p-5
                    transition
                    hover:border-blue-400/20
                    hover:bg-white/[0.055]
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-blue-400/15
                        bg-blue-400/10
                        text-blue-300
                      "
                    >
                      <RefreshCcw size={19} />
                    </div>

                    <div>
                      <p
                        className="
                          font-semibold
                          text-white
                        "
                      >
                        {service.title}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-white/45
                        "
                      >
                        {service.date} · {service.time}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="
                      text-white/20
                      transition
                      group-hover:text-amber-300
                    "
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================
            ALLE DIENSTE
        ====================================================== */}

        <section className="mt-10">
          <div className="mb-5">
            <p
              className="
                text-sm
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Gesamtübersicht
            </p>

            <h2
              className="
                mt-1
                text-2xl
                font-bold
                text-white
              "
            >
              Alle Dienste
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-white/40
              "
            >
              Jeder Dienst kann geöffnet werden, um
              seine vollständigen Informationen einzusehen.
            </p>
          </div>

          <div className="space-y-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="
                  group
                  flex
                  flex-col
                  gap-4
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.035]
                  p-5
                  transition
                  hover:border-amber-400/20
                  hover:bg-white/[0.055]
                  md:flex-row
                  md:items-center
                  md:justify-between
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
                      border-white/10
                      bg-white/[0.04]
                      text-white/60
                      transition
                      group-hover:border-amber-400/15
                      group-hover:text-amber-300
                    "
                  >
                    <CalendarDays size={19} />
                  </div>

                  <div>
                    <p
                      className="
                        font-semibold
                        text-white
                      "
                    >
                      {service.title}
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-white/45
                      "
                    >
                      {service.date} · {service.time}
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-white/35
                      "
                    >
                      {service.church}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-5
                    md:justify-end
                  "
                >
                  <ServiceStatus
                    status={service.status}
                  />

                  <ArrowRight
                    size={18}
                    className="
                      text-white/20
                      transition
                      group-hover:text-amber-300
                    "
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ======================================================
            ZUSÄTZLICHE FUNKTIONEN
        ====================================================== */}

        {(canManageSchedule || isAdmin) && (
          <section className="mt-12">
            <div className="mb-5">
              <p
                className="
                  text-sm
                  uppercase
                  tracking-[0.18em]
                  text-white/40
                "
              >
                Verwaltung
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Weitere Bereiche
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {canManageSchedule && (
                <ServiceAction
                  href="/leader/schedule"
                  icon={CalendarDays}
                  title="Messdienerplan"
                  description="Dienstplan erstellen und bearbeiten."
                />
              )}

              {isAdmin && (
                <ServiceAction
                  href="/leader/statistics"
                  icon={BarChart3}
                  title="Statistiken"
                  description="Dienste und Punkte auswerten."
                />
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

/* ===============================================================
   ÜBERSICHTSKARTE
=============================================================== */

function ServiceOverviewCard({
  icon: Icon,
  label,
  value,
  description,
  href,
  highlight = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  description: string;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            ${
              highlight
                ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                : "border-white/10 bg-white/[0.04] text-white/60"
            }
          `}
        >
          <Icon size={20} />
        </div>

        {href && (
          <ArrowRight
            size={17}
            className="
              text-white/20
              transition
              group-hover:text-amber-300
            "
          />
        )}
      </div>

      <p className="mt-5 text-sm text-white/45">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-white/40">
        {description}
      </p>

      {href && (
        <p
          className="
            mt-4
            text-xs
            font-medium
            text-amber-300/60
            transition
            group-hover:text-amber-300
          "
        >
          Öffnen →
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="
          group
          block
          rounded-3xl
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
        {content}
      </Link>
    );
  }

  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/[0.045]
        p-5
        backdrop-blur-2xl
      "
    >
      {content}
    </div>
  );
}

/* ===============================================================
   STATUS
=============================================================== */

function ServiceStatus({
  status,
}: {
  status:
    | "scheduled"
    | "exchange_requested"
    | "taken_over"
    | "excused"
    | "completed";
}) {
  const config = {
    scheduled: {
      label: "Geplant",
      className:
        "border-white/10 bg-white/[0.04] text-white/60",
    },

    exchange_requested: {
      label: "Vertretung gesucht",
      className:
        "border-blue-400/15 bg-blue-400/10 text-blue-300",
    },

    taken_over: {
      label: "Übernommen",
      className:
        "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    },

    excused: {
      label: "Abgemeldet",
      className:
        "border-red-400/15 bg-red-400/10 text-red-300",
    },

    completed: {
      label: "Abgeschlossen",
      className:
        "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    },
  };

  const current = config[status];

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-medium
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

/* ===============================================================
   ACTION
=============================================================== */

function ServiceAction({
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
          <Icon size={20} />
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