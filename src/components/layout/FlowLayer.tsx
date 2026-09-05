"use client";

import { motion } from "framer-motion";

export default function FlowLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* Hauptfluss */}

      <motion.div
        animate={{
          x: [-35, 35, -35],
          y: [18, -14, 18],
          rotate: [-2.5, 2.5, -2.5],
        }}
        transition={{
          duration: 42,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -left-[18%]
          bottom-[-18%]
          w-[150%]
          h-[58%]
          rounded-[999px]
        "
        style={{
          background: `
            linear-gradient(
              92deg,
              #5a3400 0%,
              #8a4d00 18%,
              #b96d00 42%,
              #d88c00 68%,
              #c97a00 82%,
              #8a4d00 100%
            )
          `,
          filter: "blur(85px)",
          opacity: 0.92,
        }}
      />

      {/* Oberer weicher Strang */}

      <motion.div
        animate={{
          x: [22, -22, 22],
          y: [-14, 12, -14],
          rotate: [2, -2, 2],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -left-[8%]
          bottom-[7%]
          w-[135%]
          h-[28%]
          rounded-[999px]
        "
        style={{
          background:
            "linear-gradient(90deg,#6c3d00,#b66b00,#d99212,#c17400)",
          filter: "blur(70px)",
          opacity: 0.55,
        }}
      />

      {/* Unterer Schattenstrang */}

      <motion.div
        animate={{
          x: [-20, 18, -20],
          y: [12, -10, 12],
        }}
        transition={{
          duration: 46,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -left-[22%]
          bottom-[-24%]
          w-[155%]
          h-[40%]
          rounded-[999px]
        "
        style={{
          background:
            "linear-gradient(90deg,#3a2200,#6a3d00,#935600,#6a3d00)",
          filter: "blur(90px)",
          opacity: 0.42,
        }}
      />

    </div>
  );
}