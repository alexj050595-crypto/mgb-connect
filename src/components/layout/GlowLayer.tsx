"use client";

import { motion } from "framer-motion";

export default function GlowLayer() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        x: [-18, 18, -18],
        y: [10, -8, 10],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 48,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Hauptglow */}

      <div
        className="
          absolute
          -left-[15%]
          bottom-[-15%]
          w-[90vw]
          h-[60vw]
          rounded-full
        "
        style={{
          background:
            "radial-gradient(circle, rgba(255,175,60,.28) 0%, rgba(255,175,60,.10) 45%, transparent 100%)",
          filter: "blur(100px)",
        }}
      />

      {/* Kleiner Glow */}

      <div
        className="
          absolute
          right-[-8%]
          bottom-[5%]
          w-[45vw]
          h-[45vw]
          rounded-full
        "
        style={{
          background:
            "radial-gradient(circle, rgba(255,205,120,.18) 0%, transparent 72%)",
          filter: "blur(90px)",
        }}
      />
    </motion.div>
  );
}