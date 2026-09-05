"use client";

import {
  RefreshCcw,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type ExchangeDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ExchangeDialog({
  open,
  onClose,
  onConfirm,
}: ExchangeDialogProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        px-5
        py-6
      "
    >
      {/* ======================================================
          OVERLAY
      ====================================================== */}

      <button
        type="button"
        aria-label="Dialog schließen"
        onClick={onClose}
        className="
          absolute
          inset-0
          cursor-default
          bg-black/60
          backdrop-blur-sm
        "
      />

      {/* ======================================================
          DIALOG
      ====================================================== */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exchange-dialog-title"
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
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-5
            border-b
            border-white/10
            p-6
          "
        >
          <div>
            <div
              className="
                mb-4
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                border
                border-amber-400/15
                bg-amber-400/10
              "
            >
              <RefreshCcw
                size={21}
                className="text-amber-300"
              />
            </div>

            <h2
              id="exchange-dialog-title"
              className="
                text-2xl
                font-bold
                tracking-tight
                text-white
              "
            >
              Dienst freigeben?
            </h2>

            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-6
                text-white/55
              "
            >
              Dein Dienst wird für andere Messdiener in der
              Tauschbörse als offen angezeigt.
            </p>
          </div>

          <button
            type="button"
            aria-label="Dialog schließen"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
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
              focus:outline-none
              focus:ring-2
              focus:ring-amber-300/30
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ====================================================
            INHALT
        ==================================================== */}

        <div className="p-6">
          {/* --------------------------------------------------
              INFORMATION
          -------------------------------------------------- */}

          <div
            className="
              rounded-2xl
              border
              border-amber-400/15
              bg-amber-400/[0.07]
              p-4
            "
          >
            <div className="flex gap-3">
              <CheckCircle2
                size={20}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-300
                "
              />

              <div>
                <p className="font-semibold text-white">
                  Keine 1:1-Verpflichtung
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-white/60
                  "
                >
                  Du musst keinen anderen Dienst im Gegenzug
                  übernehmen. Jeder passende Messdiener kann
                  deinen freigegebenen Dienst übernehmen.
                </p>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------
              STATUSWECHSEL
          -------------------------------------------------- */}

          <div
            className="
              mt-4
              flex
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-4
            "
          >
            <AlertCircle
              size={19}
              className="
                mt-0.5
                shrink-0
                text-white/40
              "
            />

            <div>
              <p className="text-sm font-semibold text-white/80">
                Was passiert danach?
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-white/50
                "
              >
                Dein Dienst erhält den Status
                <span className="font-semibold text-amber-200">
                  {" "}
                  „Vertretung gesucht“
                </span>
                {" "}und erscheint anschließend in der
                Tauschbörse.
              </p>
            </div>
          </div>

          {/* ==================================================
              AKTIONEN
          ================================================== */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
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
                focus:outline-none
                focus:ring-2
                focus:ring-white/20
              "
            >
              Abbrechen
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="
                rounded-2xl
                border
                border-amber-300/20
                bg-amber-400/15
                px-5
                py-4
                font-semibold
                text-amber-100
                shadow-[0_0_24px_rgba(255,180,40,0.08)]
                transition
                hover:bg-amber-400/20
                hover:shadow-[0_0_28px_rgba(255,180,40,0.14)]
                focus:outline-none
                focus:ring-2
                focus:ring-amber-300/40
              "
            >
              Dienst freigeben
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}