"use client";

import { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  value?: string;
  subtitle?: string;
  icon?: ReactNode;
  status?: string;
  children?: ReactNode;
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  status,
  children,
}: DashboardCardProps) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/10
        bg-white/[0.045]
        backdrop-blur-2xl
        p-6
        transition-all
        duration-300
        hover:border-amber-400/20
        hover:bg-white/[0.06]
        hover:shadow-[0_0_40px_rgba(255,180,50,0.08)]
      "
    >
      {/* Ambient Glow */}
      <div
        className="
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
        style={{
          background:
            "radial-gradient(circle at top right, rgba(255,180,40,.08), transparent 65%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10 text-amber-300">
                {icon}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
                {title}
              </p>
            </div>
          </div>

          {status && (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              {status}
            </span>
          )}
        </div>

        {/* Value */}
        {value && (
          <div className="mt-6">
            <h2 className="text-4xl font-black tracking-tight text-white">
              {value}
            </h2>

            {subtitle && (
              <p className="mt-2 text-sm text-white/55">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children && (
          <div className="mt-6 flex-1">
            {children}
          </div>
        )}

        {/* Bottom Divider */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="mt-4 flex items-center justify-between text-sm text-white/45">
          <span>Aktualisiert</span>
          <span>Gerade eben</span>
        </div>
      </div>
    </div>
  );
}