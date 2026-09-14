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

const DEV_ROLE_STORAGE_KEY = "mgb-dev-role";
const DEFAULT_ROLE: UserRole = "messdiener";

type RoleContextType = {
  role: UserRole;
  roleLabel: string;
  isMember: boolean;
  isLeader: boolean;
  isPlanner: boolean;
  isAdmin: boolean;
  hasPermission: (permission: Permission) => boolean;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextType | null>(null);

function isValidRole(value: string | null): value is UserRole {
  return (
    value === "messdiener" ||
    value === "leiter" ||
    value === "planschreiber" ||
    value === "admin"
  );
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [role, setRoleState] = useState<UserRole>(DEFAULT_ROLE);

  useEffect(() => {
    if (authLoading) return;

    // An authenticated user's role always comes from the Supabase profile.
    // The local development role must never override a real account role.
    if (user) {
      setRoleState(profile?.role ?? DEFAULT_ROLE);
      return;
    }

    // Development-only role switching remains available while logged out.
    const storedRole = window.localStorage.getItem(DEV_ROLE_STORAGE_KEY);

    if (isValidRole(storedRole)) {
      setRoleState(storedRole);
    } else {
      setRoleState(DEFAULT_ROLE);
    }
  }, [authLoading, profile, user]);

  const setRole = (newRole: UserRole) => {
    // Never allow the development switcher to spoof an authenticated
    // Supabase user's real role.
    if (user) return;

    setRoleState(newRole);
    window.localStorage.setItem(DEV_ROLE_STORAGE_KEY, newRole);
  };

  const value = useMemo(
    () => ({
      role,
      roleLabel: roles[role].label,
      isMember: role === "messdiener",
      isLeader: role === "leiter",
      isPlanner: role === "planschreiber",
      isAdmin: role === "admin",
      hasPermission: (permission: Permission) => hasPermission(role, permission),
      setRole,
    }),
    [role, user?.id]
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
