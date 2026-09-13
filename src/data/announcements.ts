/* ============================================================
   ANKÜNDIGUNGEN
============================================================ */

export type AnnouncementCategory =
  | "general"
  | "service"
  | "event"
  | "important";

export type Announcement = {
  id: string;

  title: string;

  content: string;

  category: AnnouncementCategory;

  createdAt: string;

  active: boolean;
};

/* ============================================================
   STARTDATEN
============================================================ */

export const initialAnnouncements: Announcement[] = [
  {
    id: "announcement-1",

    title: "Willkommen bei MGB Connect",

    content:
      "Über MGB Connect kannst du deine Dienste einsehen, Vertretungen finden und wichtige Informationen der Leitung erhalten.",

    category: "general",

    createdAt: "2026-09-08",

    active: true,
  },

  {
    id: "announcement-2",

    title: "Messdienerplan verfügbar",

    content:
      "Der aktuelle Messdienerplan wurde veröffentlicht. Bitte überprüft eure eingetragenen Dienste.",

    category: "service",

    createdAt: "2026-09-07",

    active: true,
  },

  {
    id: "announcement-3",

    title: "Leiterrunde",

    content:
      "Die nächste Leiterrunde findet in Kürze statt.",

    category: "important",

    createdAt: "2026-09-05",

    active: false,
  },
];