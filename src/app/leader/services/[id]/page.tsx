"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  User,
  XCircle,
  AlertCircle,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";
import { useServices } from "@/context/ServiceContext";

type ServiceDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { isLeader, isPlanner, isAdmin } = useRole();

  const {
    getService,
    rejectTakeover,
  } = useServices();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const service = getService(params.id);

  /*
   * ============================================================
   * ZUGRIFF
   * ============================================================
   */

  const hasAccess =
    isLeader || isPlanner || isAdmin;

  /*
   * ============================================================
   * KEIN ZUGRIFF
   * ============================================================
   */

  if (!hasAccess) {
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
              Du besitzt keine Berechtigung, diesen Bereich
              zu öffnen.
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
   * DIENST NICHT GEFUNDEN
   * ============================================================
   */

  if (!service) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Background />

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
            flex
            min-h-screen
            max-w-4xl
            items-center
            justify-center
            px-6
            pt-20
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
              Dienst nicht gefunden
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Der angeforderte Dienst existiert nicht oder
              wurde entfernt.
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
              <ArrowLeft size={16} />
              Zur Dienstübersicht
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ============================================================
   * ÜBERNAHME ABLEHNEN
   * ============================================================
   */

  const handleReject = () => {
    setProcessing(true);

    rejectTakeover(service.id);

    setTimeout(() => {
      setProcessing(false);
    }, 300);
  };

  /*
   * ============================================================
   * HAUPTSEITE
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

      {/* SIDEBAR */}

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
          max-w-5xl
          px-6
          pb-16
          pt-36
        "
      >
        {/* ZURÜCK */}

        <Link
          href="/leader/services"
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
          <ArrowLeft size={16} />
          Zur Dienstübersicht
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
            Dienstverwaltung
          </p>

          <h1
            className="
              mt-2
              text-4xl
              font-black
              tracking-tight
              text-white
              md:text-5xl
            "
          >
            {service.title}
          </h1>

          <p className="mt-3 text-base text-white/45">
            Detailansicht des Dienstes
          </p>
        </div>

        {/* STATUS */}

        <div
          className="
            mt-8
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-amber-400/15
            bg-amber-400/[0.06]
            px-5
            py-4
          "
        >
          {service.status === "taken_over" ? (
            <>
              <CheckCircle2
                size={20}
                className="text-emerald-300"
              />

              <div>
                <p className="font-semibold text-emerald-300">
                  Übernahme bestätigt
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Dieser Dienst wurde übernommen und kann
                  bei Bedarf noch abgelehnt werden.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle
                size={20}
                className="text-white/40"
              />

              <div>
                <p className="font-semibold text-white/70">
                  Keine offene Übernahme
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Für diesen Dienst ist aktuell keine
                  Übernahme vorhanden.
                </p>
              </div>
            </>
          )}
        </div>

        {/* DETAILS */}

        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-2
          "
        >
          <DetailCard
            icon={CalendarDays}
            label="Datum"
            value={service.date}
          />

          <DetailCard
            icon={Clock3}
            label="Uhrzeit"
            value={service.time}
          />

          <DetailCard
            icon={User}
            label="Leitung"
            value={service.leader}
          />

          <DetailCard
            icon={Clock3}
            label="Treffpunkt"
            value={service.meeting}
          />

          <DetailCard
            icon={CheckCircle2}
            label="Punkte"
            value={`${service.points} Punkte`}
          />
        </div>

        {/* ÜBERNEHMER */}

        {service.takenBy && (
          <div
            className="
              mt-6
              rounded-3xl
              border
              border-white/10
              bg-white/[0.045]
              p-6
              backdrop-blur-2xl
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-[0.18em]
                text-white/30
              "
            >
              Übernahme
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-400/15
                  bg-blue-400/10
                  text-blue-300
                "
              >
                <User size={21} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  {service.takenBy}
                </p>

                <p className="mt-1 text-sm text-white/40">
                  Hat diesen Dienst übernommen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABLEHNEN */}

        {service.status === "taken_over" && (
          <div
            className="
              mt-8
              rounded-3xl
              border
              border-white/10
              bg-white/[0.045]
              p-6
              backdrop-blur-2xl
            "
          >
            <p className="text-lg font-bold text-white">
              Übernahme bearbeiten
            </p>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Die Übernahme wurde automatisch bestätigt.
              Du kannst sie als Leiter oder Planschreiber
              weiterhin ablehnen.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={processing}
                onClick={handleReject}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-red-400/15
                  bg-red-400/[0.06]
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-red-300
                  transition
                  hover:border-red-400/25
                  hover:bg-red-400/10
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <XCircle size={18} />

                {processing
                  ? "Wird verarbeitet..."
                  : "Übernahme ablehnen"}
              </button>
            </div>
          </div>
        )}

        {/* ZURÜCK */}

        <div className="mt-8">
          <Link
            href="/leader/services"
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
            <ArrowLeft size={16} />
            Zurück zur Dienstübersicht
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   DETAIL CARD
=============================================================== */

function DetailCard({
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
        rounded-3xl
        border
        border-white/10
        bg-white/[0.045]
        p-5
        backdrop-blur-2xl
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
          "
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.16em]
              text-white/30
            "
          >
            {label}
          </p>

          <p className="mt-1 text-sm font-medium text-white/80">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}