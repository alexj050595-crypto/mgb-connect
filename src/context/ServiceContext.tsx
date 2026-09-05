"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import {
  services as initialServices,
  Service,
  ExcuseReason,
} from "@/data/services";

type ServiceContextType = {
  services: Service[];

  getService: (id: string) => Service | undefined;

  getTotalPoints: () => number;

  getCompletedPoints: () => number;

  requestExchange: (id: string) => void;

  takeService: (id: string) => void;

  confirmTakeover: (id: string) => void;

  rejectTakeover: (id: string) => void;

  excuseService: (
    id: string,
    reason: ExcuseReason
  ) => void;

  restoreService: (id: string) => void;
};

const ServiceContext =
  createContext<ServiceContextType | null>(null);

export function ServiceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [services, setServices] =
    useState<Service[]>(initialServices);

  /*
   * ============================================================
   * TAUSCH ANFRAGEN
   * ============================================================
   *
   * scheduled
   *      ↓
   * exchange_requested
   */

  const requestExchange = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id &&
        service.status === "scheduled"
          ? {
              ...service,
              status: "exchange_requested",
              takenBy: undefined,
            }
          : service
      )
    );
  };

  /*
   * ============================================================
   * DIENST ÜBERNEHMEN
   * ============================================================
   *
   * exchange_requested
   *      ↓
   * taken_over
   *
   * Die Übernahme wird automatisch bestätigt.
   *
   * Der Dienst erscheint anschließend weiterhin
   * bei den Anfragen der Leitung, damit die Leitung
   * die Übernahme bei Bedarf ablehnen kann.
   */

  const takeService = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id &&
        service.status === "exchange_requested"
          ? {
              ...service,
              status: "taken_over",
              takenBy: "Aktueller Messdiener",
            }
          : service
      )
    );
  };

  /*
   * ============================================================
   * ÜBERNAHME BESTÄTIGEN
   * ============================================================
   *
   * Diese Funktion bleibt vorerst im Context,
   * damit bestehende Komponenten nicht unnötig
   * umgebaut werden müssen.
   *
   * Der normale Ablauf verwendet sie nicht mehr,
   * da Übernahmen bereits automatisch bestätigt werden.
   */

  const confirmTakeover = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id &&
        service.status === "taken_over" &&
        service.takenBy
          ? {
              ...service,
              status: "taken_over",
            }
          : service
      )
    );
  };

  /*
   * ============================================================
   * ÜBERNAHME ABLEHNEN
   * ============================================================
   *
   * taken_over
   *      ↓
   * exchange_requested
   *
   * Die automatische Übernahme wird dadurch
   * von der Leitung zurückgewiesen.
   *
   * Anschließend steht der Dienst wieder
   * für andere Messdiener zur Verfügung.
   */

  const rejectTakeover = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id &&
        service.status === "taken_over"
          ? {
              ...service,
              status: "exchange_requested",
              takenBy: undefined,
            }
          : service
      )
    );
  };

  /*
   * ============================================================
   * DIENST ABMELDEN
   * ============================================================
   *
   * scheduled
   *      ↓
   * excused
   */

  const excuseService = (
    id: string,
    reason: ExcuseReason
  ) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id &&
        service.status === "scheduled"
          ? {
              ...service,
              status: "excused",
              excuseReason: reason,
              takenBy: undefined,
            }
          : service
      )
    );
  };

  /*
   * ============================================================
   * DIENST ZURÜCKSETZEN
   * ============================================================
   */

  const restoreService = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id
          ? {
              ...service,
              status: "scheduled",
              excuseReason: undefined,
              takenBy: undefined,
            }
          : service
      )
    );
  };

  /*
   * ============================================================
   * DIENST ABRUFEN
   * ============================================================
   */

  const getService = (id: string) => {
    return services.find(
      (service) => service.id === id
    );
  };

  /*
   * ============================================================
   * GESAMTE PUNKTE
   * ============================================================
   */

  const getTotalPoints = () => {
    return services.reduce((total, service) => {
      if (service.status !== "completed") {
        return total;
      }

      return total + service.points;
    }, 0);
  };

  /*
   * ============================================================
   * ABGESCHLOSSENE PUNKTE
   * ============================================================
   */

  const getCompletedPoints = () => {
    return services.reduce((total, service) => {
      if (service.status !== "completed") {
        return total;
      }

      return total + service.points;
    }, 0);
  };

  const value = useMemo(
    () => ({
      services,
      getService,
      getTotalPoints,
      getCompletedPoints,
      requestExchange,
      takeService,
      confirmTakeover,
      rejectTakeover,
      excuseService,
      restoreService,
    }),
    [services]
  );

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error(
      "useServices must be used inside a ServiceProvider"
    );
  }

  return context;
}