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

/* ============================================================
   DEV ROLE STORAGE
   ============================================================ */

const DEV_ROLE_STORAGE_KEY = "mgb-dev-role";

const DEFAULT_ROLE: UserRole = "messdiener";

/* ============================================================
   CONTEXT TYPE
   ============================================================ */

type RoleContextType = {
  role: UserRole;
  roleLabel: string;

  isMember: boolean;
  isLeader: boolean;
  isPlanner: boolean;
  isAdmin: boolean;

  hasPermission: (
    permission: Permission
  ) => boolean;

  setRole: (role: UserRole) => void;
};

const RoleContext =
  createContext<RoleContextType | null>(null);

/* ============================================================
   ROLE VALIDATION
   ============================================================ */

function isValidRole(
  value: string | null
): value is UserRole {
  return (
    value === "messdiener" ||
    value === "leiter" ||
    value === "planschreiber" ||
    value === "admin"
  );
}

/* ============================================================
   PROVIDER
   ============================================================ */

export function RoleProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * ============================================================
   * WICHTIG:
   *
   * Der initiale Wert ist IMMER DEFAULT_ROLE.
   *
   * localStorage wird NICHT während des initialen Renderings
   * gelesen.
   *
   * Dadurch erzeugen Server und Client zunächst exakt dasselbe
   * HTML.
   * ============================================================
   */

  const [role, setRoleState] =
    useState<UserRole>(DEFAULT_ROLE);

  /*
   * ============================================================
   * CLIENT-SEITIG GESPEICHERTE ENTWICKLUNGSROLLE LADEN
   * ============================================================
   */

  useEffect(() => {
    const storedRole =
      window.localStorage.getItem(
        DEV_ROLE_STORAGE_KEY
      );

    if (isValidRole(storedRole)) {
      setRoleState(storedRole);
    }
  }, []);

  /*
   * ============================================================
   * ROLLE ÄNDERN
   * ============================================================
   */

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);

    window.localStorage.setItem(
      DEV_ROLE_STORAGE_KEY,
      newRole
    );
  };

  /*
   * ============================================================
   * CONTEXT VALUE
   * ============================================================
   */

  const value = useMemo(
    () => ({
      role,

      roleLabel: roles[role].label,

      isMember:
        role === "messdiener",

      isLeader:
        role === "leiter",

      isPlanner:
        role === "planschreiber",

      isAdmin:
        role === "admin",

      hasPermission: (
        permission: Permission
      ) =>
        hasPermission(
          role,
          permission
        ),

      setRole,
    }),
    [role]
  );

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

/* ============================================================
   HOOK
   ============================================================ */

export function useRole() {
  const context =
    useContext(RoleContext);

  if (!context) {
    throw new Error(
      "useRole must be used inside a RoleProvider"
    );
  }

  return context;
}