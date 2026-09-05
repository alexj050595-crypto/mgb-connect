"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  User,
  X,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";
import { useServices } from "@/context/ServiceContext";

export default function LeaderRequestsPage() {
  const { hasPermission } = useRole();

  const {
    services,
    rejectTakeover,
  } = useServices();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * ============================================================
   * BERECHTIGUNG
   * ============================================================
   */

  const canConfirmRequests =
    hasPermission("confirm_requests");

  /*
   * ============================================================
   * ÜBERNAHMEN
   * ============================================================
   *
   * Übernahmen werden automatisch bestätigt.
   *
   * Deshalb erscheinen hier ausschließlich Dienste
   * mit dem Status "taken_over".
   *
   * Die Leitung muss nichts bestätigen.
   * Sie kann eine Übernahme lediglich ablehnen.
   */

  const takeoverRequests = useMemo(
    () =>
      services.filter(
        (service) =>
          service.status === "taken_over"
      ),
    [services]
  );

  /*
   * ============================================================
   * ZUGRIFFSSCHUTZ
   * ============================================================
   */

  if (!canConfirmRequests) {
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
              Du hast keine Berechtigung, Übernahmeanfragen
              zu verwalten.
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
   * RENDER
   * ============================================================
   */

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* TOP OVERLAY */}

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

      {/* NAVIGATION */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* CONTENT */}

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
        {/* BACK */}

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

        {/* HEADER */}

        <div className="mt-8">
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
            Anfragen
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
            Automatisch bestätigte Übernahmen verwalten.
            Eine Bestätigung durch die Leitung ist nicht
            erforderlich.
          </p>
        </div>

        {/* STATUS */}

        <div
          className="
            mt-10
            rounded-3xl
            border
            border-emerald-400/20
            bg-emerald-400/[0.06]
            p-6
            backdrop-blur-2xl
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-400/20
                bg-emerald-400/10
                text-emerald-300
              "
            >
              <CheckCircle2 size={22} />
            </div>

            <div>
              <p className="text-sm text-emerald-300/70">
                Automatisch bestätigt
              </p>

              <p className="mt-1 text-3xl font-black text-white">
                {takeoverRequests.length}
              </p>

              <p className="mt-1 text-sm text-white/45">
                Übernahmen warten nur noch darauf,
                gegebenenfalls von der Leitung abgelehnt
                zu werden.
              </p>
            </div>
          </div>
        </div>

        {/* ANFRAGEN */}

        <div className="mt-8">
          {takeoverRequests.length === 0 ? (
            <EmptyRequests />
          ) : (
            <div className="space-y-5">
              {takeoverRequests.map((service) => (
                <RequestCard
                  key={service.id}
                  service={service}
                  onReject={() =>
                    rejectTakeover(service.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   REQUEST CARD
=============================================================== */

function RequestCard({
  service,
  onReject,
}: {
  service: {
    id: string;
    title: string;
    date: string;
    time: string;
    church: string;
    leader: string;
    meeting: string;
    points: number;
    takenBy?: string;
  };
  onReject: () => void;
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-emerald-400/15
        bg-white/[0.045]
        backdrop-blur-2xl
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-5
          border-b
          border-white/10
          p-6
          md:flex-row
          md:items-start
          md:justify-between
        "
      >
        <div>
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
                border-emerald-400/20
                bg-emerald-400/10
                text-emerald-300
              "
            >
              <CheckCircle2 size={20} />
            </div>

            <div>
              <p className="text-sm text-emerald-300/70">
                Automatisch übernommen
              </p>

              <h2 className="text-xl font-bold text-white">
                {service.title}
              </h2>
            </div>
          </div>
        </div>

        <div
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-emerald-400/20
            bg-emerald-400/10
            px-3
            py-1.5
            text-xs
            font-semibold
            text-emerald-300
          "
        >
          <CheckCircle2 size={14} />
          Automatisch bestätigt
        </div>
      </div>

      {/* HINWEIS */}

      <div
        className="
          mx-6
          mt-6
          rounded-2xl
          border
          border-emerald-400/15
          bg-emerald-400/[0.05]
          p-4
        "
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-emerald-300"
          />

          <div>
            <p className="font-semibold text-emerald-300">
              Keine Bestätigung erforderlich
            </p>

            <p className="mt-1 text-sm leading-6 text-white/45">
              Diese Übernahme wurde automatisch bestätigt.
              Die Leitung muss nichts weiter bestätigen und
              kann die Übernahme nur noch ablehnen.
            </p>
          </div>
        </div>
      </div>

      {/* DETAILS */}

      <div className="grid gap-4 p-6 md:grid-cols-2">
        <RequestDetail
          icon={CalendarDays}
          label="Datum"
          value={service.date}
        />

        <RequestDetail
          icon={Clock3}
          label="Uhrzeit"
          value={service.time}
        />

        <RequestDetail
          icon={User}
          label="Bisherige Leitung"
          value={service.leader}
        />

        <RequestDetail
          icon={Clock3}
          label="Treffpunkt"
          value={service.meeting}
        />

        <RequestDetail
          icon={CheckCircle2}
          label="Punkte"
          value={`${service.points} Punkte`}
        />
      </div>

      {/* ÜBERNEHMER */}

      <div
        className="
          mx-6
          rounded-2xl
          border
          border-emerald-400/15
          bg-emerald-400/[0.04]
          p-4
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
              border-emerald-400/15
              bg-emerald-400/10
              text-emerald-300
            "
          >
            <User size={18} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-white/35">
              Übernahme durch
            </p>

            <p className="mt-1 font-semibold text-white">
              {service.takenBy || "Unbekannter Messdiener"}
            </p>
          </div>
        </div>
      </div>

      {/* ACTION */}

      <div
        className="
          flex
          flex-col
          gap-3
          p-6
          sm:flex-row
          sm:justify-end
        "
      >
        <button
          type="button"
          onClick={onReject}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/[0.06]
            px-5
            py-3
            text-sm
            font-semibold
            text-red-300
            transition
            hover:border-red-400/30
            hover:bg-red-400/[0.10]
          "
        >
          <X size={17} />
          Übernahme ablehnen
        </button>
      </div>
    </div>
  );
}

/* ===============================================================
   DETAIL
=============================================================== */

function RequestDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/10
        bg-white/[0.025]
        px-4
        py-3
      "
    >
      <Icon
        size={17}
        className="shrink-0 text-white/30"
      />

      <div className="min-w-0">
        <p className="text-xs text-white/30">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-white/75">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ===============================================================
   EMPTY
=============================================================== */

function EmptyRequests() {
  return (
    <div
      className="
        rounded-3xl
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
          border-emerald-400/15
          bg-emerald-400/10
          text-emerald-300
        "
      >
        <CheckCircle2 size={26} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        Keine offenen Übernahmen
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
        Aktuell gibt es keine automatisch bestätigten
        Übernahmen, die von der Leitung verwaltet werden
        müssen.
      </p>

      <Link
        href="/leader/services"
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
        Zur Dienstübersicht
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}