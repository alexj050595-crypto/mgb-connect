"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  RefreshCcw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useServices } from "@/context/ServiceContext";

export default function ExchangeCard() {
  const { services } = useServices();

  /*
   * Der Dashboard-Status wird erst nach dem Client-Mount
   * aus dem ServiceContext dargestellt.
   *
   * Dadurch bleibt der erste Server-Render stabil und
   * React bekommt auf Server und Client dieselbe
   * initiale Struktur.
   */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Stabiler SSR-/Hydration-Platzhalter.
   *
   * Die Karte besitzt bereits dieselbe Größe wie im
   * späteren Zustand.
   */
  if (!mounted) {
    return (
      <div
        className="
          h-full
          min-h-[320px]
          rounded-[28px]
          border
          border-white/10
          bg-white/[0.045]
          p-6
          backdrop-blur-2xl
        "
      />
    );
  }

  /*
   * Dienste, die aktuell in der Tauschbörse
   * zur Übernahme angeboten werden.
   */
  const openServices = services.filter(
    (service) =>
      service.status === "exchange_requested"
  );

  const openCount = openServices.length;

  return (
    <Link
      href="/exchange"
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
        transition-all
        duration-200
        hover:border-amber-400/20
        hover:bg-white/[0.06]
      "
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-amber-300/80">
            Tauschbörse
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Dienste übernehmen
          </h2>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-amber-400/15
            bg-amber-400/10
            text-amber-300
            transition
            group-hover:bg-amber-400/15
          "
        >
          <RefreshCcw size={19} />
        </div>
      </div>

      {/* =========================================================
          STATUS
      ========================================================= */}

      <div className="mt-7">
        {openCount > 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-amber-400/20
              bg-amber-400/10
              p-5
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-400/10
                  text-amber-300
                "
              >
                <RefreshCcw size={19} />
              </div>

              <div>
                <p className="text-2xl font-black text-white">
                  {openCount}
                </p>

                <p className="text-sm text-amber-200/70">
                  {openCount === 1
                    ? "offener Dienst"
                    : "offene Dienste"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/55">
              Aktuell suchen andere Messdiener eine
              Vertretung. Du kannst dir einfach einen
              passenden Dienst aussuchen.
            </p>
          </div>
        ) : (
          <div
            className="
              rounded-2xl
              border
              border-emerald-400/20
              bg-emerald-400/10
              p-5
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-400/10
                  text-emerald-300
                "
              >
                <CheckCircle2 size={19} />
              </div>

              <div>
                <p className="font-bold text-white">
                  Alles ruhig
                </p>

                <p className="text-sm text-emerald-200/70">
                  Keine offenen Dienste
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-white/55">
              Aktuell sucht niemand eine Vertretung.
              Du kannst später wieder vorbeischauen.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/45">
            Tauschbörse öffnen
          </span>

          <ArrowRight
            size={18}
            className="
              text-white/30
              transition
              group-hover:translate-x-1
              group-hover:text-white/70
            "
          />
        </div>
      </div>
    </Link>
  );
}