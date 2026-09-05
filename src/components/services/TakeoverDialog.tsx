"use client";

import {
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

type TakeoverDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function TakeoverDialog({
  open,
  onClose,
  onConfirm,
}: TakeoverDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        px-6
        backdrop-blur-md
      "
      onMouseDown={onClose}
    >
      <div
        className="
          w-full
          max-w-md
          rounded-[28px]
          border
          border-white/10
          bg-[#0b0b0b]/95
          p-6
          shadow-2xl
          backdrop-blur-2xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex items-start justify-between gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-amber-400/20
              bg-amber-400/10
              text-amber-300
            "
          >
            <AlertTriangle size={23} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-white/40
              transition
              hover:bg-white/5
              hover:text-white
            "
            aria-label="Dialog schließen"
          >
            <X size={19} />
          </button>
        </div>

        {/* ====================================================
            TEXT
        ==================================================== */}

        <div className="mt-6">
          <p
            className="
              text-sm
              uppercase
              tracking-[0.18em]
              text-amber-300/80
            "
          >
            Dienst übernehmen
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-white
            "
          >
            Möchtest du diesen Dienst wirklich übernehmen?
          </h2>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-white/60
            "
          >
            Mit der Bestätigung stellst du eine
            Übernahmeanfrage für diesen Dienst. Die Anfrage
            wird anschließend gespeichert und muss gegebenenfalls
            noch von der Leitung bestätigt werden.
          </p>
        </div>

        {/* ====================================================
            HINWEIS
        ==================================================== */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-blue-400/15
            bg-blue-400/[0.07]
            px-4
            py-3
          "
        >
          <p
            className="
              text-sm
              leading-6
              text-blue-200/80
            "
          >
            Prüfe vor der Bestätigung bitte noch einmal Datum
            und Uhrzeit des Dienstes.
          </p>
        </div>

        {/* ====================================================
            AKTIONEN
        ==================================================== */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-5
              py-3.5
              text-sm
              font-semibold
              text-white/70
              transition
              hover:border-white/15
              hover:bg-white/[0.07]
              hover:text-white
            "
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-amber-400/25
              bg-amber-400/10
              px-5
              py-3.5
              text-sm
              font-semibold
              text-amber-200
              transition
              hover:border-amber-400/40
              hover:bg-amber-400/15
              hover:text-amber-100
            "
          >
            <CheckCircle2 size={18} />

            Ja, übernehmen
          </button>
        </div>
      </div>
    </div>
  );
}