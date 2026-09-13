"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Users,
  UserRound,
  CalendarDays,
  BarChart3,
  ClipboardList,
  Megaphone,
  Settings,
  UserCog,
  Lock,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";

import {
  hasPermission,
  permissions,
  roles,
  type Permission,
  type UserRole,
} from "@/lib/permissions";

/* ============================================================
   PERMISSION META
============================================================ */

type PermissionMeta = {
  permission: Permission;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const permissionMeta: PermissionMeta[] = [
  {
    permission: "view_leader_area",
    title: "Leiterbereich",
    description:
      "Zugriff auf die zentrale Übersicht für die Leitung.",
    icon: <ShieldCheck size={18} />,
  },

  {
    permission: "view_team",
    title: "Messdiener einsehen",
    description:
      "Messdiener und deren Informationen einsehen.",
    icon: <Users size={18} />,
  },

  {
    permission: "view_service_management",
    title: "Dienstverwaltung",
    description:
      "Dienste prüfen und verwalten.",
    icon: <ClipboardList size={18} />,
  },

  {
    permission: "view_statistics",
    title: "Statistiken",
    description:
      "Statistiken und Auswertungen einsehen.",
    icon: <BarChart3 size={18} />,
  },

  {
    permission: "confirm_requests",
    title: "Anfragen bestätigen",
    description:
      "Übernahmen und Anfragen bestätigen oder bearbeiten.",
    icon: <Check size={18} />,
  },

  {
    permission: "manage_schedule",
    title: "Messdienerplan verwalten",
    description:
      "Dienste und Messdienerpläne verwalten.",
    icon: <CalendarDays size={18} />,
  },

  {
    permission: "manage_members",
    title: "Benutzer verwalten",
    description:
      "Benutzer und Mitglieder verwalten.",
    icon: <UserCog size={18} />,
  },

  {
    permission: "manage_roles",
    title: "Rollen verwalten",
    description:
      "Rollen und Berechtigungen verwalten.",
    icon: <ShieldCheck size={18} />,
  },

  {
    permission: "manage_announcements",
    title: "Ankündigungen verwalten",
    description:
      "Ankündigungen erstellen und verwalten.",
    icon: <Megaphone size={18} />,
  },

  {
    permission: "manage_system",
    title: "System verwalten",
    description:
      "Globale Systemeinstellungen verwalten.",
    icon: <Settings size={18} />,
  },
];

/* ============================================================
   ROLLEN META
============================================================ */

const roleOrder: UserRole[] = [
  "messdiener",
  "leiter",
  "planschreiber",
  "admin",
];

const roleIcons: Record<UserRole, React.ReactNode> = {
  messdiener: <UserRound size={24} />,
  leiter: <Users size={24} />,
  planschreiber: <CalendarDays size={24} />,
  admin: <ShieldCheck size={24} />,
};

/* ============================================================
   PAGE
============================================================ */

export default function AdminRolesPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const { role } = useRole();

  const isAllowed =
    hasPermission(role, "manage_roles");

  if (!isAllowed) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Background />

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <Topbar
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section
          className="
            relative
            z-10
            mx-auto
            max-w-5xl
            px-6
            pb-12
            pt-36
          "
        >
          <Link
            href="/"
            className="
              mb-8
              inline-flex
              items-center
              gap-2
              text-white/55
              transition
              hover:text-white
            "
          >
            <ArrowLeft size={18} />
            Zurück zum Dashboard
          </Link>

          <div
            className="
              rounded-[30px]
              border
              border-red-400/20
              bg-red-400/[0.07]
              p-8
              backdrop-blur-2xl
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-red-400/20
                bg-red-400/10
                text-red-300
              "
            >
              <Lock size={25} />
            </div>

            <h1
              className="
                mt-5
                text-3xl
                font-black
                text-white
              "
            >
              Kein Zugriff
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-white/60">
              Du besitzt aktuell keine Berechtigung,
              Rollen und Rechte zu verwalten.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* ======================================================
          TOP OVERLAY
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          z-30
          h-32
          bg-gradient-to-b
          from-[#050505]
          via-[#050505]/92
          to-transparent
        "
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <section
        className="
          relative
          z-10
          mx-auto
          max-w-6xl
          px-6
          pb-16
          pt-36
        "
      >
        {/* ====================================================
            BACK
        ==================================================== */}

        <Link
          href="/admin"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            text-white/55
            transition
            hover:text-white
          "
        >
          <ArrowLeft size={18} />
          Zurück zur Administration
        </Link>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-10">
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                border-amber-400/20
                bg-amber-400/10
                text-amber-300
              "
            >
              <ShieldCheck size={22} />
            </div>

            <p
              className="
                text-sm
                uppercase
                tracking-[0.22em]
                text-amber-300/80
              "
            >
              Administration
            </p>
          </div>

          <h1
            className="
              mt-4
              text-5xl
              font-black
              tracking-tight
              text-white
            "
          >
            Rollen & Rechte
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-lg
              leading-7
              text-white/60
            "
          >
            Übersicht der aktuell definierten Rollen
            und ihrer Berechtigungen in MGB Connect.
          </p>
        </div>

        {/* ====================================================
            INFO
        ==================================================== */}

        <div
          className="
            mb-8
            rounded-2xl
            border
            border-amber-400/15
            bg-amber-400/[0.06]
            p-5
          "
        >
          <div className="flex gap-4">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-amber-400/10
                text-amber-300
              "
            >
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Aktuelles Berechtigungssystem
              </h2>

              <p className="mt-1 leading-6 text-white/55">
                Diese Übersicht basiert direkt auf den
                zentralen Rollen und Berechtigungen des
                aktuellen Systems. Änderungen an den
                Berechtigungen werden später mit der
                Datenbank und Benutzerverwaltung verbunden.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            ROLLEN
        ==================================================== */}

        <div className="grid gap-5 lg:grid-cols-2">
          {roleOrder.map((roleId) => {
            const roleDefinition =
              roles[roleId];

            const rolePermissions =
              permissions[roleId];

            return (
              <RoleCard
                key={roleId}
                role={roleId}
                title={roleDefinition.label}
                description={
                  roleDefinition.description
                }
                permissions={rolePermissions}
              />
            );
          })}
        </div>

        {/* ====================================================
            BERECHTIGUNGEN
        ==================================================== */}

        <div className="mt-12">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.2em]
              text-white/40
            "
          >
            Berechtigungsübersicht
          </p>

          <h2
            className="
              mt-2
              text-3xl
              font-black
              text-white
            "
          >
            Alle verfügbaren Rechte
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {permissionMeta.map((item) => (
              <div
                key={item.permission}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-4
                  backdrop-blur-xl
                "
              >
                <div className="flex gap-3">
                  <div
                    className="
                      mt-0.5
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-amber-400/15
                      bg-amber-400/10
                      text-amber-300
                    "
                  >
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-white/50
                      "
                    >
                      {item.description}
                    </p>

                    <p
                      className="
                        mt-3
                        font-mono
                        text-xs
                        text-white/25
                      "
                    >
                      {item.permission}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   ROLE CARD
============================================================ */

function RoleCard({
  role,
  title,
  description,
  permissions: rolePermissions,
}: {
  role: UserRole;
  title: string;
  description: string;
  permissions: Permission[];
}) {
  const icon = roleIcons[role];

  const roleColor: Record<
    UserRole,
    string
  > = {
    messdiener:
      "border-white/10 bg-white/[0.04] text-white/70",

    leiter:
      "border-blue-400/20 bg-blue-400/[0.07] text-blue-300",

    planschreiber:
      "border-amber-400/20 bg-amber-400/[0.07] text-amber-300",

    admin:
      "border-violet-400/20 bg-violet-400/[0.07] text-violet-300",
  };

  return (
    <div
      className={`
        rounded-[28px]
        border
        p-6
        backdrop-blur-2xl
        ${roleColor[role]}
      `}
    >
      {/* HEADER */}

      <div className="flex items-start gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-white/10
            bg-black/10
          "
        >
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">
            {title}
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-white/55
            "
          >
            {description}
          </p>
        </div>
      </div>

      {/* PERMISSION COUNT */}

      <div
        className="
          mt-6
          flex
          items-center
          justify-between
          rounded-xl
          border
          border-white/10
          bg-black/10
          px-4
          py-3
        "
      >
        <span className="text-sm text-white/50">
          Berechtigungen
        </span>

        <span className="font-bold text-white">
          {rolePermissions.length}
        </span>
      </div>

      {/* PERMISSIONS */}

      <div className="mt-4 space-y-2">
        {permissionMeta.map((item) => {
          const allowed =
            rolePermissions.includes(
              item.permission
            );

          return (
            <div
              key={item.permission}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/[0.07]
                bg-black/[0.08]
                px-3
                py-2.5
              "
            >
              <div
                className={`
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  ${
                    allowed
                      ? `
                        bg-emerald-400/10
                        text-emerald-300
                      `
                      : `
                        bg-white/5
                        text-white/20
                      `
                  }
                `}
              >
                {allowed ? (
                  <Check size={15} />
                ) : (
                  <Lock size={13} />
                )}
              </div>

              <span
                className={
                  allowed
                    ? "text-sm text-white/80"
                    : "text-sm text-white/30"
                }
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}