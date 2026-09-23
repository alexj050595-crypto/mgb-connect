"use client";

import { Menu, Bell, CircleUserRound } from "lucide-react";

type TopbarProps = {
  onMenuClick: () => void;
  sidebarOpen: boolean;
};

export default function Topbar({ onMenuClick, sidebarOpen }: TopbarProps) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 flex h-[calc(4rem+env(safe-area-inset-top))] items-end justify-between px-4 pb-2 pt-[env(safe-area-inset-top)] sm:h-20 sm:px-8 sm:pb-0 sm:pt-0 pointer-events-none"
    >
      <div className="flex items-center gap-3 sm:gap-5 pointer-events-auto">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Menü öffnen"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:shadow-[0_0_18px_rgba(255,185,60,.15)] sm:h-11 sm:w-11 sm:rounded-2xl"
        >
          <Menu size={21} className="text-white" />
        </button>

        {!sidebarOpen && (
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-2xl">
            MGB Connect
          </h2>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
        <button
          type="button"
          aria-label="Benachrichtigungen"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 sm:h-11 sm:w-11 sm:rounded-2xl"
        >
          <Bell size={18} className="text-white sm:h-[19px] sm:w-[19px]" />
        </button>

        <button
          type="button"
          aria-label="Profil"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 sm:h-11 sm:w-11 sm:rounded-2xl"
        >
          <CircleUserRound size={20} className="text-white sm:h-[21px] sm:w-[21px]" />
        </button>
      </div>
    </header>
  );
}
