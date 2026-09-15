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
  assignedTo?: string;
  takenBy?: string;
  takenById?: string;
  excuseReason?: ExcuseReason;
};

// Real services come from Supabase. Demo data is generated only by the
// administrator-controlled demo mode.
export const services: Service[] = [];
