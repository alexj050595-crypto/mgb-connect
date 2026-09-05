"use client";

import {
  CheckCircle2,
  Trophy,
  X,
} from "lucide-react";

type TakeServiceDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceTitle: string;
  points: number;
};

export default function TakeServiceDialog({
  open,
  onClose,
  onConfirm,
  serviceTitle,
  points,
}: TakeServiceDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      {/* Overlay */}
      <button
        aria-label="Dialog schließen"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-black/65
          backdrop-blur-sm
        "
      />

      {/* Dialog */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-lg
          overflow-hidden
          rounded-[28px]
          border
          border-white/10
          bg-[#0b0b0b]/95
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]
          backdrop-blur-2xl
        "
      >
        {/* Header */}
        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-white/10
            p-6
          "
        >
          <div>
            <div
              className="
                mb-3
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-emerald-400/10
              "
            >
              <CheckCircle2
                size={22}
                className="text-emerald-300"
              />
            </div>

            <h2 className="text-2xl font-bold text-white">
              Dienst übernehmen?
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/55">
              Du möchtest diesen Dienst übernehmen.
              Die Übernahme wird anschließend als Anfrage
              registriert.
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/5
              text-white/60
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Inhalt */}
        <div className="p-6">
          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.045]
              p-5
            "
          >
            <p className="text-sm text-white/50">
              Dienst
            </p>

            <h3 className="mt-1 text-xl font-bold text-white">
              {serviceTitle}
            </h3>

            <div className="mt-4 flex items-center gap-2 text-amber-300">
              <Trophy size={18} />

              <span className="font-semibold">
                {points} Punkte
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/50">
            Mit der Übernahme hilfst du einem anderen
            Messdiener aus und kannst die Punkte für diesen
            Dienst erhalten.
          </p>

          {/* Aktionen */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={onClose}
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                px-5
                py-4
                font-semibold
                text-white/75
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              Abbrechen
            </button>

            <button
              onClick={onConfirm}
              className="
                rounded-2xl
                border
                border-emerald-400/20
                bg-emerald-400/10
                px-5
                py-4
                font-semibold
                text-emerald-200
                transition
                hover:bg-emerald-400/15
              "
            >
              Dienst übernehmen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}