"use client";

import {
  CalendarDays,
  Landmark,
  Trophy,
  ChevronRight,
} from "lucide-react";

const events = [
  {
    title: "Gruppenstunde",
    time: "Heute • 19:00 Uhr",
    icon: CalendarDays,
    highlight: true,
  },
  {
    title: "Dienst in St. Gereon",
    time: "Samstag • 18:00 Uhr",
    icon: Landmark,
    highlight: false,
  },
  {
    title: "Punktestand aktualisiert",
    time: "Sonntag • Rangliste",
    icon: Trophy,
    highlight: false,
  },
];

export default function WeeklyAgenda() {
  return (
    <section className="mt-10 rounded-[30px] border border-white/10 bg-white/[0.045] p-7 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/40">
            Agenda
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Diese Woche
          </h2>
        </div>

        <button className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10">
          Alle anzeigen
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-7 space-y-3">
        {events.map((event) => {
          const Icon = event.icon;

          return (
            <div
              key={event.title}
              className={`group flex items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-200 ${
                event.highlight
                  ? "border-amber-400/20 bg-amber-400/10"
                  : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    event.highlight
                      ? "border border-amber-400/20 bg-amber-400/15 text-amber-300"
                      : "border border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {event.title}
                  </p>
                  <p className="text-sm text-white/50">
                    {event.time}
                  </p>
                </div>
              </div>

              <ChevronRight
                size={18}
                className="text-white/30 transition group-hover:translate-x-1 group-hover:text-white/60"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}