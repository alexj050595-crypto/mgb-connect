"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Search,
  Users,
  ShieldCheck,
  UserCog,
  CalendarDays,
  Trophy,
  ChevronDown,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import type { UserRole } from "@/lib/permissions";

/* ============================================================
   TYPES
============================================================ */

type MemberStatus =
  | "active"
  | "inactive";

type AdminUser = {
  id: string;

  name: string;

  role: UserRole;

  status: MemberStatus;

  services: number;

  points: number;
};

/* ============================================================
   DEVELOPMENT DATA

   Diese Daten werden später durch Supabase ersetzt.

   Die UI selbst kann dabei weitgehend unverändert bleiben.
============================================================ */

const initialUsers: AdminUser[] = [
  {
    id: "user-1",
    name: "Max Mustermann",
    role: "messdiener",
    status: "active",
    services: 14,
    points: 280,
  },

  {
    id: "user-2",
    name: "Anna Schneider",
    role: "messdiener",
    status: "active",
    services: 11,
    points: 220,
  },

  {
    id: "user-3",
    name: "Lukas Weber",
    role: "leiter",
    status: "active",
    services: 23,
    points: 460,
  },

  {
    id: "user-4",
    name: "Marie Fischer",
    role: "planschreiber",
    status: "active",
    services: 18,
    points: 360,
  },

  {
    id: "user-5",
    name: "Jonas Becker",
    role: "messdiener",
    status: "inactive",
    services: 6,
    points: 120,
  },

  {
    id: "user-6",
    name: "Sophie Wagner",
    role: "leiter",
    status: "active",
    services: 27,
    points: 540,
  },
];

/* ============================================================
   ROLE CONFIG
============================================================ */

const roleConfig: Record<
  UserRole,
  {
    label: string;
    className: string;
  }
> = {
  messdiener: {
    label: "Messdiener",

    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },

  leiter: {
    label: "Leiter",

    className:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
  },

  planschreiber: {
    label: "Planschreiber",

    className:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },

  admin: {
    label: "Administrator",

    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
};

/* ============================================================
   PAGE
============================================================ */

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [users, setUsers] =
    useState<AdminUser[]>(initialUsers);

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState<"all" | UserRole>("all");

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [
    users,
    search,
    roleFilter,
  ]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const activeUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.status === "active"
    ).length;
  }, [users]);

  const totalPoints = useMemo(() => {
    return users.reduce(
      (total, user) =>
        total + user.points,
      0
    );
  }, [users]);

  const totalServices = useMemo(() => {
    return users.reduce(
      (total, user) =>
        total + user.services,
      0
    );
  }, [users]);

  /* ==========================================================
     ROLE CHANGE

     Später:
     Supabase Update
  ========================================================== */

  const updateUserRole = (
    userId: string,
    role: UserRole
  ) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              role,
            }
          : user
      )
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      {/* GLOBAL TOP OVERLAY */}

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

      {/* SIDEBAR */}

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* TOPBAR */}

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      <section
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          pb-12
          pt-36
        "
      >
        {/* BACK */}

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

        {/* HEADER */}

        <div className="mb-10">
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

          <h1
            className="
              mt-2
              text-5xl
              font-black
              tracking-tight
              text-white
            "
          >
            Benutzerverwaltung
          </h1>

          <p className="mt-3 text-lg text-white/60">
            Verwalte Benutzer, Rollen und
            den aktuellen Status der MGB.
          </p>
        </div>

        {/* STATISTICS */}

        <div className="grid gap-4 md:grid-cols-3">
          <AdminStat
            icon={<Users size={20} />}
            value={users.length}
            label="Benutzer insgesamt"
          />

          <AdminStat
            icon={<CheckCircle2 size={20} />}
            value={activeUsers}
            label="Aktive Benutzer"
          />

          <AdminStat
            icon={<Trophy size={20} />}
            value={totalPoints}
            label="Gesamtpunkte"
          />
        </div>

        {/* FILTER */}

        <div
          className="
            mt-8
            rounded-[28px]
            border
            border-white/10
            bg-white/[0.045]
            p-5
            backdrop-blur-2xl
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              md:flex-row
            "
          >
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={19}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-white/35
                "
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Benutzer suchen..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  py-3
                  pl-12
                  pr-4
                  text-white
                  outline-none
                  transition
                  placeholder:text-white/30
                  focus:border-amber-400/30
                  focus:bg-black/30
                "
              />
            </div>

            {/* ROLE FILTER */}

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target
                      .value as
                      | "all"
                      | UserRole
                  )
                }
                className="
                  appearance-none
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/20
                  px-4
                  py-3
                  pr-11
                  text-white
                  outline-none
                  transition
                  focus:border-amber-400/30
                "
              >
                <option value="all">
                  Alle Rollen
                </option>

                <option value="messdiener">
                  Messdiener
                </option>

                <option value="leiter">
                  Leiter
                </option>

                <option value="planschreiber">
                  Planschreiber
                </option>

                <option value="admin">
                  Administrator
                </option>
              </select>

              <ChevronDown
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-white/40
                "
              />
            </div>
          </div>

          <p className="mt-4 text-sm text-white/40">
            {filteredUsers.length} von{" "}
            {users.length} Benutzern
          </p>
        </div>

        {/* USER LIST */}

        <div
          className="
            mt-6
            overflow-hidden
            rounded-[30px]
            border
            border-white/10
            bg-white/[0.045]
            backdrop-blur-2xl
          "
        >
          <div
            className="
              border-b
              border-white/10
              px-6
              py-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <UserCog
                size={21}
                className="text-amber-300"
              />

              <div>
                <h2 className="font-bold text-white">
                  Benutzer
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Rollen und Benutzerstatus
                  verwalten.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {filteredUsers.map(
              (user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onRoleChange={
                    updateUserRole
                  }
                />
              )
            )}

            {filteredUsers.length === 0 && (
              <div
                className="
                  px-6
                  py-16
                  text-center
                "
              >
                <UserRound
                  size={34}
                  className="
                    mx-auto
                    text-white/25
                  "
                />

                <h3
                  className="
                    mt-4
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  Keine Benutzer gefunden
                </h3>

                <p className="mt-2 text-white/45">
                  Passe deine Suche oder den
                  Rollenfilter an.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FUTURE INFO */}

        <div
          className="
            mt-8
            rounded-[26px]
            border
            border-amber-400/15
            bg-amber-400/[0.05]
            p-5
          "
        >
          <div className="flex items-start gap-4">
            <ShieldCheck
              size={22}
              className="
                mt-0.5
                shrink-0
                text-amber-300
              "
            />

            <div>
              <h3 className="font-bold text-white">
                Vorbereitung auf Supabase
              </h3>

              <p className="mt-2 max-w-3xl leading-6 text-white/55">
                Diese Benutzerverwaltung
                verwendet aktuell
                Entwicklungsdaten. Die
                Benutzerstruktur ist bereits
                so vorbereitet, dass die
                Daten später durch echte
                Benutzer aus Supabase ersetzt
                werden können.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function AdminStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;

  value: number;

  label: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.045]
        p-5
        backdrop-blur-2xl
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-amber-300
        "
      >
        {icon}

        <span className="text-sm text-white/45">
          {label}
        </span>
      </div>

      <p
        className="
          mt-4
          text-3xl
          font-black
          text-white
        "
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   USER ROW
============================================================ */

