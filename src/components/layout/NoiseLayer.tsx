"use client";

export default function NoiseLayer() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.02,
        backgroundImage: `
          radial-gradient(rgba(255,255,255,.08) .7px, transparent .8px)
        `,
        backgroundSize: "26px 26px",
        mixBlendMode: "soft-light",
      }}
    />
  );
}