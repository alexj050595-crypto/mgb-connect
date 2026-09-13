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
    href: "/news",
    icon: Megaphone,
    title: "News",
    description: "Aktuelle Informationen und Ankündigungen",
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
     Persönliche Dienste, Tauschbörse und Punkte werden
     nicht noch einmal aufgeführt.
     ============================================================ */

  {
    href: "/leader",
    icon: ShieldCheck,
    title: "Leiterbereich",
    description: "Übersicht und Leitungsfunktionen",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_leader_area",
  },

  {
    href: "/leader/services",
    icon: ClipboardList,
    title: "Dienstverwaltung",
    description: "Dienste prüfen und verwalten",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_service_management",
  },

  {
    href: "/leader/team",
    icon: Users,
    title: "Messdiener",
    description: "Messdiener und deren Dienste einsehen",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_team",
  },

  {
    href: "/leader/statistics",
    icon: BarChart3,
    title: "Statistiken",
    description: "Punkte und Dienste auswerten",
    roles: [
      "leiter",
      "planschreiber",
      "admin",
    ],
    permission: "view_statistics",
  },

  /* ============================================================
     PLANVERWALTUNG

     Nur Planschreiber + Admin.

     Übernahmen werden inzwischen automatisch angenommen.
     Diese Seite dient deshalb vor allem dazu, bereits
     übernommene Dienste zu prüfen und bei Bedarf abzulehnen.
     ============================================================ */

  {
    href: "/leader/requests",
    icon: CheckCircle2,
    title: "Anfragen",
    description: "Übernahmen prüfen und bei Bedarf ablehnen",
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
    description: "Messdienerplan erstellen und bearbeiten",
    roles: [
      "planschreiber",
      "admin",
    ],
    permission: "manage_schedule",
  },

  /* ============================================================
     ADMINISTRATION

     Ausschließlich Admin.
     ============================================================ */

  {
    href: "/admin",
    icon: ShieldCheck,
    title: "Administration",
    description: "Zentrale Systemverwaltung",
    roles: ["admin"],
  },

  {
    href: "/admin/users",
    icon: UserCog,
    title: "Benutzerverwaltung",
    description: "Benutzer und Konten verwalten",
    roles: ["admin"],
    permission: "manage_members",
  },

  {
    href: "/admin/roles",
    icon: ShieldCheck,
    title: "Rollen & Rechte",
    description: "Rollen und Berechtigungen verwalten",
    roles: ["admin"],
    permission: "manage_roles",
  },

  {
    href: "/admin/announcements",
    icon: Megaphone,
    title: "Ankündigungen",
    description: "Nachrichten an die MGB verwalten",
    roles: ["admin"],
    permission: "manage_announcements",
  },

  {
    href: "/admin/settings",
    icon: Settings,
    title: "Systemverwaltung",
    description: "Globale Systemeinstellungen",
    roles: ["admin"],
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
    if (
      item.roles &&
      !item.roles.includes(role)
    ) {
      return false;
    }

    if (
      item.permission &&
      !hasPermission(role, item.permission)
    ) {
      return false;
    }

    return true;
  });
}