function UserRow({
  user,
  onRoleChange,
}: {
  user: AdminUser;

  onRoleChange: (
    userId: string,
    role: UserRole
  ) => void;
}) {
  const role =
    roleConfig[user.role];

  return (
    <div
      className="
        flex
        flex-col
        gap-5
        px-6
        py-5
        transition
        hover:bg-white/[0.025]
        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* USER */}

      <div className="flex items-center gap-4">
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
            bg-white/[0.05]
            text-white/70
          "
        >
          <UserRound size={21} />
        </div>

        <div>
          <h3 className="font-bold text-white">
            {user.name}
          </h3>

          <div
            className="
              mt-1
              flex
              flex-wrap
              items-center
              gap-2
              text-sm
              text-white/40
            "
          >
            <span>
              {user.services} Dienste
            </span>

            <span>•</span>

            <span>
              {user.points} Punkte
            </span>
          </div>
        </div>
      </div>

      {/* CONTROLS */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-3
        "
      >
        {/* STATUS */}

        <span
          className={`
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold

            ${
              user.status === "active"
                ? `
                  border-emerald-400/20
                  bg-emerald-400/10
                  text-emerald-300
                `
                : `
                  border-white/10
                  bg-white/5
                  text-white/45
                `
            }
          `}
        >
          {user.status === "active"
            ? "Aktiv"
            : "Inaktiv"}
        </span>

        {/* ROLE */}

        <div className="relative">
          <select
            value={user.role}
            onChange={(event) =>
              onRoleChange(
                user.id,
                event.target
                  .value as UserRole
              )
            }
            className={`
              appearance-none
              rounded-full
              border
              px-3
              py-1
              pr-8
              text-xs
              font-semibold
              outline-none

              ${role.className}
            `}
          >
            <option value="messdiener">
              Messdiener
            </option>

            <option value="leiter">
              Leiter
            </option>

            <option value="planschreiber">
              Planschreiber
            </option>

            <option value="admin">
              Administrator
            </option>
          </select>

          <ChevronDown
            size={14}
            className="
              pointer-events-none
              absolute
              right-2.5
              top-1/2
              -translate-y-1/2
              text-current
            "
          />
        </div>
      </div>
    </div>
  );
}