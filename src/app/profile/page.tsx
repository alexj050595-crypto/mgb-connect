"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Trophy,
  User,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useServices } from "@/context/ServiceContext";
import { useRole } from "@/context/RoleContext";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { services } = useServices();
  const { roleLabel } = useRole();

  const completedServices = useMemo(() => {
    return services.filter(
      (service) => service.status === "completed"
    );
  }, [services]);

  const totalPoints = useMemo(() => {
    return completedServices.reduce(
      (total, service) => total + service.points,
      0
    );
  }, [completedServices]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

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
            Profil
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
            Mein Profil
          </h1>

          <p className="mt-3 text-lg text-white/60">
            Deine persönliche Übersicht bei MGB Connect.
          </p>
        </div>

        {/* PROFILKARTE */}

        <div
          className="
            rounded-[30px]
            border
            border-white/10
            bg-white/[0.05]
            p-7
            backdrop-blur-2xl
          "
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className="
                flex
                h-20
                w-20
                shrink-0
                items-center
                justify-center
                rounded-[24px]
                border
                border-amber-400/20
                bg-amber-400/10
                text-amber-300
              "
            >
              <User size={34} />
            </div>

            <div>
              <h2 className="text-3xl font-black text-white">
                Mein Account
              </h2>

              <p className="mt-2 text-white/50">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>

        {/* STATISTIK */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ProfileStat
            icon={<Trophy size={20} />}
            value={totalPoints}
            label="Gesamtpunkte"
          />

          <ProfileStat
            icon={<CheckCircle2 size={20} />}
            value={completedServices.length}
            label="Abgeschlossene Dienste"
          />

          <ProfileStat
            icon={<CalendarDays size={20} />}
            value={services.length}
            label="Dienste insgesamt"
          />
        </div>

        {/* ACCOUNTINFORMATIONEN */}

        <div
          className="
            mt-10
            rounded-[30px]
            border
            border-white/10
            bg-white/[0.045]
            p-7
            backdrop-blur-2xl
          "
        >
          <p
            className="
              text-sm
              uppercase
              tracking-[0.18em]
              text-white/40
            "
          >
            Account
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Accountinformationen
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-white/55">
            Weitere persönliche Informationen und
            Kontoeinstellungen werden später mit der
            Benutzerverwaltung und Supabase verbunden.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   PROFIL STATISTIK
=============================================================== */

function ProfileStat({
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
      <div className="flex items-center gap-2 text-amber-300">
        {icon}

        <span className="text-sm text-white/45">
          {label}
        </span>
      </div>

      <p className="mt-4 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}