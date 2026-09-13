"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  Megaphone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import {
  useAnnouncements,
} from "@/context/AnnouncementContext";

import type {
  AnnouncementCategory,
} from "@/data/announcements";

export default function AnnouncementsPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [createOpen, setCreateOpen] =
    useState(false);

  const {
    announcements,
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
  } = useAnnouncements();

  const [title, setTitle] = useState("");
  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState<AnnouncementCategory>(
      "general"
    );

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    createAnnouncement({
      title,
      content,
      category,
    });

    setTitle("");
    setContent("");
    setCategory("general");
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      "Möchtest du diese Ankündigung wirklich löschen?"
    );

    if (!confirmed) {
      return;
    }

    deleteAnnouncement(id);
  };

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
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

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
        {/* ZURÜCK */}

        <Link
          href="/admin"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            text-white/55
            transition
            hover:text-white
          "
        >
          <ArrowLeft size={18} />

          Zur Administration
        </Link>

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-3">
              <Megaphone
                size={20}
                className="text-amber-300"
              />

              <p
                className="
                  text-sm
                  uppercase
                  tracking-[0.22em]
                  text-amber-300/80
                "
              >
                Administration
              </p>
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
              Ankündigungen
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-lg
                leading-7
                text-white/60
              "
            >
              Verwalte wichtige Nachrichten und
              Informationen für die
              Messdienergemeinschaft.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setCreateOpen(true)
            }
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-amber-400/20
              bg-amber-400/10
              px-5
              py-3
              font-semibold
              text-amber-200
              transition
              hover:border-amber-400/30
              hover:bg-amber-400/15
            "
          >
            <Plus size={19} />

            Neue Ankündigung
          </button>
        </div>

        {/* ÜBERSICHT */}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <OverviewCard
            icon={<Megaphone size={20} />}
            label="Gesamt"
            value={announcements.length}
          />

          <OverviewCard
            icon={<Bell size={20} />}
            label="Aktiv"
            value={
              announcements.filter(
                (announcement) =>
                  announcement.active
              ).length
            }
          />

          <OverviewCard
            icon={<X size={20} />}
            label="Inaktiv"
            value={
              announcements.filter(
                (announcement) =>
                  !announcement.active
              ).length
            }
          />
        </div>

        {/* LISTE */}

        <div className="mt-8 space-y-4">
          {announcements.length === 0 ? (
            <EmptyState />
          ) : (
            announcements.map(
              (announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  title={announcement.title}
                  content={
                    announcement.content
                  }
                  category={
                    announcement.category
                  }
                  createdAt={
                    announcement.createdAt
                  }
                  active={
                    announcement.active
                  }
                  onToggle={() =>
                    toggleAnnouncement(
                      announcement.id
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      announcement.id
                    )
                  }
                />
              )
            )
          )}
        </div>
      </section>

      {/* ERSTELLEN */}

      {createOpen && (
        <CreateAnnouncementDialog
          title={title}
          content={content}
          category={category}
          onTitleChange={setTitle}
          onContentChange={setContent}
          onCategoryChange={setCategory}
          onClose={() =>
            setCreateOpen(false)
          }
          onCreate={handleCreate}
        />
      )}
    </main>
  );
}

/* ============================================================
   OVERVIEW CARD
============================================================ */

function OverviewCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.045]
        p-5
        backdrop-blur-2xl
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
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

        <p className="text-sm text-white/50">
          {label}
        </p>
      </div>

      <p className="mt-4 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   ANNOUNCEMENT CARD
============================================================ */

