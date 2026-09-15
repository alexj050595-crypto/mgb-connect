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
  roles,
  hasPermission,
  type UserRole,
  type Permission,
} from "@/lib/permissions";
import { useAuth } from "@/context/AuthContext";

type RoleContextType = {
  role: UserRole;
  roleLabel: string;
  isMember: boolean;
  isLeader: boolean;
  isPlanner: boolean;
  isAdmin: boolean;
  hasPermission: (permission: Permission) => boolean;
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>("messdiener");

  useEffect(() => {
    if (authLoading) return;

    // The real Supabase profile is the only source of truth for roles.
    // Frontend role switching has intentionally been removed.
    if (user && profile?.role) {
      setRole(profile.role);
      return;
    }

    setRole("messdiener");
  }, [authLoading, profile, user]);

  const value = useMemo(
    () => ({
      role,
      roleLabel: roles[role].label,
      isMember: role === "messdiener",
      isLeader: role === "leiter",
      isPlanner: role === "planschreiber",
      isAdmin: role === "admin",
      hasPermission: (permission: Permission) => hasPermission(role, permission),
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used inside a RoleProvider");
  }

  return context;
}
