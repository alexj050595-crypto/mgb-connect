"use client";

import { CalendarDays, Landmark, Trophy, ChevronRight } from "lucide-react";

const events = [
  { title: "Gruppenstunde", time: "Heute • 19:00 Uhr", icon: CalendarDays, highlight: true },
  { title: "Dienst", time: "Samstag • 18:00 Uhr", icon: Landmark, highlight: false },
  { title: "Punktestand aktualisiert", time: "Sonntag • Rangliste", icon: Trophy, highlight: false },
];

export default function WeeklyAgenda() {
  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl sm:mt-10 sm:rounded-[30px] sm:p-7">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40 sm:text-sm">Agenda</p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Diese Woche</h2>
        </div>

        <button className="flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 sm:text-sm">
          Alle anzeigen
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-5 space-y-3 sm:mt-7">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div
              key={event.title}
              className={`group flex min-w-0 items-center justify-between gap-3 rounded-2xl border px-3 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${event.highlight ? "border-amber-400/20 bg-amber-400/10" : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"}`}
            >
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl ${event.highlight ? "border border-amber-400/20 bg-amber-400/15 text-amber-300" : "border border-white/10 bg-white/5 text-white/70"}`}>
                  <Icon size={19} />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{event.title}</p>
                  <p className="truncate text-xs text-white/50 sm:text-sm">{event.time}</p>
                </div>
              </div>

              <ChevronRight size={18} className="shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-white/60" />
            </div>
          );
        })}
      </div>
    </section>
  );
}