"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Trophy,
  RefreshCcw,
  CircleCheck,
  AlertCircle,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import ExcuseDialog from "@/components/services/ExcuseDialog";
import ExchangeDialog from "@/components/services/ExchangeDialog";

import { useServices } from "@/context/ServiceContext";
import type {
  ServiceStatus,
  ExcuseReason,
} from "@/data/services";

type ServicePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ServiceDetailPage({
  params,
}: ServicePageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [excuseOpen, setExcuseOpen] = useState(false);
  const [exchangeOpen, setExchangeOpen] = useState(false);

  const {
    getService,
    requestExchange,
    excuseService,
  } = useServices();

  const { id } = React.use(params);

  const service = getService(id);

  if (!service) {
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
            max-w-4xl
            px-6
            pb-10
            pt-36
          "
        >
          <Link
            href="/services"
            className="
              mb-8
              inline-flex
              items-center
              gap-2
              text-white/60
              transition
              hover:text-white
            "
          >
            <ArrowLeft size={18} />
            Zurück zu Meine Dienste
          </Link>

          <div
            className="
              rounded-[30px]
              border
              border-white/10
              bg-white/[0.05]
              p-8
              text-center
              backdrop-blur-2xl
            "
          >
            <AlertCircle
              size={42}
              className="mx-auto text-amber-300"
            />

            <h1 className="mt-5 text-3xl font-black text-white">
              Dienst nicht gefunden
            </h1>

            <p className="mt-3 text-white/60">
              Dieser Dienst existiert nicht oder ist nicht mehr
              verfügbar.
            </p>

            <Link
              href="/services"
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
                font-semibold
                text-white
                transition
                hover:border-amber-400/20
                hover:bg-amber-400/10
                hover:text-amber-200
              "
            >
              <ArrowLeft size={18} />
              Zu meinen Diensten
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  const status = service.status;

  const isScheduled = status === "scheduled";

  const isExchangeRequested =
    status === "exchange_requested";

  const isTakenOver =
    status === "taken_over";

  const isExcused = status === "excused";

  const isCompleted = status === "completed";

  /*
   * ============================================================
   * AKTIONEN
   * ============================================================
   */

  const handleExcuseConfirm = (
    reason: ExcuseReason
  ) => {
    excuseService(service.id, reason);
    setExcuseOpen(false);
  };

  const handleExchangeConfirm = () => {
    requestExchange(service.id);
    setExchangeOpen(false);
  };

  const statusDescription =
    getStatusDescription(status);

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
          max-w-4xl
          px-6
          pb-10
          pt-36
        "
      >
        <Link
          href="/services"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            text-white/60
            transition
            hover:text-white
          "
        >
          <ArrowLeft size={18} />
          Zurück zu Meine Dienste
        </Link>

        <div
          className="
            rounded-[30px]
            border
            border-white/10
            bg-white/[0.05]
            p-8
            backdrop-blur-2xl
          "
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p
                className="
                  text-sm
                  uppercase
                  tracking-[0.22em]
                  text-amber-300/80
                "
              >
                Dienst
              </p>

              <StatusBadge status={status} />
            </div>

            <h1
              className="
                mt-3
                text-5xl
                font-black
                tracking-tight
                text-white
              "
            >
              {service.title}
            </h1>

            <p className="mt-3 text-lg leading-7 text-white/60">
              {statusDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <InfoRow
              icon={<CalendarDays size={20} />}
              label="Datum"
              value={service.date}
            />

            <InfoRow
              icon={<Clock size={20} />}
              label="Uhrzeit"
              value={service.time}
            />

            <InfoRow
              icon={<User size={20} />}
              label="Leiter"
              value={service.leader}
            />

            <InfoRow
              icon={<Clock size={20} />}
              label="Treffpunkt"
              value={service.meeting}
            />

            <InfoRow
              icon={<Trophy size={20} />}
              label="Punkte"
              value={`${service.points} Punkte`}
            />
          </div>

          <StatusPanel
            status={status}
            excuseReason={service.excuseReason}
            takenBy={service.takenBy}
          />

          <div className="mt-10">
            {isScheduled && (
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setExcuseOpen(true)}
                  className="
                    rounded-2xl
                    border
                    border-red-400/20
                    bg-red-400/10
                    px-5
                    py-4
                    text-left
                    transition
                    hover:border-red-400/30
                    hover:bg-red-400/15
                  "
                >
                  <p
                    className="
                      text-sm
                      uppercase
                      tracking-[0.18em]
                      text-red-300
                    "
                  >
                    Ausnahme
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-white">
                    Abmelden
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Melde dich von diesem Dienst ab, wenn du
                    verhindert bist.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setExchangeOpen(true)}
                  className="
                    rounded-2xl
                    border
                    border-amber-400/20
                    bg-amber-400/10
                    px-5
                    py-4
                    text-left
                    transition
                    hover:border-amber-400/30
                    hover:bg-amber-400/15
                  "
                >
                  <div className="flex items-center gap-2 text-amber-300">
                    <RefreshCcw size={18} />

                    <p
                      className="
                        text-sm
                        uppercase
                        tracking-[0.18em]
                      "
                    >
                      Tauschbörse
                    </p>
                  </div>

                  <h3 className="mt-1 text-xl font-bold text-white">
                    Tausch anfragen
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Gib deinen Dienst frei, damit ein anderer
                    Messdiener ihn übernehmen kann.
                  </p>
                </button>
              </div>
            )}

            {isExchangeRequested && (
              <ExchangeRequestedPanel />
            )}

            {isTakenOver && (
              <TakenOverPanel
                takenBy={service.takenBy}
              />
            )}

            {isExcused && (
              <ExcusedPanel
                excuseReason={service.excuseReason}
              />
            )}

            {isCompleted && <CompletedPanel />}
          </div>
        </div>
      </section>

      <ExcuseDialog
        open={excuseOpen}
        onClose={() => setExcuseOpen(false)}
        onConfirm={handleExcuseConfirm}
      />

      <ExchangeDialog
        open={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        onConfirm={handleExchangeConfirm}
      />
    </main>
  );
}

