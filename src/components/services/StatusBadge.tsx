"use client";

import type { ServiceStatus } from "@/data/services";

const styles: Record<ServiceStatus, string> = {
  scheduled:
    "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

  exchange_requested:
    "border border-amber-400/20 bg-amber-400/10 text-amber-300",

  taken_over:
    "border border-purple-400/20 bg-purple-400/10 text-purple-300",

  excused:
    "border border-red-400/20 bg-red-400/10 text-red-300",

  completed:
    "border border-white/10 bg-white/10 text-white/70",
};

const labels: Record<ServiceStatus, string> = {
  scheduled: "Eingeplant",

  exchange_requested: "Vertretung gesucht",

  taken_over: "Übernahme bestätigt",

  excused: "Abgemeldet",

  completed: "Abgeschlossen",
};

export default function StatusBadge({
  status,
}: {
  status: ServiceStatus;
}) {
  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${styles[status]}
      `}
    >
      {labels[status]}
    </span>
  );
}