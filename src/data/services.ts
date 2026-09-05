export type ServiceStatus =
  | "scheduled"
  | "exchange_requested"
  | "taken_over"
  | "excused"
  | "completed";

export type ExcuseReason =
  | "Krankheit"
  | "Schule"
  | "Familie"
  | "Urlaub"
  | "Sonstiges";

export type Service = {
  id: string;
  title: string;

  /**
   * Strukturierter Datumswert.
   * Wird für Sortierung und spätere Zeitberechnungen verwendet.
   */
  dateISO: string;

  /**
   * Formatiertes Datum für die Anzeige.
   */
  date: string;

  /**
   * Uhrzeit des Dienstes.
   */
  time: string;

  /**
   * Interner Ortswert.
   *
   * Wird aktuell nicht in der Benutzeroberfläche angezeigt.
   */
  church: string;

  /**
   * Allgemeiner Standort.
   *
   * Bleibt vorerst im Datenmodell bestehen, damit bestehende
   * Komponenten nicht unnötig verändert werden.
   */
  location: string;

  /**
   * Verantwortlicher Leiter.
   */
  leader: string;

  /**
   * Treffpunkt / Treffzeit.
   */
  meeting: string;

  /**
   * Punkte für den Dienst.
   */
  points: number;

  /**
   * Aktueller Status des Dienstes.
   */
  status: ServiceStatus;

  /**
   * Wer den Dienst übernehmen möchte bzw. übernommen hat.
   */
  takenBy?: string;

  /**
   * Grund für eine Abmeldung.
   */
  excuseReason?: ExcuseReason;
};

export const services: Service[] = [
  {
    id: "hochamt-15-08",
    title: "Hochamt",

    dateISO: "2026-08-15",
    date: "Samstag, 15. August 2026",

    time: "18:00 Uhr",

    church: "St. Dionysius",
    location: "St. Dionysius",

    leader: "Max Mustermann",

    meeting: "17:45 Uhr an der Sakristei",

    points: 25,

    status: "scheduled",
  },

  {
    id: "familienmesse-16-08",
    title: "Familienmesse",

    dateISO: "2026-08-16",
    date: "Sonntag, 16. August 2026",

    time: "10:00 Uhr",

    church: "St. Dionysius",
    location: "St. Dionysius",

    leader: "Anna Beispiel",

    meeting: "09:45 Uhr an der Sakristei",

    points: 20,

    status: "scheduled",
  },

  {
    id: "vorabendmesse-22-08",
    title: "Vorabendmesse",

    dateISO: "2026-08-22",
    date: "Samstag, 22. August 2026",

    time: "18:00 Uhr",

    church: "St. Dionysius",
    location: "St. Dionysius",

    leader: "Thomas Leiter",

    meeting: "17:45 Uhr an der Sakristei",

    points: 25,

    status: "exchange_requested",
  },

  {
    id: "sonntagsmesse-02-08",
    title: "Sonntagsmesse",

    dateISO: "2026-08-02",
    date: "Sonntag, 2. August 2026",

    time: "10:00 Uhr",

    church: "St. Dionysius",
    location: "St. Dionysius",

    leader: "Maria Beispiel",

    meeting: "09:45 Uhr an der Sakristei",

    points: 20,

    status: "completed",
  },
];