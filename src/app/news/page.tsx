"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Megaphone,
  PartyPopper,
  Info,
  TriangleAlert,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useAnnouncements } from "@/context/AnnouncementContext";

const categoryConfig = {
  general: {
    label: "Allgemein",
    icon: Info,
    className:
      "border-white/10 bg-white/[0.04] text-white/70",
  },
  service: {
    label: "Dienst",
    icon: Megaphone,
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  event: {
    label: "Veranstaltung",
    icon: PartyPopper,
    className:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
  },
  important: {
    label: "Wichtig",
    icon: TriangleAlert,
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
  },
} as const;

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function NewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeAnnouncements } = useAnnouncements();

  const sortedAnnouncements = useMemo(() => {
    return [...activeAnnouncements].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
  }, [activeAnnouncements]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* ========================================================
          GLOBALES TOP-OVERLAY
      ======================================================== */}

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

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ========================================================
          TOPBAR
      ======================================================== */}

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* ========================================================
          CONTENT
      ======================================================== */}

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
        {/* ======================================================
            ZURÜCK
        ====================================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              text-white/50
              transition
              hover:text-white
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </button>
        </div>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-10">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
              <Megaphone className="h-7 w-7 text-amber-300" />
            </div>

            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-[0.18em] text-amber-300/80">
                MGB Connect
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                News
              </h1>

              <p className="mt-2 max-w-2xl text-white/55">
                Aktuelle Informationen, Termine und wichtige
                Ankündigungen für die Messdienergemeinschaft.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            NEWS
        ====================================================== */}

        {sortedAnnouncements.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-10 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Megaphone className="h-6 w-6 text-white/40" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              Keine aktuellen News
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
              Momentan gibt es keine veröffentlichten
              Ankündigungen.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {sortedAnnouncements.map((announcement) => {
              const category =
                categoryConfig[announcement.category];

              const CategoryIcon = category.icon;

              return (
                <article
                  key={announcement.id}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${category.className}`}
                        >
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {category.label}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold tracking-tight text-white">
                        {announcement.title}
                      </h2>

                      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/60">
                        {announcement.content}
                      </p>
                    </div>

                    <ChevronRight className="hidden h-5 w-5 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-white/40 sm:block" />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
