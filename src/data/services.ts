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
  dateISO: string;
  date: string;
  time: string;
  church: string;
  location: string;
  leader: string;
  meeting: string;
  points: number;
  status: ServiceStatus;
  takenBy?: string;
  excuseReason?: ExcuseReason;
};

export const services: Service[] = [
  {
    id: "hochamt-19-09",
    title: "Hochamt",
    dateISO: "2026-09-19",
    date: "Samstag, 19. September 2026",
    time: "18:00 Uhr",
    church: "Interner Standort",
    location: "Interner Standort",
    leader: "Max Mustermann",
    meeting: "17:45 Uhr am Treffpunkt",
    points: 25,
    status: "scheduled",
  },
  {
    id: "familienmesse-20-09",
    title: "Familienmesse",
    dateISO: "2026-09-20",
    date: "Sonntag, 20. September 2026",
    time: "10:00 Uhr",
    church: "Interner Standort",
    location: "Interner Standort",
    leader: "Anna Beispiel",
    meeting: "09:45 Uhr am Treffpunkt",
    points: 20,
    status: "scheduled",
  },
  {
    id: "vorabendmesse-26-09",
    title: "Vorabendmesse",
    dateISO: "2026-09-26",
    date: "Samstag, 26. September 2026",
    time: "18:00 Uhr",
    church: "Interner Standort",
    location: "Interner Standort",
    leader: "Thomas Leiter",
    meeting: "17:45 Uhr am Treffpunkt",
    points: 25,
    status: "exchange_requested",
  },
  {
    id: "sonntagsmesse-27-09",
    title: "Sonntagsmesse",
    dateISO: "2026-09-27",
    date: "Sonntag, 27. September 2026",
    time: "10:00 Uhr",
    church: "Interner Standort",
    location: "Interner Standort",
    leader: "Maria Beispiel",
    meeting: "09:45 Uhr am Treffpunkt",
    points: 20,
    status: "scheduled",
  },
  {
    id: "jugendmesse-30-08",
    title: "Jugendmesse",
    dateISO: "2026-08-30",
    date: "Sonntag, 30. August 2026",
    time: "11:30 Uhr",
    church: "Interner Standort",
    location: "Interner Standort",
    leader: "Anna Beispiel",
    meeting: "11:15 Uhr am Treffpunkt",
    points: 20,
    status: "completed",
  },
];