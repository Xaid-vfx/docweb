"use client";

import { useEffect, useRef } from "react";

export default function ECGLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let offset = 0;

    // ECG-like waveform pattern
    const drawECG = (x: number, h: number): number => {
      const cycle = 200;
      const phase = ((x + offset) % cycle) / cycle;

      if (phase < 0.1) return h / 2; // baseline
      if (phase < 0.15) return h / 2 - h * 0.08; // small P wave up
      if (phase < 0.2) return h / 2; // back
      if (phase < 0.22) return h / 2 + h * 0.06; // Q dip
      if (phase < 0.28) return h / 2 - h * 0.38; // R spike up
      if (phase < 0.32) return h / 2 + h * 0.12; // S dip
      if (phase < 0.38) return h / 2; // baseline
      if (phase < 0.48) return h / 2 - h * 0.06; // T wave
      return h / 2; // baseline
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Glow effect
      ctx.shadowColor = "#e63946";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "rgba(230, 57, 70, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y = drawECG(x, height);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second pass – brighter core
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(230, 57, 70, 1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = drawECG(x, height);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += 1.2;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: 60, display: "block" }}
    />
  );
}
