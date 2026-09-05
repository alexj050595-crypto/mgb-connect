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
  type Permission,
  type UserRole,
} from "@/lib/permissions";

export type NavigationItem = {
  href: string;
  title: string;
  description?: string;
  icon: typeof LayoutDashboard;

  /*
   * Rollen, die grundsätzlich Zugriff haben.
   */
  roles?: UserRole[];

  /*
   * Zusätzliche Berechtigung.
   *
   * Dadurch können wir später sehr genau unterscheiden,
   * was beispielsweise ein Leiter und ein Planschreiber
   * sehen bzw. ausführen darf.
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
  ============================================================ */

  {
    href: "/leader",
    icon: ShieldCheck,
    title: "Leiterbereich",
    description:
      "Übersicht für die Leitung",
    permission: "view_leader_area",
  },

  {
    href: "/leader/services",
    icon: ClipboardList,
    title: "Dienstverwaltung",
    description:
      "Dienste prüfen und verwalten",
    permission: "view_service_management",
  },

  {
    href: "/leader/members",
    icon: Users,
    title: "Messdiener",
    description:
      "Messdiener und deren Dienste einsehen",
    permission: "view_team",
  },

  {
    href: "/leader/statistics",
    icon: BarChart3,
    title: "Statistiken",
    description:
      "Punkte und Dienste auswerten",
    permission: "view_leader_area",
  },

  /* ============================================================
     ANFRAGEN
     
     WICHTIG:
     NICHT jeder Leiter bekommt diesen Punkt.
     
     Nur:
       Planschreiber
       Admin
     
     besitzen confirm_requests.
  ============================================================ */

  {
    href: "/leader/requests",
    icon: CheckCircle2,
    title: "Anfragen",
    description:
      "Vertretungsanfragen bestätigen",
    permission: "confirm_requests",
  },

  /* ============================================================
     PLANVERWALTUNG
     
     Ebenfalls nur Planschreiber + Admin.
  ============================================================ */

  {
    href: "/leader/schedule",
    icon: CalendarDays,
    title: "Messdienerplan",
    description:
      "Messdienerplan verwalten",
    permission: "manage_schedule",
  },

  /* ============================================================
     ADMINISTRATION
  ============================================================ */

  {
    href: "/admin",
    icon: ShieldCheck,
    title: "Administration",
    description:
      "System und Berechtigungen verwalten",
    permission: "manage_system",
  },

  {
    href: "/admin/users",
    icon: UserCog,
    title: "Benutzerverwaltung",
    description:
      "Benutzer verwalten",
    permission: "manage_members",
  },

  {
    href: "/admin/roles",
    icon: ShieldCheck,
    title: "Rollen & Rechte",
    description:
      "Rollen und Berechtigungen verwalten",
    permission: "manage_roles",
  },

  {
    href: "/admin/announcements",
    icon: Megaphone,
    title: "Ankündigungen",
    description:
      "Nachrichten an die MGB verwalten",
    permission: "manage_system",
  },

  {
    href: "/admin/settings",
    icon: Settings,
    title: "Systemverwaltung",
    description:
      "Globale Systemeinstellungen",
    permission: "manage_system",
  },
];

/* ============================================================
   NAVIGATION FÜR ROLLE
============================================================ */

export function getNavigationForRole(
  role: UserRole
): NavigationItem[] {
  return navigationItems.filter((item) => {
    /*
     * Wenn explizite Rollen angegeben sind,
     * muss die Rolle enthalten sein.
     */
    if (
      item.roles &&
      !item.roles.includes(role)
    ) {
      return false;
    }

    /*
     * Wenn eine Permission angegeben ist,
     * muss die Rolle diese besitzen.
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