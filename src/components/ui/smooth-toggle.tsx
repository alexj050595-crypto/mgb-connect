'use client';

import { motion } from "framer-motion";

interface SmoothToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}

export default function SmoothToggle({
  checked,
  onChange,
  label,
  disabled = false,
}: SmoothToggleProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className="relative h-8 w-[54px] shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
      animate={{
        backgroundColor: checked ? "rgba(251, 191, 36, 0.16)" : "rgba(255, 255, 255, 0.05)",
        borderColor: checked ? "rgba(251, 191, 36, 0.38)" : "rgba(255, 255, 255, 0.12)",
      }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ borderWidth: 1 }}
    >
      <motion.span
        className="absolute left-[3px] top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full"
        animate={{
          x: checked ? 22 : 0,
          backgroundColor: checked ? "#fcd34d" : "rgba(255, 255, 255, 0.28)",
          boxShadow: checked
            ? "0 2px 10px rgba(251, 191, 36, 0.28), inset 1px 1px 2px rgba(255,255,255,0.45)"
            : "0 2px 8px rgba(0, 0, 0, 0.22), inset 1px 1px 2px rgba(255,255,255,0.12)",
        }}
        transition={{
          x: { type: "spring", stiffness: 420, damping: 24, mass: 0.7 },
          backgroundColor: { duration: 0.18 },
          boxShadow: { duration: 0.2 },
        }}
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-white/70"
          animate={{ opacity: checked ? 0.95 : 0.35, scale: checked ? 1 : 0.85 }}
          transition={{ duration: 0.18 }}
        />
      </motion.span>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2px] rounded-full"
        animate={{ opacity: checked ? 0.8 : 0.35 }}
        transition={{ duration: 0.2 }}
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.18), transparent 42%, rgba(0,0,0,0.12))",
          mixBlendMode: "overlay",
        }}
      />
    </motion.button>
  );
}
