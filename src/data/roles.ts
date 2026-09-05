export type UserRole =
  | "messdiener"
  | "leiter"
  | "planschreiber"
  | "admin";

export type RoleDefinition = {
  id: UserRole;
  label: string;
  description: string;
};

export const roles: Record<UserRole, RoleDefinition> = {
  messdiener: {
    id: "messdiener",
    label: "Messdiener",
    description:
      "Teilnehmer mit Zugriff auf eigene Dienste, Tauschbörse und Punkte.",
  },

  leiter: {
    id: "leiter",
    label: "Leiter",
    description:
      "Leitung mit zusätzlichen Übersichten und Leitungsfunktionen.",
  },

  planschreiber: {
    id: "planschreiber",
    label: "Planschreiber",
    description:
      "Leitung mit Berechtigung zur Planverwaltung und Bestätigung von Anfragen.",
  },

  admin: {
    id: "admin",
    label: "Administrator",
    description:
      "Vollzugriff auf Verwaltung, Rollen, Pläne und Anfragen.",
  },
};

/*
 * ============================================================
 * BERECHTIGUNGEN
 * ============================================================
 */

export type Permission =
  | "view_leader_area"
  | "view_team"
  | "view_service_management"
  | "confirm_requests"
  | "manage_schedule"
  | "manage_members"
  | "manage_roles"
  | "manage_system";

const permissions: Record<UserRole, Permission[]> = {
  messdiener: [],

  leiter: [
    "view_leader_area",
    "view_team",
    "view_service_management",
  ],

  planschreiber: [
    "view_leader_area",
    "view_team",
    "view_service_management",
    "confirm_requests",
    "manage_schedule",
  ],

  admin: [
    "view_leader_area",
    "view_team",
    "view_service_management",
    "confirm_requests",
    "manage_schedule",
    "manage_members",
    "manage_roles",
    "manage_system",
  ],
};

/*
 * ============================================================
 * BERECHTIGUNG PRÜFEN
 * ============================================================
 */

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return permissions[role].includes(permission);
}

/*
 * ============================================================
 * ROLLEN-HIERARCHIE
 * ============================================================
 *
 * Höhere Rollen besitzen die grundlegenden Möglichkeiten
 * der darunterliegenden Verwaltungsstufen.
 */

export function isLeaderRole(role: UserRole): boolean {
  return (
    role === "leiter" ||
    role === "planschreiber" ||
    role === "admin"
  );
}

export function isPlanWriterOrAdmin(
  role: UserRole
): boolean {
  return (
    role === "planschreiber" ||
    role === "admin"
  );
}

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}