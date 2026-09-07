"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleUserRound,
  Database,
  Palette,
  Settings2,
  Shield,
  UserCog,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";
import type { UserRole } from "@/lib/permissions";

type RoleOption = {
  role: UserRole;
  title: string;
  description: string;
};

const roleOptions: RoleOption[] = [
  {
    role: "messdiener",
    title: "Messdiener",
    description:
      "Eigene Dienste anzeigen, Punkte verfolgen und Dienste übernehmen.",
  },
  {
    role: "leiter",
    title: "Leiter",
    description:
      "Messdiener, Dienste und organisatorische Bereiche verwalten.",
  },
  {
    role: "planschreiber",
    title: "Planschreiber",
    description:
      "Dienstplanung und organisatorische Planungsbereiche verwalten.",
  },
  {
    role: "admin",
    title: "Administrator",
    description:
      "Vollständiger Zugriff auf die Verwaltungs- und Systembereiche.",
  },
];

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    role,
    roleLabel,
    setRole,
  } = useRole();

  const handleRoleChange = (
    newRole: UserRole
  ) => {
    setRole(newRole);
  };

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

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ======================================================
          TOPBAR
      ====================================================== */}

      <Topbar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

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
        {/* ====================================================
            BACK
        ==================================================== */}

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

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-10">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.22em]
              text-amber-300/80
            "
          >
            Einstellungen
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
            Einstellungen
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-lg
              leading-8
              text-white/60
            "
          >
            Verwalte deine aktuelle Entwicklungsumgebung
            und bereite MGB Connect auf die spätere
            Benutzerverwaltung vor.
          </p>
        </div>

        {/* ====================================================
            CURRENT ACCOUNT
        ==================================================== */}

        <SettingsSection
          icon={<CircleUserRound size={21} />}
          eyebrow="Account"
          title="Aktueller Zugriff"
          description="
            Diese Informationen werden später automatisch
            mit deinem angemeldeten Benutzerkonto verbunden.
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p className="text-sm text-white/45">
                Aktuelle Rolle
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {roleLabel}
              </p>
            </div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                self-start
                rounded-xl
                border
                border-emerald-400/20
                bg-emerald-400/10
                px-3
                py-2
                text-sm
                font-semibold
                text-emerald-300
                sm:self-auto
              "
            >
              <Check size={16} />

              Aktiv
            </div>
          </div>
        </SettingsSection>

        {/* ====================================================
            DEVELOPMENT ROLE
        ==================================================== */}

        <SettingsSection
          icon={<UserCog size={21} />}
          eyebrow="Entwicklung"
          title="Rolle wechseln"
          description="
            In der aktuellen Entwicklungsphase kannst du
            zwischen den verschiedenen Rollen wechseln,
            um alle Bereiche von MGB Connect zu testen.
          "
        >
          <div className="grid gap-3">
            {roleOptions.map((option) => {
              const isActive =
                option.role === role;

              return (
                <button
                  key={option.role}
                  type="button"
                  onClick={() =>
                    handleRoleChange(option.role)
                  }
                  className={`
                    group
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-5
                    rounded-2xl
                    border
                    p-5
                    text-left
                    transition
                    ${
                      isActive
                        ? `
                          border-amber-400/30
                          bg-amber-400/[0.09]
                        `
                        : `
                          border-white/10
                          bg-white/[0.03]
                          hover:border-white/20
                          hover:bg-white/[0.05]
                        `
                    }
                  `}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-white">
                        {option.title}
                      </p>

                      {isActive && (
                        <span
                          className="
                            rounded-full
                            border
                            border-amber-400/20
                            bg-amber-400/10
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            text-amber-300
                          "
                        >
                          Aktiv
                        </span>
                      )}
                    </div>

                    <p
                      className="
                        mt-2
                        max-w-2xl
                        text-sm
                        leading-6
                        text-white/50
                      "
                    >
                      {option.description}
                    </p>
                  </div>

                  {isActive ? (
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-amber-400/20
                        bg-amber-400/10
                        text-amber-300
                      "
                    >
                      <Check size={18} />
                    </div>
                  ) : (
                    <ChevronRight
                      size={20}
                      className="
                        shrink-0
                        text-white/25
                        transition
                        group-hover:translate-x-0.5
                        group-hover:text-white/60
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>
        </SettingsSection>

        {/* ====================================================
            APPEARANCE
        ==================================================== */}

        <SettingsSection
          icon={<Palette size={21} />}
          eyebrow="Darstellung"
          title="App-Erscheinungsbild"
          description="
            MGB Connect verwendet aktuell das zentrale
            Dark-Interface mit Amber-Akzenten.
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
            "
          >
            <div className="flex items-center justify-between gap-5">
              <div>
                <p className="font-semibold text-white">
                  MGB Connect Dark
                </p>

                <p className="mt-1 text-sm text-white/45">
                  Das Erscheinungsbild wird zentral über das
                  bestehende Design-System gesteuert.
                </p>
              </div>

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-amber-400/20
                  bg-amber-400/10
                  text-amber-300
                "
              >
                <Palette size={18} />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ====================================================
            DATABASE / FUTURE
        ==================================================== */}

        <SettingsSection
          icon={<Database size={21} />}
          eyebrow="System"
          title="Daten & Benutzerverwaltung"
          description="
            Die aktuelle Version arbeitet noch mit der
            Entwicklungsdatenstruktur. Der nächste große
            Schritt ist die Verbindung mit Supabase.
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-blue-400/20
              bg-blue-400/[0.07]
              p-5
            "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-400/15
                  bg-blue-400/10
                  text-blue-300
                "
              >
                <Shield size={20} />
              </div>

              <div>
                <p className="font-semibold text-white">
                  Bereit für Supabase
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Die Rollenstruktur ist bereits vorbereitet.
                  Später werden Benutzer, Rollen, Dienste,
                  Punkte und Tauschvorgänge dauerhaft in der
                  Datenbank gespeichert.
                </p>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ====================================================
            APP INFO
        ==================================================== */}

        <div
          className="
            mt-10
            flex
            items-center
            gap-4
            rounded-2xl
            border
            border-white/10
            bg-white/[0.025]
            p-5
            text-white/40
          "
        >
          <Settings2
            size={19}
            className="shrink-0"
          />

          <p className="text-sm leading-6">
            Einstellungen werden in der finalen Version mit
            deinem persönlichen Benutzerkonto verbunden.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   SETTINGS SECTION
=============================================================== */

function SettingsSection({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        mt-8
        rounded-[30px]
        border
        border-white/10
        bg-white/[0.045]
        p-6
        backdrop-blur-2xl
        sm:p-7
      "
    >
      <div className="flex items-start gap-4">
        <div
          className="
            flex
            h-11
            w-11
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
          {icon}
        </div>

        <div>
          <p
            className="
              text-sm
              uppercase
              tracking-[0.18em]
              text-white/40
            "
          >
            {eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            {title}
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              leading-7
              text-white/55
            "
          >
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}