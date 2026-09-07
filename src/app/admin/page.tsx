"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Megaphone,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            Admin-Bereich
          </h1>

          <p className="mt-3 text-lg text-white/60">
            Verwalte Benutzer, Rollen und wichtige
            Bereiche von MGB Connect.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AdminLink
            href="/admin/users"
            icon={<Users size={22} />}
            title="Benutzerverwaltung"
            text="Benutzer und Accounts verwalten."
          />

          <AdminLink
            href="/admin/roles"
            icon={<Shield size={22} />}
            title="Rollen"
            text="Berechtigungen und Rollenübersicht."
          />

          <AdminLink
            href="/admin/announcements"
            icon={<Megaphone size={22} />}
            title="Ankündigungen"
            text="Informationen für die Gruppe veröffentlichen."
          />

          <AdminLink
            href="/admin/settings"
            icon={<Settings size={22} />}
            title="System"
            text="Zentrale Einstellungen von MGB Connect."
          />
        </div>
      </section>
    </main>
  );
}

function AdminLink({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-[28px]
        border
        border-white/10
        bg-white/[0.045]
        p-6
        backdrop-blur-2xl
        transition
        hover:border-amber-400/20
        hover:bg-white/[0.06]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="
            flex
            h-12
            w-12
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

        <ArrowUpRight
          size={19}
          className="
            text-white/25
            transition
            group-hover:text-amber-300
          "
        />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-white/50">
        {text}
      </p>
    </Link>
  );
}