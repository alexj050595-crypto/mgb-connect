"use client";

export default function Vignette() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(
            ellipse at center,
            rgba(0,0,0,0) 45%,
            rgba(0,0,0,0.15) 70%,
            rgba(0,0,0,0.55) 100%
          )
        `,
      }}
    />
  );
}