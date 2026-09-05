"use client";

import Link from "next/link";
import {
  Bell,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

export default function NewsCard() {
  /*
   * Vorläufige News-Daten.
   *
   * Sobald wir die News-Seite aufbauen, verschieben wir
   * diese Daten in eine zentrale data/news.ts.
   */
  const latestNews = {
    title: "Neue Informationen für die Messdiener",
    date: "Diese Woche",
    description:
      "Hier findest du aktuelle Informationen und wichtige Hinweise der Leitung.",
  };

  return (
    <Link
      href="/news"
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
        hover:bg-white/[0.06]
      "
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-amber-300/80">
            Neuigkeiten
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Aktuelle Infos
          </h2>
        </div>

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
            transition
            group-hover:bg-amber-400/15
          "
        >
          <Bell size={19} />
        </div>
      </div>

      {/* =========================================================
          AKTUELLE NEWS
      ========================================================= */}

      <div className="mt-7">
        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.035]
            p-5
          "
        >
          <div className="flex items-center gap-2 text-sm text-white/40">
            <CalendarDays size={15} />

            <span>{latestNews.date}</span>
          </div>

          <h3 className="mt-3 text-lg font-bold leading-7 text-white">
            {latestNews.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/50">
            {latestNews.description}
          </p>
        </div>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/45">
            Alle Neuigkeiten öffnen
          </span>

          <ArrowRight
            size={18}
            className="
              text-white/30
              transition
              group-hover:translate-x-1
              group-hover:text-white/70
            "
          />
        </div>
      </div>
    </Link>
  );
}