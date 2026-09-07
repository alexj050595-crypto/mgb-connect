"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import Background from "@/components/layout/Background";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-36">
        <Users size={32} className="text-amber-300" />

        <p className="mt-6 text-sm uppercase tracking-[0.22em] text-amber-300/80">
          Administration
        </p>

        <h1 className="mt-2 text-5xl font-black text-white">
          Benutzerverwaltung
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-7 text-white/60">
          Dieser Bereich wird im nächsten Schritt mit
          Supabase Auth und der Benutzer-Datenbank verbunden.
        </p>
      </section>
    </main>
  );
}