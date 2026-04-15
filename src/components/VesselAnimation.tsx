"use client";

import { useEffect, useRef, useCallback } from "react";

export default function VesselAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const heartImgRef = useRef<HTMLImageElement | null>(null);

  // Race cycle state
  const cycleRef = useRef({
    stiffProgress: 0,
    elasticProgress: 0,
    stiffDone: false,
    elasticDone: false,
    stiffTime: 0,
    elasticTime: 0,
    cycleTimer: 0,
    paused: false,
    pauseTimer: 0,
  });

  useEffect(() => {
    const img = new Image();
    img.src = "/heart-diagram.svg";
    img.onload = () => { heartImgRef.current = img; };
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Draw 3D vessel tube                                                */
  /* ------------------------------------------------------------------ */
  const drawVessel3D = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x1: number,
      centerY: number,
      length: number,
      baseInnerR: number,
      wallThick: number,
      time: number,
      isStiff: boolean,
      arrowProgress: number // 0→1, leading edge of the arrow wave
    ) => {
      const numPts = 300;
      const dx = length / numPts;

      const getInnerR = (i: number): number => {
        if (isStiff) return baseInnerR;
        const progress = i / numPts;
        const wave = Math.sin(progress * Math.PI * 3 - time * 1.5);
        return baseInnerR + wave * baseInnerR * 0.48;
      };

      const topOuter: [number, number][] = [];
      const topInner: [number, number][] = [];
      const botInner: [number, number][] = [];
      const botOuter: [number, number][] = [];

      for (let i = 0; i <= numPts; i++) {
        const x = x1 + i * dx;
        const ir = getInnerR(i);
        const or_ = ir + wallThick;
        topOuter.push([x, centerY - or_]);
        topInner.push([x, centerY - ir]);
        botInner.push([x, centerY + ir]);
        botOuter.push([x, centerY + or_]);
      }

      const tracePath = (pts: [number, number][]) => {
        pts.forEach(([px, py], idx) =>
          idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        );
      };

      // Blood interior
      ctx.beginPath();
      tracePath(topInner);
      for (let i = botInner.length - 1; i >= 0; i--)
        ctx.lineTo(botInner[i][0], botInner[i][1]);
      ctx.closePath();
      const bloodGrad = ctx.createLinearGradient(
        x1, centerY - baseInnerR * 0.8,
        x1, centerY + baseInnerR * 0.8
      );
      bloodGrad.addColorStop(0, "#8b1a1a");
      bloodGrad.addColorStop(0.25, "#6b0e0e");
      bloodGrad.addColorStop(0.5, "#4a0505");
      bloodGrad.addColorStop(0.75, "#6b0e0e");
      bloodGrad.addColorStop(1, "#8b1a1a");
      ctx.fillStyle = bloodGrad;
      ctx.fill();

      // Top wall
      ctx.beginPath();
      tracePath(topOuter);
      for (let i = topInner.length - 1; i >= 0; i--)
        ctx.lineTo(topInner[i][0], topInner[i][1]);
      ctx.closePath();
      const topWG = ctx.createLinearGradient(
        x1, centerY - baseInnerR - wallThick - 5,
        x1, centerY - baseInnerR + 5
      );
      topWG.addColorStop(0, "#e8a0a0");
      topWG.addColorStop(0.15, "#d88888");
      topWG.addColorStop(0.4, "#c87070");
      topWG.addColorStop(0.7, "#b85858");
      topWG.addColorStop(1, "#982828");
      ctx.fillStyle = topWG;
      ctx.fill();
      ctx.beginPath();
      tracePath(topOuter);
      ctx.strokeStyle = "rgba(255, 200, 200, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Bottom wall
      ctx.beginPath();
      tracePath(botInner);
      for (let i = botOuter.length - 1; i >= 0; i--)
        ctx.lineTo(botOuter[i][0], botOuter[i][1]);
      ctx.closePath();
      const botWG = ctx.createLinearGradient(
        x1, centerY + baseInnerR - 5,
        x1, centerY + baseInnerR + wallThick + 5
      );
      botWG.addColorStop(0, "#982828");
      botWG.addColorStop(0.3, "#b85858");
      botWG.addColorStop(0.6, "#c87070");
      botWG.addColorStop(0.85, "#d88888");
      botWG.addColorStop(1, "#e8a0a0");
      ctx.fillStyle = botWG;
      ctx.fill();
      ctx.beginPath();
      tracePath(botOuter);
      ctx.strokeStyle = "rgba(255, 200, 200, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lumen edges
      ctx.beginPath(); tracePath(topInner);
      ctx.strokeStyle = "rgba(255, 160, 160, 0.2)"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); tracePath(botInner);
      ctx.strokeStyle = "rgba(255, 160, 160, 0.2)"; ctx.lineWidth = 0.8; ctx.stroke();

      // Left end-cap
      {
        const ir0 = getInnerR(0);
        const or0 = ir0 + wallThick;
        ctx.beginPath();
        ctx.ellipse(x1, centerY, 4, or0, 0, 0, Math.PI * 2);
        const cg = ctx.createRadialGradient(x1, centerY, 0, x1, centerY, or0);
        cg.addColorStop(0, "#4a0505");
        cg.addColorStop(0.5, "#7a1515");
        cg.addColorStop(1, "#b85858");
        ctx.fillStyle = cg;
        ctx.fill();
      }

      // ══════════════════════════════════════════════════════════
      // ARROWS ON THE EDGES — traveling along vessel walls
      // ══════════════════════════════════════════════════════════
      const arrowLeadX = x1 + arrowProgress * length;
      const arrowCount = 6;

      const drawWallArrow = (
        ax: number, ay: number, size: number, alpha: number, flipY: boolean
      ) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(ax, ay);
        if (flipY) ctx.scale(1, -1);

        // Small chevron/triangle arrow pointing right
        const hw = size * 0.5;
        const hl = size;
        ctx.beginPath();
        ctx.moveTo(-hl, -hw);
        ctx.lineTo(0, 0);
        ctx.lineTo(-hl, hw);
        ctx.lineTo(-hl * 0.4, 0);
        ctx.closePath();

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();
        ctx.restore();
      };

      for (let a = 0; a < arrowCount; a++) {
        const frac = (a + 0.5) / arrowCount;
        const ax = x1 + frac * length;
        if (ax > arrowLeadX) continue; // wave hasn't reached here yet

        const seg = Math.max(0, Math.min(Math.floor(frac * numPts), numPts));
        const ir = getInnerR(seg);
        const or_ = ir + wallThick;

        // Fade: arrows closer to the leading edge are brighter
        const distRatio = (arrowLeadX - ax) / length;
        const alpha = Math.max(0.25, Math.min(0.9, 1 - distRatio * 0.8));
        const sz = 8;

        // Top wall edge
        drawWallArrow(ax, centerY - or_ - 4, sz, alpha, false);
        // Bottom wall edge
        drawWallArrow(ax, centerY + or_ + 4, sz, alpha, true);
      }

      // Leading edge glow on walls
      if (arrowProgress > 0.02 && arrowProgress < 1) {
        const seg2 = Math.max(0, Math.min(Math.floor(arrowProgress * numPts), numPts));
        const ir2 = getInnerR(seg2);
        const or2 = ir2 + wallThick;

        for (const yOff of [centerY - or2 - 4, centerY + or2 + 4]) {
          ctx.save();
          const glow = ctx.createRadialGradient(arrowLeadX, yOff, 0, arrowLeadX, yOff, 14);
          glow.addColorStop(0, "rgba(255,255,255,0.6)");
          glow.addColorStop(0.5, "rgba(255,255,255,0.15)");
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(arrowLeadX, yOff, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // ─── Stiff: tapered end + reflection ───
      if (isStiff) {
        const endX = x1 + length;
        const taperLen = 35;
        const ir = baseInnerR;
        const or_ = ir + wallThick;

        ctx.beginPath();
        ctx.moveTo(endX, centerY - or_);
        ctx.lineTo(endX + taperLen, centerY - or_ * 0.45);
        ctx.lineTo(endX + taperLen, centerY - ir * 0.3);
        ctx.lineTo(endX, centerY - ir);
        ctx.closePath();
        const tgt = ctx.createLinearGradient(endX, centerY - or_, endX, centerY);
        tgt.addColorStop(0, "#d08080"); tgt.addColorStop(1, "#8b2020");
        ctx.fillStyle = tgt; ctx.fill();

        ctx.beginPath();
        ctx.moveTo(endX, centerY + ir);
        ctx.lineTo(endX + taperLen, centerY + ir * 0.3);
        ctx.lineTo(endX + taperLen, centerY + or_ * 0.45);
        ctx.lineTo(endX, centerY + or_);
        ctx.closePath();
        const tgb = ctx.createLinearGradient(endX, centerY, endX, centerY + or_);
        tgb.addColorStop(0, "#8b2020"); tgb.addColorStop(1, "#d08080");
        ctx.fillStyle = tgb; ctx.fill();

        ctx.beginPath();
        ctx.moveTo(endX, centerY - ir);
        ctx.lineTo(endX + taperLen, centerY - ir * 0.3);
        ctx.lineTo(endX + taperLen, centerY + ir * 0.3);
        ctx.lineTo(endX, centerY + ir);
        ctx.closePath();
        ctx.fillStyle = "#4a0505"; ctx.fill();

        ctx.font = "italic 13px 'Inter', sans-serif";
        ctx.fillStyle = "#e88080";
        ctx.textAlign = "left";
        ctx.fillText("Early wave", endX + taperLen + 12, centerY - 12);
        ctx.fillText("reflection", endX + taperLen + 12, centerY + 4);
      }

      // ─── Elastic: expansion/compression arrows ───
      if (!isStiff) {
        for (let n = 0; n < 3; n++) {
          const progress = (n + 0.5) / 3;
          const i = Math.floor(progress * numPts);
          const x = x1 + progress * length;
          const ir = getInnerR(i);
          const or_ = ir + wallThick;

          if (ir > baseInnerR * 1.2) {
            drawExpansionArrow(ctx, x, centerY - or_ - 6, true);
            drawExpansionArrow(ctx, x, centerY + or_ + 6, false);
            ctx.font = "bold 12px 'Inter', sans-serif";
            ctx.fillStyle = "#5dade2";
            ctx.textAlign = "center";
            ctx.fillText("Wall expansion", x, centerY - or_ - 28);
          } else if (ir < baseInnerR * 0.8) {
            drawCompressionArrow(ctx, x, centerY - or_ - 2, false);
            drawCompressionArrow(ctx, x, centerY + or_ + 2, true);
            ctx.font = "11px 'Inter', sans-serif";
            ctx.fillStyle = "#5dade2";
            ctx.textAlign = "center";
            ctx.fillText("Wall compression", x, centerY + or_ + 22);
          }
        }
      }
    },
    []
  );

  function drawExpansionArrow(
    ctx: CanvasRenderingContext2D, x: number, y: number, pointsUp: boolean
  ) {
    const dir = pointsUp ? -1 : 1;
    ctx.save();
    ctx.strokeStyle = "#5dade2"; ctx.fillStyle = "#5dade2"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + dir * 3, 16,
      pointsUp ? Math.PI * 0.15 : -Math.PI * 0.85,
      pointsUp ? Math.PI * 0.85 : -Math.PI * 0.15
    );
    ctx.stroke();
    const r = 16;
    const a1 = pointsUp ? Math.PI * 0.15 : -Math.PI * 0.85;
    const a2 = pointsUp ? Math.PI * 0.85 : -Math.PI * 0.15;
    const lx = x + Math.cos(a1) * r, ly = y + dir * 3 + Math.sin(a1) * r;
    ctx.beginPath(); ctx.moveTo(lx, ly);
    ctx.lineTo(lx + (pointsUp ? -4 : 4), ly + dir * 5);
    ctx.lineTo(lx + (pointsUp ? 5 : -3), ly + dir * 1);
    ctx.closePath(); ctx.fill();
    const rx = x + Math.cos(a2) * r, ry = y + dir * 3 + Math.sin(a2) * r;
    ctx.beginPath(); ctx.moveTo(rx, ry);
    ctx.lineTo(rx + (pointsUp ? 4 : -4), ry + dir * 5);
    ctx.lineTo(rx + (pointsUp ? -5 : 3), ry + dir * 1);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawCompressionArrow(
    ctx: CanvasRenderingContext2D, x: number, y: number, pointsUp: boolean
  ) {
    const dir = pointsUp ? -1 : 1;
    ctx.save();
    ctx.strokeStyle = "rgba(93, 173, 226, 0.7)";
    ctx.fillStyle = "rgba(93, 173, 226, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 8, y); ctx.lineTo(x, y + dir * 8); ctx.lineTo(x + 8, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + dir * 8);
    ctx.lineTo(x - 3, y + dir * 3); ctx.lineTo(x + 3, y + dir * 3);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  Main render loop                                                   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const dt = 0.016;
    const ELASTIC_DURATION = 5.0;
    const PWV_RATIO = 1.7;
    const STIFF_DURATION = ELASTIC_DURATION / PWV_RATIO; // ~2.94s
    const PAUSE_AFTER_DONE = 1.5;

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      timeRef.current += dt;
      const t = timeRef.current;
      const c = cycleRef.current;

      // Layout
      const heartImgSize = 160;
      const heartAreaW = heartImgSize + 20;
      const vesselStartX = heartAreaW + 10;
      const vesselLen = w - vesselStartX - 110;
      const stiffY = h * 0.28;
      const elasticY = h * 0.72;

      // ─── Update race ───
      if (!c.paused) {
        c.cycleTimer += dt;

        if (!c.stiffDone) {
          c.stiffProgress += dt / STIFF_DURATION;
          c.stiffTime = c.cycleTimer;
          if (c.stiffProgress >= 1) {
            c.stiffProgress = 1;
            c.stiffDone = true;
          }
        }

        if (!c.elasticDone) {
          c.elasticProgress += dt / ELASTIC_DURATION;
          c.elasticTime = c.cycleTimer;
          if (c.elasticProgress >= 1) {
            c.elasticProgress = 1;
            c.elasticDone = true;
          }
        }

        if (c.stiffDone && c.elasticDone) {
          c.paused = true;
          c.pauseTimer = 0;
        }
      } else {
        c.pauseTimer += dt;
        if (c.pauseTimer >= PAUSE_AFTER_DONE) {
          c.stiffProgress = 0;
          c.elasticProgress = 0;
          c.stiffDone = false;
          c.elasticDone = false;
          c.stiffTime = 0;
          c.elasticTime = 0;
          c.cycleTimer = 0;
          c.paused = false;
          c.pauseTimer = 0;
        }
      }

      // ──── STIFF VESSEL ────
      ctx.font = "bold 18px 'Inter', sans-serif";
      ctx.fillStyle = "#e88080";
      ctx.textAlign = "center";
      ctx.fillText("Stiff Vessel (↓ Compliance)", vesselStartX + vesselLen / 2, stiffY - 62);

      // Heart image
      if (heartImgRef.current) {
        const img = heartImgRef.current;
        const imgAspect = img.width / img.height;
        const drawH = heartImgSize;
        const drawW = drawH * imgAspect;
        const imgX = 10;
        const imgY = stiffY - drawH / 2;
        ctx.drawImage(img, imgX, imgY, drawW, drawH);

        ctx.beginPath();
        ctx.moveTo(imgX + drawW - 5, stiffY + 5);
        ctx.lineTo(vesselStartX, stiffY);
        const cg = ctx.createLinearGradient(imgX + drawW, stiffY, vesselStartX, stiffY);
        cg.addColorStop(0, "#d08080"); cg.addColorStop(1, "#8b2020");
        ctx.strokeStyle = cg; ctx.lineWidth = 5; ctx.stroke();
      }

      drawVessel3D(ctx, vesselStartX, stiffY, vesselLen, 20, 14, t, true, c.stiffProgress);

      // ── Divider ──
      ctx.beginPath();
      ctx.moveTo(20, h * 0.5);
      ctx.lineTo(w - 20, h * 0.5);
      ctx.strokeStyle = "rgba(232,232,240,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ──── ELASTIC VESSEL ────
      ctx.font = "bold 18px 'Inter', sans-serif";
      ctx.fillStyle = "#5dade2";
      ctx.textAlign = "center";
      ctx.fillText("Elastic Vessel (↑ Compliance)", vesselStartX + vesselLen / 2, elasticY - 78);

      const barX = vesselStartX - 30;
      const barH = 56;
      ctx.fillStyle = "rgba(232,232,240,0.12)";
      ctx.fillRect(barX - 4, elasticY - barH / 2, 8, barH);
      ctx.strokeStyle = "rgba(232,232,240,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 4, elasticY - barH / 2, 8, barH);
      ctx.beginPath();
      ctx.moveTo(barX + 4, elasticY);
      ctx.lineTo(vesselStartX, elasticY);
      const cg2 = ctx.createLinearGradient(barX, elasticY, vesselStartX, elasticY);
      cg2.addColorStop(0, "#d08080"); cg2.addColorStop(1, "#8b2020");
      ctx.strokeStyle = cg2; ctx.lineWidth = 5; ctx.stroke();

      drawVessel3D(ctx, vesselStartX, elasticY, vesselLen, 20, 14, t, false, c.elasticProgress);

      // ══════════════════════════════════════════════════════════
      //  TIMERS — drawn BELOW the label chains, outside the diagram
      // ══════════════════════════════════════════════════════════

      // Stiff timer — positioned below stiff vessel labels
      const stiffTimerY = stiffY + 52;
      const timerX = vesselStartX + vesselLen + 65;
      drawTimer(ctx, timerX, stiffTimerY, c.stiffTime, c.stiffDone, "#e88080", "Stiff");

      // Elastic timer — positioned below elastic vessel labels
      const elasticTimerY = elasticY + 52;
      drawTimer(ctx, timerX, elasticTimerY, c.elasticTime, c.elasticDone, "#5dade2", "Elastic");

      // ─── Label chains ───
      // Stiff labels
      const chainY = stiffY + 56;
      ctx.textAlign = "center";
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.8)";
      ctx.fillText("↓ Arterial distensibility", vesselStartX + vesselLen * 0.12, chainY);
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.4)";
      ctx.fillText("(↑ Elastic modulus)", vesselStartX + vesselLen * 0.12, chainY + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.28, chainY);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#e88080";
      ctx.fillText("Minimal wall", vesselStartX + vesselLen * 0.40, chainY);
      ctx.fillText("deformation", vesselStartX + vesselLen * 0.40, chainY + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.53, chainY);
      ctx.font = "13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.7)";
      ctx.fillText("Faster pressure wave", vesselStartX + vesselLen * 0.68, chainY);
      ctx.fillText("propagation", vesselStartX + vesselLen * 0.68, chainY + 16);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#e88080";
      ctx.fillText("→ ↑ PWV", vesselStartX + vesselLen * 0.82, chainY + 8);

      // Elastic labels
      const chainY2 = elasticY + 72;
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.8)";
      ctx.textAlign = "center";
      ctx.fillText("↑ Arterial distensibility", vesselStartX + vesselLen * 0.12, chainY2);
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.4)";
      ctx.fillText("(↓ Elastic modulus)", vesselStartX + vesselLen * 0.12, chainY2 + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.28, chainY2);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#5dade2";
      ctx.fillText("Greater wall", vesselStartX + vesselLen * 0.40, chainY2);
      ctx.fillText("deformation", vesselStartX + vesselLen * 0.40, chainY2 + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.53, chainY2);
      ctx.font = "13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.7)";
      ctx.fillText("Slower pressure wave", vesselStartX + vesselLen * 0.68, chainY2);
      ctx.fillText("propagation", vesselStartX + vesselLen * 0.68, chainY2 + 16);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#5dade2";
      ctx.fillText("→ ↓ PWV", vesselStartX + vesselLen * 0.82, chainY2 + 8);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [drawVessel3D]);

  function drawTimer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    elapsed: number,
    done: boolean,
    color: string,
    label: string
  ) {
    const timeStr = elapsed.toFixed(1) + "s";
    const pillW = 90;
    const pillH = 52;
    const pillX = x - pillW / 2;
    const pillY = y - pillH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 10);
    ctx.fillStyle = done ? "rgba(40, 180, 80, 0.12)" : "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = done ? "rgba(40, 180, 80, 0.4)" : "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(232,232,240,0.45)";
    ctx.textAlign = "center";
    ctx.fillText("⏱ " + label, x, pillY + 16);

    ctx.font = "bold 20px 'Space Grotesk', monospace";
    ctx.fillStyle = done ? "#4ade80" : color;
    ctx.fillText(timeStr, x, pillY + 40);

    if (done) {
      ctx.font = "14px 'Inter', sans-serif";
      ctx.fillStyle = "#4ade80";
      ctx.fillText("✓", x + 32, pillY + 40);
    }
    ctx.restore();
  }

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 640, display: "block" }}
      />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[rgba(230,57,70,0.2)] bg-[rgba(230,57,70,0.03)]">
          <h4 className="font-semibold text-[#e88080] text-sm mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#e88080] inline-block" />
            Stiff Vessel — ↓ Compliance
          </h4>
          <p className="text-xs text-[rgba(232,232,240,0.55)] leading-relaxed">
            Rigid walls → pulse wave propagates faster, arrives sooner.
            Watch the arrow: same distance, less time. Higher PWV = faster
            arrival = increased cardiac afterload.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[rgba(93,173,226,0.2)] bg-[rgba(93,173,226,0.03)]">
          <h4 className="font-semibold text-[#5dade2] text-sm mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#5dade2] inline-block" />
            Elastic Vessel — ↑ Compliance
          </h4>
          <p className="text-xs text-[rgba(232,232,240,0.55)] leading-relaxed">
            Flexible walls absorb energy → pulse wave travels slower.
            The Windkessel effect buffers each pulse. Lower PWV =
            healthier ventricular–arterial coupling.
          </p>
        </div>
      </div>
    </div>
  );
}