function getStatusDescription(
  status: ServiceStatus
): string {
  switch (status) {
    case "scheduled":
      return "Du bist für diesen Dienst regulär eingeplant.";

    case "exchange_requested":
      return "Für diesen Dienst wird aktuell eine Vertretung gesucht.";

    case "taken_over":
      return "Die Übernahme dieses Dienstes wurde durch die Leitung bestätigt.";

    case "excused":
      return "Du bist für diesen Dienst aktuell abgemeldet.";

    case "completed":
      return "Dieser Dienst wurde bereits abgeschlossen.";

    default:
      return "";
  }
}

function StatusBadge({
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
      label: "Übernahme bestätigt",
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
      text: "text-white/60",
      label: "Abgeschlossen",
    },
  };

  const current = config[status];

  return (
    <span
      className={`
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${current.wrapper}
        ${current.text}
      `}
    >
      {current.label}
    </span>
  );
}

function InfoRow({
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
        bg-white/[0.03]
        p-4
      "
    >
      <div className="flex items-center gap-3">
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
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-white/50">
            {label}
          </p>

          <p className="truncate font-semibold text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusPanel({
  status,
  excuseReason,
  takenBy,
}: {
  status: ServiceStatus;
  excuseReason?: ExcuseReason;
  takenBy?: string;
}) {
  const config: Record<
    ServiceStatus,
    {
      title: string;
      text: string;
      container: string;
      accent: string;
    }
  > = {
    scheduled: {
      title: "Eingeplant",
      text:
        "Du bist regulär für diesen Dienst eingeplant. Wenn du verhindert bist, kannst du dich abmelden oder den Dienst für die Tauschbörse freigeben.",
      container:
        "border-emerald-400/20 bg-emerald-400/10",
      accent: "text-emerald-300",
    },

    exchange_requested: {
      title: "Vertretung gesucht",
      text:
        "Dieser Dienst wurde für die Tauschbörse freigegeben. Andere Messdiener können ihn jetzt unabhängig von einem eigenen Tausch übernehmen.",
      container:
        "border-amber-400/20 bg-amber-400/10",
      accent: "text-amber-300",
    },

    taken_over: {
      title: "Übernahme bestätigt",
      text:
        "Die Leitung hat die Übernahme dieses Dienstes bestätigt. Der Dienst wird jetzt von der angegebenen Person übernommen.",
      container:
        "border-violet-400/20 bg-violet-400/10",
      accent: "text-violet-300",
    },

    excused: {
      title: "Abgemeldet",
      text:
        "Du hast dich von diesem Dienst abgemeldet. Die Leitung kann nun eine Vertretung organisieren.",
      container:
        "border-red-400/20 bg-red-400/10",
      accent: "text-red-300",
    },

    completed: {
      title: "Abgeschlossen",
      text:
        "Dieser Dienst wurde bereits abgeschlossen und befindet sich in deinem vergangenen Dienstverlauf.",
      container:
        "border-white/10 bg-white/[0.04]",
      accent: "text-white/60",
    },
  };

  const current = config[status];

  return (
    <div
      className={`
        mt-10
        rounded-2xl
        border
        p-5
        ${current.container}
      `}
    >
      <p
        className={`
          text-sm
          uppercase
          tracking-[0.18em]
          ${current.accent}
        `}
      >
        Status
      </p>

      <h3 className="mt-2 text-2xl font-bold text-white">
        {current.title}
      </h3>

      <p className="mt-2 leading-6 text-white/70">
        {current.text}
      </p>

      {status === "excused" && excuseReason && (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-red-400/20
            bg-red-400/[0.08]
            px-4
            py-3
          "
        >
          <p className="text-xs uppercase tracking-[0.16em] text-red-300/70">
            Abmeldegrund
          </p>

          <p className="mt-1 font-semibold text-red-200">
            {excuseReason}
          </p>
        </div>
      )}

      {status === "taken_over" && takenBy && (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-violet-400/20
            bg-violet-400/[0.08]
            px-4
            py-3
          "
        >
          <p className="text-xs uppercase tracking-[0.16em] text-violet-300/70">
            Übernommen von
          </p>

          <p className="mt-1 font-semibold text-violet-100">
            {takenBy}
          </p>
        </div>
      )}
    </div>
  );
}

