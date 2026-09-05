"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";
import { services } from "@/data/services";

export default function LeaderSchedulePage() {
  const { hasPermission } = useRole();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * ============================================================
   * BERECHTIGUNG
   * ============================================================
   */

  const canManageSchedule = hasPermission("manage_schedule");

  /*
   * ============================================================
   * DIENSTE SORTIEREN
   * ============================================================
   */

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      return (
        new Date(a.dateISO).getTime() -
        new Date(b.dateISO).getTime()
      );
    });
  }, []);

  /*
   * ============================================================
   * MONATE
   * ============================================================
   */

  const months = useMemo(() => {
    const uniqueMonths = new Map<
      string,
      {
        key: string;
        label: string;
      }
    >();

    const monthNames = [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ];

    for (const service of sortedServices) {
      const monthKey = service.dateISO.slice(0, 7);

      if (!uniqueMonths.has(monthKey)) {
        const [year, month] = monthKey
          .split("-")
          .map(Number);

        uniqueMonths.set(monthKey, {
          key: monthKey,
          label: `${monthNames[month - 1]} ${year}`,
        });
      }
    }

    return Array.from(uniqueMonths.values());
  }, [sortedServices]);

  /*
   * ============================================================
   * DIENSTE FÜR MONAT
   * ============================================================
   */

  const getServicesForMonth = (monthKey: string) => {
    return sortedServices.filter((service) =>
      service.dateISO.startsWith(monthKey)
    );
  };

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  const getStatus = (
    status: (typeof services)[number]["status"]
  ) => {
    switch (status) {
      case "scheduled":
        return {
          label: "Eingeplant",
          className:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        };

      case "exchange_requested":
        return {
          label: "Vertretung gesucht",
          className:
            "border-amber-400/20 bg-amber-400/10 text-amber-300",
        };

      case "taken_over":
        return {
          label: "Übernommen",
          className:
            "border-purple-400/20 bg-purple-400/10 text-purple-300",
        };

      case "excused":
        return {
          label: "Abgemeldet",
          className:
            "border-red-400/20 bg-red-400/10 text-red-300",
        };

      case "completed":
        return {
          label: "Abgeschlossen",
          className:
            "border-white/10 bg-white/5 text-white/50",
        };

      default:
        return {
          label: "Unbekannt",
          className:
            "border-white/10 bg-white/5 text-white/50",
        };
    }
  };

  /*
   * ============================================================
   * ZUGRIFFSSCHUTZ
   * ============================================================
   */

  if (!canManageSchedule) {
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
              Du hast keine Berechtigung, den
              Messdienerplan zu verwalten.
            </p>

            <Link
              href="/leader"
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
              <ArrowLeft size={16} />
              Zum Leiterbereich
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ============================================================
   * HAUPTANSICHT
   * ============================================================
   */

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

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
          pb-16
          pt-36
        "
      >
        <Link
          href="/leader"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-white/40
            transition
            hover:text-amber-300
          "
        >
          <ArrowLeft size={15} />
          Leiterbereich
        </Link>

        <div className="mt-8">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.22em]
              text-amber-300/80
            "
          >
            Planung
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
            Messdienerplan
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
            Alle geplanten Dienste der Gemeinschaft
            chronologisch auf einen Blick.
          </p>
        </div>

        <div
          className="
            mt-10
            grid
            gap-4
            sm:grid-cols-3
          "
        >
          <ScheduleStat
            icon={<CalendarDays size={20} />}
            label="Dienste"
            value={String(sortedServices.length)}
          />

          <ScheduleStat
            icon={<Users size={20} />}
            label="Planstatus"
            value="Aktuell"
          />

          <ScheduleStat
            icon={<CheckCircle2 size={20} />}
            label="Quelle"
            value="MGB Connect"
          />
        </div>

        <div className="mt-10 space-y-10">
          {months.map((month) => {
            const monthServices =
              getServicesForMonth(month.key);

            return (
              <section key={month.key}>
                <div className="mb-4 flex items-center gap-4">
                  <h2
                    className="
                      text-xl
                      font-bold
                      text-white
                    "
                  >
                    {month.label}
                  </h2>

                  <div className="h-px flex-1 bg-white/10" />

                  <span
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/5
                      px-3
                      py-1
                      text-xs
                      text-white/40
                    "
                  >
                    {monthServices.length}{" "}
                    {monthServices.length === 1
                      ? "Dienst"
                      : "Dienste"}
                  </span>
                </div>

                <div className="space-y-3">
                  {monthServices.map((service) => {
                    const status = getStatus(
                      service.status
                    );

                    return (
                      <div
                        key={service.id}
                        className="
                          group
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/[0.045]
                          p-5
                          transition
                          hover:border-white/15
                          hover:bg-white/[0.06]
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            gap-5
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                          "
                        >
                          <div
                            className="
                              flex
                              shrink-0
                              items-center
                              gap-4
                              lg:w-56
                            "
                          >
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
                              <CalendarDays size={21} />
                            </div>

                            <div>
                              <p className="font-semibold text-white">
                                {service.date}
                              </p>

                              <div
                                className="
                                  mt-1
                                  flex
                                  items-center
                                  gap-2
                                  text-sm
                                  text-white/45
                                "
                              >
                                <Clock size={14} />
                                {service.time}
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3
                                className="
                                  text-lg
                                  font-semibold
                                  text-white
                                "
                              >
                                {service.title}
                              </h3>

                              <span
                                className={`
                                  rounded-full
                                  border
                                  px-3
                                  py-1
                                  text-xs
                                  font-semibold
                                  ${status.className}
                                `}
                              >
                                {status.label}
                              </span>
                            </div>

                            <div
                              className="
                                mt-2
                                flex
                                flex-wrap
                                gap-x-5
                                gap-y-2
                                text-sm
                                text-white/50
                              "
                            >
                              <span className="flex items-center gap-2">
                                <Users size={15} />
                                Leiter: {service.leader}
                              </span>
                            </div>
                          </div>

                          <div
                            className="
                              shrink-0
                              rounded-2xl
                              border
                              border-white/10
                              bg-white/5
                              px-5
                              py-3
                              lg:text-right
                            "
                          >
                            <p className="text-xs text-white/35">
                              Punkte
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-lg
                                font-bold
                                text-amber-300
                              "
                            >
                              +{service.points}
                            </p>
                          </div>
                        </div>

                        <div
                          className="
                            mt-4
                            border-t
                            border-white/5
                            pt-4
                            text-sm
                            text-white/35
                          "
                        >
                          Treffen:{" "}
                          <span className="text-white/55">
                            {service.meeting}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {sortedServices.length === 0 && (
          <div
            className="
              mt-10
              rounded-3xl
              border
              border-white/10
              bg-white/[0.045]
              p-10
              text-center
            "
          >
            <CalendarDays
              size={34}
              className="mx-auto text-white/25"
            />

            <h2
              className="
                mt-4
                text-xl
                font-bold
                text-white
              "
            >
              Noch keine Dienste vorhanden
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Sobald Dienste im System hinterlegt sind,
              erscheinen sie hier automatisch.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function ScheduleStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.045]
        p-5
      "
    >
      <div className="flex items-center gap-3">
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

        <div>
          <p className="text-xs text-white/35">
            {label}
          </p>

          <p className="mt-0.5 font-semibold text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}