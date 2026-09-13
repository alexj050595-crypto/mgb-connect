"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  initialAnnouncements,
  type Announcement,
  type AnnouncementCategory,
} from "@/data/announcements";

/* ============================================================
   TYPES
============================================================ */

type CreateAnnouncementInput = {
  title: string;

  content: string;

  category: AnnouncementCategory;
};

type AnnouncementContextType = {
  announcements: Announcement[];

  activeAnnouncements: Announcement[];

  createAnnouncement: (
    input: CreateAnnouncementInput
  ) => void;

  toggleAnnouncement: (
    id: string
  ) => void;

  deleteAnnouncement: (
    id: string
  ) => void;
};

/* ============================================================
   CONTEXT
============================================================ */

const AnnouncementContext =
  createContext<AnnouncementContextType | null>(
    null
  );

/* ============================================================
   PROVIDER
============================================================ */

export function AnnouncementProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(
      initialAnnouncements
    );

  /*
   * ============================================================
   * AKTIVE ANKÜNDIGUNGEN
   * ============================================================
   */

  const activeAnnouncements = useMemo(() => {
    return announcements.filter(
      (announcement) =>
        announcement.active
    );
  }, [announcements]);

  /*
   * ============================================================
   * ANKÜNDIGUNG ERSTELLEN
   * ============================================================
   */

  const createAnnouncement = (
    input: CreateAnnouncementInput
  ) => {
    const newAnnouncement: Announcement = {
      id:
        typeof crypto !== "undefined" &&
        crypto.randomUUID
          ? crypto.randomUUID()
          : `announcement-${Date.now()}`,

      title: input.title.trim(),

      content: input.content.trim(),

      category: input.category,

      createdAt: new Date()
        .toISOString()
        .slice(0, 10),

      active: true,
    };

    setAnnouncements((current) => [
      newAnnouncement,
      ...current,
    ]);
  };

  /*
   * ============================================================
   * AKTIV / INAKTIV
   * ============================================================
   */

  const toggleAnnouncement = (
    id: string
  ) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === id
          ? {
              ...announcement,

              active:
                !announcement.active,
            }
          : announcement
      )
    );
  };

  /*
   * ============================================================
   * LÖSCHEN
   * ============================================================
   */

  const deleteAnnouncement = (
    id: string
  ) => {
    setAnnouncements((current) =>
      current.filter(
        (announcement) =>
          announcement.id !== id
      )
    );
  };

  /*
   * ============================================================
   * VALUE
   * ============================================================
   */

  const value = useMemo(
    () => ({
      announcements,

      activeAnnouncements,

      createAnnouncement,

      toggleAnnouncement,

      deleteAnnouncement,
    }),
    [
      announcements,
      activeAnnouncements,
    ]
  );

  return (
    <AnnouncementContext.Provider
      value={value}
    >
      {children}
    </AnnouncementContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useAnnouncements() {
  const context =
    useContext(AnnouncementContext);

  if (!context) {
    throw new Error(
      "useAnnouncements must be used inside an AnnouncementProvider"
    );
  }

  return context;
}