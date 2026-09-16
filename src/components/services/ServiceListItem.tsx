"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import type { ServiceStatus } from "@/data/services";

type ServiceListItemProps = { id: string; date: string; time: string; title: string; status: ServiceStatus };

export default function ServiceListItem({ id, date, time, title, status }: ServiceListItemProps) {
  return (
    <Link href={`/services/${id}`} className="group block rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl transition hover:border-amber-400/20 hover:bg-white/[0.06] sm:rounded-[28px] sm:p-5">
      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300 sm:h-12 sm:w-12 sm:rounded-2xl"><CalendarDays size={20} /></div>
          <div className="min-w-0"><h3 className="truncate text-base font-bold text-white transition group-hover:text-amber-200 sm:text-lg">{title}</h3><div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45 sm:gap-x-3 sm:text-sm"><span>{date}</span><span className="text-white/20">·</span><span className="inline-flex items-center gap-1.5"><Clock size={14} />{time}</span></div></div>
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end"><StatusBadge status={status} /><ArrowRight size={19} className="shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-amber-300" /></div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config: Record<ServiceStatus, { label: string; className: string }> = {
    scheduled: { label: "Eingeplant", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
    exchange_requested: { label: "Vertretung gesucht", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
    taken_over: { label: "Übernommen", className: "border-violet-400/20 bg-violet-400/10 text-violet-300" },
    excused: { label: "Nicht mehr eingeplant", className: "border-red-400/20 bg-red-400/10 text-red-300" },
    completed: { label: "Abgeschlossen", className: "border-white/10 bg-white/5 text-white/60" },
  };
  const current = config[status];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${current.className}`}>{current.label}</span>;
}
