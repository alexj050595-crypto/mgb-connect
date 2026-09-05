"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";

import { useServices } from "@/context/ServiceContext";
import type { ServiceStatus } from "@/data/services";

export default function ServiceCard() {
  const { services } = useServices();

  const nextService = services.find(
    (service) => service.status !== "completed"
  );

  if (!nextService) {
    return (
      <div
        className="
          flex
          min-h-[320px]
          h-full
          flex-col
          rounded-[28px]
          border
          border-white/10
          bg-white/[0.045]
          p-6
          backdrop-blur-2xl
        "
      >
        <p className="text-sm uppercase tracking-[0.18em] text-amber-300/80">
          Nächster Dienst
        </p>

        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <CalendarDays
              size={34}
              className="mx-auto text-white/30"
            />

            <p className="mt-4 font-semibold text-white">
              Keine kommenden Dienste
            </p>

            <p className="mt-1 text-sm text-white/45">
              Aktuell bist du für keinen weiteren Dienst eingeteilt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/services/${nextService.id}`}
      className="
        group
        flex
        h-full
        min-h-[320px]
        flex-col
        rounded-[28px]
        border
        border-white/10
        bg-white/[0.045]
        p-6
        backdrop-blur-2xl
        transition-all
        duration-200
        hover:border-amber-400/20
        hover:bg-white/[0.065]
        focus:outline-none
        focus:ring-2
        focus:ring-amber-400/30
      "
    >
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-amber-300/80">
            Nächster Dienst
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {nextService.title}
          </h2>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
          <CalendarDays size={21} />
        </div>
      </div>

      {/* Informationen */}

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <CalendarDays size={17} />
          <span>{nextService.date}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-white/60">
          <Clock size={17} />
          <span>{nextService.time}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-white/60">
          <MapPin size={17} />
          <span>{nextService.church}</span>
        </div>
      </div>

      {/* Status */}

      <div className="mt-6">
        <ServiceStatus status={nextService.status} />
      </div>

      {/* Footer */}

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-sm font-medium text-white/45">
          Dienst ansehen
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-all group-hover:translate-x-1 group-hover:border-amber-400/20 group-hover:bg-amber-400/10 group-hover:text-amber-300">
          <ArrowRight size={17} />
        </div>
      </div>
    </Link>
  );
}

/* ===============================================================
   STATUS
=============================================================== */

function ServiceStatus({
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
        inline-flex
        rounded-xl
        border
        px-4
        py-2
        ${current.wrapper}
      `}
    >
      <span
        className={`text-sm font-semibold ${current.text}`}
      >
        {current.label}
      </span>
    </div>
  );
}