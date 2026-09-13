"use client";

import Link from "next/link";
import {
  Bell,
  ArrowRight,
  CalendarDays,
  Info,
  Megaphone,
  PartyPopper,
  TriangleAlert,
} from "lucide-react";

import { useAnnouncements } from "@/context/AnnouncementContext";

const categoryConfig = {
  general: {
    label: "Allgemein",
    icon: Info,
  },
  service: {
    label: "Dienst",
    icon: Megaphone,
  },
  event: {
    label: "Veranstaltung",
    icon: PartyPopper,
  },
  important: {
    label: "Wichtig",
    icon: TriangleAlert,
  },
} as const;

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function NewsCard() {
  const { activeAnnouncements } = useAnnouncements();

  const latestNews = [...activeAnnouncements]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 2);

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
          NEWS
      ========================================================= */}

      <div className="mt-7 space-y-3">
        {latestNews.length === 0 ? (
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
              <Bell size={15} />

              <span>Keine aktuellen News</span>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Momentan gibt es keine veröffentlichten
              Ankündigungen.
            </p>
          </div>
        ) : (
          latestNews.map((announcement) => {
            const category =
              categoryConfig[announcement.category];

            const CategoryIcon = category.icon;

            return (
              <div
                key={announcement.id}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.035]
                  p-4
                  transition
                  group-hover:border-white/15
                "
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <CategoryIcon
                      size={14}
                      className="shrink-0 text-amber-300/80"
                    />

                    <span className="truncate text-xs font-medium text-amber-300/80">
                      {category.label}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 text-xs text-white/30">
                    <CalendarDays size={13} />

                    <span>
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                </div>

                <h3 className="mt-3 line-clamp-1 text-base font-bold text-white">
                  {announcement.title}
                </h3>

                <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/45">
                  {announcement.content}
                </p>
              </div>
            );
          })
        )}
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