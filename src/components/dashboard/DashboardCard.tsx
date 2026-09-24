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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl transition-all duration-300 hover:border-amber-400/20 hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(255,180,50,0.08)] sm:rounded-[28px] sm:p-6">
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background:"radial-gradient(circle at top right, rgba(255,180,40,.08), transparent 65%)" }}
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/10 text-amber-300 sm:h-11 sm:w-11 sm:rounded-2xl">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-white/40 sm:text-sm sm:tracking-[0.18em]">
                {title}
              </p>
            </div>
          </div>

          {status && (
            <span className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 sm:px-3 sm:text-xs">
              {status}
            </span>
          )}
        </div>

        {value && (
          <div className="mt-5 sm:mt-6">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              {value}
            </h2>
            {subtitle && <p className="mt-2 text-sm text-white/55">{subtitle}</p>}
          </div>
        )}

        {children && <div className="mt-5 flex-1 sm:mt-6">{children}</div>}

        <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent sm:mt-6" />

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/45 sm:mt-4 sm:text-sm">
          <span>Aktualisiert</span>
          <span>Gerade eben</span>
        </div>
      </div>
    </div>
  );
}