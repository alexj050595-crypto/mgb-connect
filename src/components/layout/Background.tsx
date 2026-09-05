"use client";

import "./background.css";

export default function Background() {
  return (
    <div className="mgb-background">

      <div className="mgb-background__flow">

        <div className="mgb-flow mgb-flow-1" />
        <div className="mgb-flow mgb-flow-2" />
        <div className="mgb-flow mgb-flow-3" />

        <div className="mgb-glow mgb-glow-left" />
        <div className="mgb-glow mgb-glow-right" />

      </div>

      <div className="mgb-noise" />

      <div className="mgb-vignette" />

    </div>
  );
}