function AnnouncementCard({
  title,
  content,
  category,
  createdAt,
  active,
  onToggle,
  onDelete,
}: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  createdAt: string;
  active: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.045]
        p-6
        backdrop-blur-2xl
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              category={category}
            />

            <StatusBadge active={active} />

            <span className="text-xs text-white/30">
              {formatDate(createdAt)}
            </span>
          </div>

          <h2
            className="
              mt-3
              text-2xl
              font-bold
              text-white
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-2
              max-w-3xl
              leading-7
              text-white/60
            "
          >
            {content}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onToggle}
            title={
              active
                ? "Deaktivieren"
                : "Aktivieren"
            }
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              transition
              ${
                active
                  ? `
                    border-emerald-400/20
                    bg-emerald-400/10
                    text-emerald-300
                    hover:bg-emerald-400/15
                  `
                  : `
                    border-white/10
                    bg-white/5
                    text-white/50
                    hover:bg-white/10
                    hover:text-white
                  `
              }
            `}
          >
            {active ? (
              <Check size={18} />
            ) : (
              <X size={18} />
            )}
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Löschen"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-red-400/15
              bg-red-400/5
              text-red-300/70
              transition
              hover:border-red-400/25
              hover:bg-red-400/10
              hover:text-red-300
            "
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CATEGORY BADGE
============================================================ */

function CategoryBadge({
  category,
}: {
  category: AnnouncementCategory;
}) {
  const config: Record<
    AnnouncementCategory,
    {
      label: string;
      className: string;
    }
  > = {
    general: {
      label: "Allgemein",
      className:
        "border-white/10 bg-white/5 text-white/60",
    },

    service: {
      label: "Dienst",
      className:
        "border-blue-400/20 bg-blue-400/10 text-blue-300",
    },

    event: {
      label: "Veranstaltung",
      className:
        "border-violet-400/20 bg-violet-400/10 text-violet-300",
    },

    important: {
      label: "Wichtig",
      className:
        "border-red-400/20 bg-red-400/10 text-red-300",
    },
  };

  const current = config[category];

  return (
    <span
      className={`
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${
          active
            ? `
              border-emerald-400/20
              bg-emerald-400/10
              text-emerald-300
            `
            : `
              border-white/10
              bg-white/5
              text-white/40
            `
        }
      `}
    >
      {active ? "Aktiv" : "Inaktiv"}
    </span>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.045]
        px-6
        py-16
        text-center
        backdrop-blur-2xl
      "
    >
      <Megaphone
        size={38}
        className="mx-auto text-white/25"
      />

      <h2 className="mt-4 text-xl font-bold text-white">
        Keine Ankündigungen
      </h2>

      <p className="mt-2 text-white/50">
        Erstelle die erste Ankündigung für
        die Messdienergemeinschaft.
      </p>
    </div>
  );
}

/* ============================================================
   CREATE DIALOG
============================================================ */

function CreateAnnouncementDialog({
  title,
  content,
  category,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onClose,
  onCreate,
}: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (
    value: AnnouncementCategory
  ) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[60]
        flex
        items-center
        justify-center
        bg-black/60
        px-5
        py-8
        backdrop-blur-sm
      "
      onMouseDown={onClose}
    >
      <div
        className="
          w-full
          max-w-2xl
          rounded-[28px]
          border
          border-white/10
          bg-[#101010]
          p-7
          shadow-2xl
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p
              className="
                text-sm
                uppercase
                tracking-[0.18em]
                text-amber-300/80
              "
            >
              Neue Nachricht
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              Ankündigung erstellen
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-2
              text-white/60
              transition
              hover:bg-white/10
              hover:text-white
            "
            aria-label="Dialog schließen"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-7 space-y-5">
          {/* TITEL */}

          <div>
            <label
              htmlFor="announcement-title"
              className="text-sm font-medium text-white/70"
            >
              Titel
            </label>

            <input
              id="announcement-title"
              value={title}
              onChange={(event) =>
                onTitleChange(
                  event.target.value
                )
              }
              placeholder="z. B. Neuer Messdienerplan"
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-white/25
                focus:border-amber-400/30
                focus:bg-white/[0.07]
              "
            />
          </div>

          {/* KATEGORIE */}

          <div>
            <label
              htmlFor="announcement-category"
              className="text-sm font-medium text-white/70"
            >
              Kategorie
            </label>

            <select
              id="announcement-category"
              value={category}
              onChange={(event) =>
                onCategoryChange(
                  event.target
                    .value as AnnouncementCategory
                )
              }
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#151515]
                px-4
                py-3
                text-white
                outline-none
                focus:border-amber-400/30
              "
            >
              <option value="general">
                Allgemein
              </option>

              <option value="service">
                Dienst
              </option>

              <option value="event">
                Veranstaltung
              </option>

              <option value="important">
                Wichtig
              </option>
            </select>
          </div>

          {/* TEXT */}

          <div>
            <label
              htmlFor="announcement-content"
              className="text-sm font-medium text-white/70"
            >
              Nachricht
            </label>

            <textarea
              id="announcement-content"
              value={content}
              onChange={(event) =>
                onContentChange(
                  event.target.value
                )
              }
              placeholder="Was möchtest du der MGB mitteilen?"
              rows={6}
              className="
                mt-2
                w-full
                resize-none
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                py-3
                text-white
                outline-none
                placeholder:text-white/25
                focus:border-amber-400/30
                focus:bg-white/[0.07]
              "
            />
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-5
              py-3
              font-semibold
              text-white/70
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={onCreate}
            disabled={
              !title.trim() ||
              !content.trim()
            }
            className="
              rounded-xl
              border
              border-amber-400/20
              bg-amber-400/10
              px-5
              py-3
              font-semibold
              text-amber-200
              transition
              hover:bg-amber-400/15
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Ankündigung veröffentlichen
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DATUM
============================================================ */

function formatDate(
  value: string
) {
  const date = new Date(
    `${value}T00:00:00`
  );

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}