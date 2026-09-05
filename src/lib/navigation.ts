import {
  LayoutDashboard,
  CalendarDays,
  RefreshCcw,
  Trophy,
  User,
  Settings,
  ShieldCheck,
  ClipboardList,
  Users,
  BarChart3,
  CheckCircle2,
  Megaphone,
  UserCog,
} from "lucide-react";

import {
  hasPermission,
  type UserRole,
  type Permission,
} from "@/lib/permissions";

export type NavigationItem = {
  href: string;
  title: string;
  description?: string;
  icon: typeof LayoutDashboard;

  /**
   * Rollen, die diesen Bereich grundsätzlich sehen dürfen.
   */
  roles?: UserRole[];

  /**
   * Zusätzliche Berechtigung.
   *
   * Wenn gesetzt, muss die Rolle diese Permission
   * ebenfalls besitzen.
   */
  permission?: Permission;
};

export const navigationItems: NavigationItem[] = [
  /* ============================================================
     NORMALER BEREICH
     ============================================================ */

  {
    href: "/",
    icon: LayoutDashboard,
    title: "Dashboard",
    roles: [
      "messdiener",
      "leiter",
      "planschreiber",
      "admin",
    ],
  },

  {
    href: "/services",
    icon: CalendarDays,
    title: "Meine Dienste",
    roles: [
      "messdiener",
      "leiter",
      "planschreiber",
      "admin",
    ],
  },

  {
    href: "/exchange",
    icon: RefreshCcw,
    title: "Tauschbörse",
    roles: [
      "messdiener",
      "leiter",
      "planschreiber",
      "admin",
    ],
  },

  {
    href: "/points",
    icon: Trophy,
    title: "Punkte",
    roles: [
      "messdiener",
      "leiter",
      "planschreiber",
      "admin",
    ],
  },

  {
    href: "/profile",
    icon: User,
    title: "Profil",
    roles: [
      "messdiener",
      "leiter",
      "planschreiber",
      "admin",
    ],
  },

  {
    href: "/settings",
    icon: Settings,
    title: "Einstellungen",
    roles: [
      "messdiener",
      "leiter",
      "planschreiber",
      "admin",
    ],
  },

  /* ============================================================
     LEITERBEREICH
     
     Hier stehen NUR zusätzliche Funktionen.
     Persönliche Dienste/Tauschbörse/Punkte werden NICHT
     noch einmal aufgeführt.
     ============================================================ */

  {
    href: "/leader",
    icon: ShieldCheck,
    title: "Leiterbereich",
    description:
      "Übersicht und Leitungsfunktionen",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_leader_area",
  },

  {
    href: "/leader/members",
    icon: Users,
    title: "Messdiener",
    description:
      "Übersicht der Messdiener",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_team",
  },

  {
    href: "/leader/services",
    icon: ClipboardList,
    title: "Dienstübersicht",
    description:
      "Dienste der Gemeinschaft einsehen",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_service_management",
  },

  {
    href: "/leader/statistics",
    icon: BarChart3,
    title: "Statistiken",
    description:
      "Dienste und Punkte auswerten",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_statistics",
  },

  /* ============================================================
     PLANVERWALTUNG
     
     NUR PLANSCHREIBER + ADMIN
     ============================================================ */

  {
    href: "/leader/requests",
    icon: CheckCircle2,
    title: "Anfragen",
    description:
      "Tausch- und Übernahmeanfragen bestätigen",
    roles: [
      "planschreiber",
      "admin",
    ],
    permission: "confirm_requests",
  },

  {
    href: "/leader/schedule",
    icon: CalendarDays,
    title: "Messdienerplan",
    description:
      "Dienstplan erstellen und bearbeiten",
    roles: [
      "planschreiber",
      "admin",
    ],
    permission: "manage_schedule",
  },

  /* ============================================================
     ADMINISTRATION
     
     AUSSCHLIESSLICH ADMIN
     ============================================================ */

  {
    href: "/admin",
    icon: ShieldCheck,
    title: "Administration",
    description:
      "Zentrale Systemverwaltung",
    roles: [
      "admin",
    ],
  },

  {
    href: "/admin/users",
    icon: UserCog,
    title: "Benutzerverwaltung",
    description:
      "Benutzer und Konten verwalten",
    roles: [
      "admin",
    ],
    permission: "manage_members",
  },

  {
    href: "/admin/roles",
    icon: ShieldCheck,
    title: "Rollen & Rechte",
    description:
      "Rollen und Berechtigungen verwalten",
    roles: [
      "admin",
    ],
    permission: "manage_roles",
  },

  {
    href: "/admin/announcements",
    icon: Megaphone,
    title: "Ankündigungen",
    description:
      "Nachrichten an die MGB verwalten",
    roles: [
      "admin",
    ],
    permission: "manage_announcements",
  },

  {
    href: "/admin/settings",
    icon: Settings,
    title: "Systemverwaltung",
    description:
      "Globale Systemeinstellungen",
    roles: [
      "admin",
    ],
    permission: "manage_system",
  },
];

/* ================================================================
   NAVIGATION FÜR EINE ROLLE
   ================================================================ */

export function getNavigationForRole(
  role: UserRole
): NavigationItem[] {
  return navigationItems.filter((item) => {
    /*
     * Wenn Rollen angegeben sind, muss die aktuelle Rolle
     * darin enthalten sein.
     */
    if (
      item.roles &&
      !item.roles.includes(role)
    ) {
      return false;
    }

    /*
     * Wenn eine Permission angegeben ist, muss die Rolle
     * diese ebenfalls besitzen.
     */
    if (
      item.permission &&
      !hasPermission(
        role,
        item.permission
      )
    ) {
      return false;
    }

    return true;
  });
}