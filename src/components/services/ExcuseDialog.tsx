"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

import { ExcuseReason } from "@/data/services";

type ExcuseDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: ExcuseReason) => void;
};

const reasons: ExcuseReason[] = [
  "Krankheit",
  "Familie",
  "Schule",
  "Urlaub",
  "Sonstiges",
];

export default function ExcuseDialog({
  open,
  onClose,
  onConfirm,
}: ExcuseDialogProps) {
  const [selectedReason, setSelectedReason] =
    useState<ExcuseReason>(reasons[0]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            transition={{ duration: 0.18 }}
            className="
              fixed
              left-1/2
              top-1/2
              z-[100]
              w-[92vw]
              max-w-lg
              -translate-x-1/2
              -translate-y-1/2
              rounded-[28px]
              border
              border-white/10
              bg-[#0a0a0a]/95
              p-6
              backdrop-blur-2xl
            "
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-red-300/80">
                  Abmeldung
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Dienst absagen
                </h2>

                <p className="mt-2 text-white/60">
                  Eine Abmeldung sollte nur erfolgen, wenn du wirklich
                  verhindert bist. Wähle einen Grund aus.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  p-2
                  transition
                  hover:bg-white/10
                "
              >
                <X
                  className="text-white"
                  size={18}
                />
              </button>
            </div>

            {/* Gründe */}
            <div className="mt-6 space-y-3">
              {reasons.map((reason) => {
                const selected =
                  selectedReason === reason;

                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() =>
                      setSelectedReason(reason)
                    }
                    className={`
                      w-full
                      rounded-2xl
                      border
                      px-4
                      py-3
                      text-left
                      transition
                      ${
                        selected
                          ? "border-red-400/30 bg-red-400/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-white/85 hover:border-red-400/20 hover:bg-red-400/10"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{reason}</span>

                      {selected && (
                        <Check
                          size={18}
                          className="text-red-300"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Aktionen */}
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={() =>
                  onConfirm(selectedReason)
                }
                className="
                  rounded-2xl
                  border
                  border-red-400/20
                  bg-red-400/10
                  px-4
                  py-3
                  font-semibold
                  text-red-300
                  transition
                  hover:bg-red-400/15
                "
              >
                Abmeldung bestätigen
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}