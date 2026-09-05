"use client";

import { Menu, Bell, CircleUserRound } from "lucide-react";

type TopbarProps = {
  onMenuClick: () => void;
  sidebarOpen: boolean;
};

export default function Topbar({
  onMenuClick,
  sidebarOpen,
}: TopbarProps) {
  return (
    <header
      className="
        fixed
        top-0
        left-0
        right-0
        z-40
        flex
        items-center
        justify-between
        h-20
        px-8
        pointer-events-none
      "
    >
      <div className="flex items-center gap-5 pointer-events-auto">

        <button
          onClick={onMenuClick}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all
            duration-200
            hover:bg-white/10
            hover:shadow-[0_0_18px_rgba(255,185,60,.15)]
          "
        >
          <Menu size={22} color="white" />
        </button>

        {!sidebarOpen && (
          <h2 className="text-2xl font-bold tracking-tight text-white">
            MGB Connect
          </h2>
        )}
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">

        <button
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all
            duration-200
            hover:bg-white/10
          "
        >
          <Bell size={19} color="white" />
        </button>

        <button
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-xl
            transition-all
            duration-200
            hover:bg-white/10
          "
        >
          <CircleUserRound size={21} color="white" />
        </button>

      </div>
    </header>
  );
}