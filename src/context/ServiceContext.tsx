"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useDemoMode } from "@/context/DemoModeContext";
import type { Service, ExcuseReason } from "@/data/services";

type ServiceContextType = {
  services: Service[];
  myServices: Service[];
  getService: (id: string) => Service | undefined;
  getTotalPoints: () => number;
  getCompletedPoints: () => number;
  requestExchange: (id: string) => Promise<void>;
  takeService: (id: string) => Promise<void>;
  rejectTakeover: (id: string) => Promise<void>;
  excuseService: (id: string, reason: ExcuseReason) => Promise<void>;
  restoreService: (id: string) => Promise<void>;
};

type ServiceRow = {
  id: string;
  title: string;
  date_iso: string;
  time: string;
  location: string;
  meeting: string;
  points: number;
  status: Service["status"];
  excuse_reason: string | null;
  assigned_to: string | null;
  taken_by: string | null;
  leader_id: string | null;
  assigned_profile?: { display_name: string | null } | null;
  taken_profile?: { display_name: string | null } | null;
  leader_profile?: { display_name: string | null } | null;
};

const ServiceContext = createContext<ServiceContextType | null>(null);

function rowToService(row: ServiceRow, userId?: string): Service {
  const date = new Date(`${row.date_iso}T12:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const assignedName = row.assigned_profile?.display_name ?? (row.assigned_to === userId ? "Du" : "");

  return {
    id: row.id,
    title: row.title,
    dateISO: row.date_iso,
    date: date.charAt(0).toUpperCase() + date.slice(1),
    time: row.time,
    church: row.location,
    location: row.location,
    leader: row.leader_profile?.display_name ?? "",
    meeting: row.meeting,
    points: row.points,
    status: row.status,
    assignedTo: row.assigned_to ?? undefined,
    takenById: row.taken_by ?? undefined,
    takenBy: row.taken_profile?.display_name ?? (row.taken_by ? "Anderer Messdiener" : undefined),
    excuseReason:
      row.excuse_reason && ["Krankheit", "Schule", "Familie", "Urlaub", "Sonstiges"].includes(row.excuse_reason)
        ? (row.excuse_reason as ExcuseReason)
        : undefined,
    ...(assignedName ? { assignedName } : {}),
  } as Service;
}

export function ServiceProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { enabled: demoMode, loading: demoLoading } = useDemoMode();
  const [services, setServices] = useState<Service[]>([]);
  const [usingSupabase, setUsingSupabase] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  async function loadServices() {
    if (!user) {
      // The app is protected. Never fall back to local/demo data when signed out.
      setUsingSupabase(false);
      setServices([]);
      try {
        window.localStorage.removeItem("mgb-connect-services");
      } catch {
        // Ignore optional cleanup failures.
      }
      return;
    }

    const table = demoMode ? "demo_services" : "services";
    const select = demoMode
      ? "id, title, date_iso, time, location, meeting, points, status, excuse_reason, assigned_to, taken_by, leader_id, assigned_profile:profiles!demo_services_assigned_to_fkey(display_name), taken_profile:profiles!demo_services_taken_by_fkey(display_name), leader_profile:profiles!demo_services_leader_id_fkey(display_name)"
      : "id, title, date_iso, time, location, meeting, points, status, excuse_reason, assigned_to, taken_by, leader_id, assigned_profile:profiles!services_assigned_to_fkey(display_name), taken_profile:profiles!services_taken_by_fkey(display_name), leader_profile:profiles!services_leader_id_fkey(display_name)";

    const { data, error } = await supabase.from(table).select(select).order("date_iso", { ascending: true });
    setUsingSupabase(true);

    if (!error && data) {
      setServices((data as ServiceRow[]).map((row) => rowToService(row, user.id)));
      return;
    }

    // Never keep stale data from the previous mode after a mode switch or DB error.
    setServices([]);
  }

  useEffect(() => {
    if (authLoading || demoLoading) return;
    void loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, demoLoading, user?.id, demoMode]);

  async function runTransition(
    rpcName: "request_service_exchange" | "take_service" | "reject_service_takeover" | "excuse_service" | "restore_service",
    id: string,
    reason?: ExcuseReason
  ) {
    if (usingSupabase && user) {
      const realRpc = demoMode
        ? ({
            request_service_exchange: "demo_request_service_exchange",
            take_service: "demo_take_service",
            reject_service_takeover: "demo_reject_service_takeover",
            excuse_service: "demo_excuse_service",
            restore_service: "demo_restore_service",
          } as const)[rpcName]
        : rpcName;

      const params = rpcName === "excuse_service" ? { p_service_id: id, p_reason: reason } : { p_service_id: id };
      const { data } = await supabase.rpc(realRpc, params);
      if (data === true) await loadServices();
      return;
    }
  }

  const requestExchange = (id: string) => runTransition("request_service_exchange", id);
  const takeService = (id: string) => runTransition("take_service", id);
  const rejectTakeover = (id: string) => runTransition("reject_service_takeover", id);
  const excuseService = (id: string, reason: ExcuseReason) => runTransition("excuse_service", id, reason);
  const restoreService = (id: string) => runTransition("restore_service", id);
  const getService = (id: string) => services.find((service) => service.id === id);

  const myServices = useMemo(
    () => (user ? services.filter((service) => service.assignedTo === user.id || service.takenById === user.id) : []),
    [services, user?.id]
  );
  const getTotalPoints = () => myServices.reduce((total, service) => (service.status === "completed" ? total + service.points : total), 0);
  const getCompletedPoints = getTotalPoints;

  const value = useMemo(
    () => ({
      services,
      myServices,
      getService,
      getTotalPoints,
      getCompletedPoints,
      requestExchange,
      takeService,
      rejectTakeover,
      excuseService,
      restoreService,
    }),
    [services, myServices, usingSupabase, user?.id, demoMode]
  );

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) throw new Error("useServices must be used inside a ServiceProvider");
  return context;
}
