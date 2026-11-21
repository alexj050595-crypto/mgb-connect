"use client";

import Link from "next/link";
import { Menu, Bell, CircleUserRound } from "lucide-react";

type TopbarProps = {
  onMenuClick: () => void;
  sidebarOpen: boolean;
};

export default function Topbar({ onMenuClick, sidebarOpen }: TopbarProps) {
  const actionClassName =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:border-amber-400/20 hover:bg-amber-400/10 hover:shadow-[0_0_18px_rgba(255,185,60,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] sm:h-11 sm:w-11 sm:rounded-2xl";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[calc(4rem+env(safe-area-inset-top))] items-end justify-between px-[max(1rem,env(safe-area-inset-left))] pb-2 pt-[env(safe-area-inset-top)] pr-[max(1rem,env(safe-area-inset-right))] pointer-events-none sm:h-20 sm:px-8 sm:pb-0 sm:pt-0">
      <div className="flex min-w-0 items-center gap-3 pointer-events-auto sm:gap-5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Menü öffnen"
          aria-expanded={sidebarOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:shadow-[0_0_18px_rgba(255,185,60,.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] sm:h-11 sm:w-11 sm:rounded-2xl"
        >
          <Menu size={21} className="text-white" />
        </button>

        {!sidebarOpen && (
          <h2 className="truncate text-lg font-bold tracking-tight text-white sm:text-2xl">
            MGB Connect
          </h2>
        )}
      </div>

      <nav
        aria-label="Schnellnavigation"
        className="flex shrink-0 items-center gap-2 pointer-events-auto sm:gap-4"
      >
        <Link
          href="/news"
          aria-label="Benachrichtigungen und Neuigkeiten öffnen"
          title="Benachrichtigungen"
          className={actionClassName}
        >
          <Bell size={18} className="text-white sm:h-[19px] sm:w-[19px]" />
        </Link>

        <Link
          href="/profile"
          aria-label="Mein Profil öffnen"
          title="Mein Profil"
          className={actionClassName}
        >
          <CircleUserRound
            size={20}
            className="text-white sm:h-[21px] sm:w-[21px]"
          />
        </Link>
      </nav>
    </header>
  );
}
