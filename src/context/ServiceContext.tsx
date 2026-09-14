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
  rejectTakeover: (id: string) => void;
  excuseService: (id: string, reason: ExcuseReason) => void;
  restoreService: (id: string) => void;
};

const ServiceContext = createContext<ServiceContextType | null>(null);
const STORAGE_KEY = "mgb-connect-services";

export function ServiceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [services, setServices] = useState<Service[]>(initialServices);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Service[];

      if (Array.isArray(parsed)) {
        setServices(parsed);
      }
    } catch {
      // Falls gespeicherte Demo-Daten beschädigt sind,
      // bleiben die ursprünglichen Demo-Daten erhalten.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(services)
      );
    } catch {
      // LocalStorage ist nur eine optionale Demo-Persistenz.
    }
  }, [services]);

  const requestExchange = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id && service.status === "scheduled"
          ? {
              ...service,
              status: "exchange_requested",
              takenBy: undefined,
              excuseReason: undefined,
            }
          : service
      )
    );
  };

  const takeService = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id && service.status === "exchange_requested"
          ? {
              ...service,
              status: "taken_over",
              takenBy: "Aktueller Messdiener",
            }
          : service
      )
    );
  };

  const rejectTakeover = (id: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id && service.status === "taken_over"
          ? {
              ...service,
              status: "exchange_requested",
              takenBy: undefined,
            }
          : service
      )
    );
  };

  const excuseService = (id: string, reason: ExcuseReason) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id && service.status === "scheduled"
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

  const getService = (id: string) => {
    return services.find((service) => service.id === id);
  };

  const getTotalPoints = () => {
    return services.reduce((total, service) => {
      return service.status === "completed"
        ? total + service.points
        : total;
    }, 0);
  };

  const getCompletedPoints = () => {
    return services.reduce((total, service) => {
      return service.status === "completed"
        ? total + service.points
        : total;
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
