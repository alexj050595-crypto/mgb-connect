"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  initialAnnouncements,
  type Announcement,
  type AnnouncementCategory,
} from "@/data/announcements";

type CreateAnnouncementInput = {
  title: string;
  content: string;
  category: AnnouncementCategory;
};

type AnnouncementContextType = {
  announcements: Announcement[];
  activeAnnouncements: Announcement[];
  createAnnouncement: (input: CreateAnnouncementInput) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
};

const AnnouncementContext = createContext<AnnouncementContextType | null>(null);
const STORAGE_KEY = "mgb-connect-announcements";

export function AnnouncementProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initialAnnouncements
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Announcement[];

      if (Array.isArray(parsed)) {
        setAnnouncements(parsed);
      }
    } catch {
      // Bei ungültigen Demo-Daten bleiben die Startdaten erhalten.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(announcements)
      );
    } catch {
      // LocalStorage ist nur eine optionale Demo-Persistenz.
    }
  }, [announcements]);

  const activeAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => announcement.active);
  }, [announcements]);

  const createAnnouncement = (input: CreateAnnouncementInput) => {
    const title = input.title.trim();
    const content = input.content.trim();

    if (!title || !content) {
      return;
    }

    const newAnnouncement: Announcement = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `announcement-${Date.now()}`,
      title,
      content,
      category: input.category,
      createdAt: new Date().toISOString().slice(0, 10),
      active: true,
    };

    setAnnouncements((current) => [newAnnouncement, ...current]);
  };

  const toggleAnnouncement = (id: string) => {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === id
          ? { ...announcement, active: !announcement.active }
          : announcement
      )
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((current) =>
      current.filter((announcement) => announcement.id !== id)
    );
  };

  const value = useMemo(
    () => ({
      announcements,
      activeAnnouncements,
      createAnnouncement,
      toggleAnnouncement,
      deleteAnnouncement,
    }),
    [announcements, activeAnnouncements]
  );

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);

  if (!context) {
    throw new Error(
      "useAnnouncements must be used inside an AnnouncementProvider"
    );
  }

  return context;
}
