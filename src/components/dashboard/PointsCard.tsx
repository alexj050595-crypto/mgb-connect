"use client";

import Link from "next/link";
import { Trophy, ArrowUpRight } from "lucide-react";

import { useServices } from "@/context/ServiceContext";

export default function PointsCard() {
  const { getTotalPoints, getCompletedPoints } =
    useServices();

  const totalPoints = getTotalPoints();
  const completedPoints = getCompletedPoints();

  return (
    <Link
      href="/points"
      className="
        group
        flex
        h-full
        min-h-[320px]
        flex-col
        rounded-[28px]
        border
        border-white/10
        bg-white/[0.045]
        p-6
        backdrop-blur-2xl
        transition
        duration-200
        hover:border-amber-400/20
        hover:bg-white/[0.06]
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-start justify-between">
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
          <Trophy size={22} />
        </div>

        <ArrowUpRight
          size={19}
          className="
            text-white/25
            transition
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:text-amber-300
          "
        />
      </div>

      {/* ======================================================
          TITEL
      ====================================================== */}

      <div className="mt-8">
        <p
          className="
            text-sm
            uppercase
            tracking-[0.18em]
            text-white/40
          "
        >
          Punktestand
        </p>

        <div className="mt-2 flex items-end gap-2">
          <span
            className="
              text-5xl
              font-black
              tracking-tight
              text-white
            "
          >
            {totalPoints}
          </span>

          <span className="mb-1 text-sm text-white/40">
            Punkte
          </span>
        </div>
      </div>

      {/* ======================================================
          INFO
      ====================================================== */}

      <div className="mt-auto pt-8">
        <div
          className="
            rounded-2xl
            border
            border-white/8
            bg-white/[0.03]
            p-4
          "
        >
          <p className="text-sm text-white/45">
            Durch abgeschlossene Dienste
          </p>

          <p className="mt-1 text-lg font-semibold text-white">
            {completedPoints} Punkte verdient
          </p>
        </div>

        <p
          className="
            mt-4
            text-sm
            text-white/40
            transition
            group-hover:text-white/60
          "
        >
          Punktestand öffnen
        </p>
      </div>
    </Link>
  );
}