function ExchangeRequestedPanel() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-amber-400/20
        bg-amber-400/10
        p-5
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
            bg-amber-400/10
            text-amber-300
          "
        >
          <RefreshCcw size={21} />
        </div>

        <div>
          <p
            className="
              text-sm
              uppercase
              tracking-[0.18em]
              text-amber-300
            "
          >
            Tauschbörse
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            Vertretung wird gesucht
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Dein Dienst wurde für andere Messdiener freigegeben.
            Du musst keinen anderen Dienst im Gegenzug übernehmen.
          </p>

          <Link
            href="/exchange"
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-amber-400/20
              bg-amber-400/10
              px-4
              py-2.5
              text-sm
              font-semibold
              text-amber-200
              transition
              hover:bg-amber-400/15
            "
          >
            Tauschbörse öffnen

            <ArrowLeft
              size={16}
              className="rotate-180"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TakenOverPanel({
  takenBy,
}: {
  takenBy?: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-violet-400/20
        bg-violet-400/10
        p-5
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
            bg-violet-400/10
            text-violet-300
          "
        >
          <CircleCheck size={21} />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-violet-300">
            Übernahme bestätigt
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            Der Dienst wurde übernommen
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Die Leitung hat die Übernahme dieses Dienstes
            bestätigt. Damit ist die Vertretung offiziell
            eingetragen.
          </p>

          {takenBy && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-violet-400/20
                bg-violet-400/[0.08]
                px-4
                py-3
              "
            >
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/70">
                Übernommen von
              </p>

              <p className="mt-1 font-semibold text-violet-100">
                {takenBy}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExcusedPanel({
  excuseReason,
}: {
  excuseReason?: ExcuseReason;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-red-400/20
        bg-red-400/10
        p-5
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
            bg-red-400/10
            text-red-300
          "
        >
          <CircleCheck size={21} />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-red-300">
            Abmeldung aktiv
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            Du bist für diesen Dienst abgemeldet
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Dieser Dienst ist nicht mehr als regulär
            eingeplanter Dienst für dich aktiv.
          </p>

          {excuseReason && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-400/20
                bg-red-400/[0.08]
                px-4
                py-3
              "
            >
              <p className="text-xs uppercase tracking-[0.16em] text-red-300/70">
                Grund
              </p>

              <p className="mt-1 font-semibold text-red-200">
                {excuseReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompletedPanel() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.04]
        p-5
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
            bg-white/5
            text-white/60
          "
        >
          <CircleCheck size={21} />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/50">
            Dienst abgeschlossen
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            Dieser Dienst ist vorbei
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Der Dienst wurde abgeschlossen und befindet sich
            in deinem vergangenen Dienstverlauf.
          </p>
        </div>
      </div>
    </div>
  );
}