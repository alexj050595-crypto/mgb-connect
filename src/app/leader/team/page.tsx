"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  User,
  Users,
  ShieldCheck,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import { useRole } from "@/context/RoleContext";

const demoMembers = [
  {
    name: "Tim Mustermann",
    role: "Messdiener",
    status: "Aktiv",
  },
  {
    name: "Max Mustermann",
    role: "Messdiener",
    status: "Aktiv",
  },
  {
    name: "Anna Beispiel",
    role: "Leiter",
    status: "Leitung",
  },
  {
    name: "Thomas Leiter",
    role: "Leiter",
    status: "Leitung",
  },
];

export default function LeaderTeamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isLeader } = useRole();

  if (!isLeader) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Background />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              Kein Zugriff
            </h1>

            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 text-white/50 hover:text-white"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
          max-w-6xl
          px-6
          pb-12
          pt-36
        "
      >
        <Link
          href="/leader"
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
          Leiterbereich
        </Link>

        <div className="mb-10">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.22em]
              text-amber-300/80
            "
          >
            Leitung
          </p>

          <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
            Messdiener
          </h1>

          <p className="mt-3 max-w-2xl text-lg leading-8 text-white/60">
            Übersicht über die Mitglieder der MGB und
            deren aktuellen Status.
          </p>
        </div>

        <div
          className="
            mb-8
            flex
            items-center
            gap-4
            rounded-[28px]
            border
            border-white/10
            bg-white/[0.045]
            p-6
            backdrop-blur-2xl
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-amber-400/15
              bg-amber-400/10
              text-amber-300
            "
          >
            <Users size={22} />
          </div>

          <div>
            <p className="text-sm text-white/40">
              Mitglieder
            </p>

            <p className="text-2xl font-black text-white">
              {demoMembers.length}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {demoMembers.map((member) => (
            <div
              key={member.name}
              className="
                flex
                items-center
                justify-between
                rounded-[24px]
                border
                border-white/10
                bg-white/[0.045]
                p-5
                backdrop-blur-2xl
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    text-white/45
                  "
                >
                  <User size={20} />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {member.name}
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    {member.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="
                    rounded-full
                    border
                    border-emerald-400/20
                    bg-emerald-400/10
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-emerald-300
                  "
                >
                  {member.status}
                </span>

                <ArrowUpRight
                  size={17}
                  className="text-white/20"
                />
              </div>
            </div>
          ))}
        </div>

        <div
          className="
            mt-8
            rounded-[26px]
            border
            border-white/10
            bg-white/[0.035]
            p-5
          "
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-blue-300"
            />

            <p className="text-sm leading-6 text-white/45">
              Diese Ansicht dient aktuell nur der
              Übersicht. Das Bearbeiten von Mitgliedern,
              Rollen und Accounts wird später ausschließlich
              über die dafür vorgesehenen
              Verwaltungsrechte möglich sein.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}