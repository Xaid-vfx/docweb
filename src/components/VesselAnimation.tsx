"use client";

import { useEffect, useRef, useCallback } from "react";

export default function VesselAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const heartImgRef = useRef<HTMLImageElement | null>(null);

  // Pulse cycle state
  const cycleRef = useRef({
    stiffProgress: 0,   // 0→1 how far along the stiff path
    elasticProgress: 0,  // 0→1 how far along the elastic path
    stiffDone: false,
    elasticDone: false,
    stiffTime: 0,
    elasticTime: 0,
    cycleTimer: 0,       // total elapsed since last reset
    paused: false,
    pauseTimer: 0,
  });

  /* Load heart SVG image */
  useEffect(() => {
    const img = new Image();
    img.src = "/heart-diagram.svg";
    img.onload = () => { heartImgRef.current = img; };
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Compute path length along vessel wall edge                         */
  /* ------------------------------------------------------------------ */
  const computePathPoints = useCallback(
    (
      x1: number,
      centerY: number,
      length: number,
      baseInnerR: number,
      wallThick: number,
      time: number,
      isStiff: boolean,
      numPts: number
    ): { points: [number, number][]; totalLen: number; cumLen: number[] } => {
      const dx = length / numPts;
      const points: [number, number][] = [];

      for (let i = 0; i <= numPts; i++) {
        const x = x1 + i * dx;
        let ir: number;
        if (isStiff) {
          ir = baseInnerR;
        } else {
          const progress = i / numPts;
          const wave = Math.sin(progress * Math.PI * 3 - time * 1.5);
          ir = baseInnerR + wave * baseInnerR * 0.48;
        }
        const or_ = ir + wallThick;
        // Track along the TOP outer wall edge
        points.push([x, centerY - or_]);
      }

      // Compute cumulative arc-length
      const cumLen: number[] = [0];
      let total = 0;
      for (let i = 1; i < points.length; i++) {
        const dx2 = points[i][0] - points[i - 1][0];
        const dy2 = points[i][1] - points[i - 1][1];
        total += Math.sqrt(dx2 * dx2 + dy2 * dy2);
        cumLen.push(total);
      }

      return { points, totalLen: total, cumLen };
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  Draw a 3D cylindrical vessel tube                                  */
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
      isStiff: boolean
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

      // Lumen edge
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

      // ─── Stiff vessel: tapered end + reflection ───
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

      // ─── Elastic vessel: expansion/compression arrows ───
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
  /*  Draw the glowing pulse dot at a position along the path            */
  /* ------------------------------------------------------------------ */
  function drawPulseDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    glowColor: string,
    time: number
  ) {
    const pulse = 6 + Math.sin(time * 8) * 2;

    // Outer glow
    ctx.save();
    const glow = ctx.createRadialGradient(x, y, 0, x, y, pulse + 12);
    glow.addColorStop(0, glowColor);
    glow.addColorStop(0.5, glowColor.replace("0.6", "0.2"));
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, pulse + 12, 0, Math.PI * 2);
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, pulse, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bright center
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  Interpolate position along cumulative-length path                  */
  /* ------------------------------------------------------------------ */
  function getPositionAtProgress(
    points: [number, number][],
    cumLen: number[],
    totalLen: number,
    progress: number
  ): [number, number] {
    const targetLen = progress * totalLen;

    for (let i = 1; i < cumLen.length; i++) {
      if (cumLen[i] >= targetLen) {
        const segStart = cumLen[i - 1];
        const segEnd = cumLen[i];
        const t = (targetLen - segStart) / (segEnd - segStart);
        return [
          points[i - 1][0] + t * (points[i][0] - points[i - 1][0]),
          points[i - 1][1] + t * (points[i][1] - points[i - 1][1]),
        ];
      }
    }
    return points[points.length - 1];
  }

  /* ------------------------------------------------------------------ */
  /*  Draw timer display                                                 */
  /* ------------------------------------------------------------------ */
  function drawTimer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    elapsed: number,
    done: boolean,
    color: string,
    label: string
  ) {
    const timeStr = elapsed.toFixed(2) + "s";

    // Background pill
    ctx.save();
    const pillW = 120;
    const pillH = 48;
    const pillX = x - pillW / 2;
    const pillY = y - pillH / 2;
    const radius = 12;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, radius);
    ctx.fillStyle = done ? "rgba(40, 180, 80, 0.15)" : "rgba(255,255,255,0.05)";
    ctx.fill();
    ctx.strokeStyle = done ? "rgba(40, 180, 80, 0.5)" : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Timer icon (⏱)
    ctx.font = "14px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(232,232,240,0.5)";
    ctx.textAlign = "center";
    ctx.fillText(label, x, pillY + 16);

    // Time value
    ctx.font = `bold 18px 'Space Grotesk', 'Inter', monospace`;
    ctx.fillStyle = done ? "#4ade80" : color;
    ctx.textAlign = "center";
    ctx.fillText(timeStr, x, pillY + 38);

    // Check mark if done
    if (done) {
      ctx.font = "bold 14px 'Inter', sans-serif";
      ctx.fillStyle = "#4ade80";
      ctx.fillText("✓", x + pillW / 2 - 16, pillY + 38);
    }

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

    // PWV in stiff arteries: ~12 m/s, elastic: ~7 m/s → 1.7x ratio
    const STIFF_SPEED = 320;   // faster pulse propagation
    const ELASTIC_SPEED = 190; // slower due to wall absorption
    const dt = 0.016;
    const PAUSE_AFTER_DONE = 2.0; // seconds to show finished state

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
      const stiffY = h * 0.27;
      const elasticY = h * 0.73;
      const numPts = 300;

      // ─── Compute path lengths ───
      const stiffPath = computePathPoints(
        vesselStartX, stiffY, vesselLen, 20, 14, t, true, numPts
      );
      const elasticPath = computePathPoints(
        vesselStartX, elasticY, vesselLen, 20, 14, t, false, numPts
      );

      // ─── Update pulse positions ───
      if (!c.paused) {
        c.cycleTimer += dt;

        if (!c.stiffDone) {
          c.stiffProgress += (STIFF_SPEED * dt) / stiffPath.totalLen;
          c.stiffTime = c.cycleTimer;
          if (c.stiffProgress >= 1) {
            c.stiffProgress = 1;
            c.stiffDone = true;
          }
        }

        if (!c.elasticDone) {
          c.elasticProgress += (ELASTIC_SPEED * dt) / elasticPath.totalLen;
          c.elasticTime = c.cycleTimer;
          if (c.elasticProgress >= 1) {
            c.elasticProgress = 1;
            c.elasticDone = true;
          }
        }

        // Both done → pause then reset
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
        cg.addColorStop(0, "#d08080");
        cg.addColorStop(1, "#8b2020");
        ctx.strokeStyle = cg;
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      drawVessel3D(ctx, vesselStartX, stiffY, vesselLen, 20, 14, t, true);

      // Stiff pulse dot
      if (c.stiffProgress > 0) {
        const pos = getPositionAtProgress(
          stiffPath.points, stiffPath.cumLen, stiffPath.totalLen,
          Math.min(c.stiffProgress, 1)
        );
        drawPulseDot(ctx, pos[0], pos[1], "#ff6b6b", "rgba(255, 107, 107, 0.6)", t);

        // Trail
        ctx.save();
        ctx.beginPath();
        const trailStart = Math.max(0, c.stiffProgress - 0.15);
        for (let p = trailStart; p <= c.stiffProgress; p += 0.002) {
          const tp = getPositionAtProgress(
            stiffPath.points, stiffPath.cumLen, stiffPath.totalLen, p
          );
          if (p === trailStart) ctx.moveTo(tp[0], tp[1]);
          else ctx.lineTo(tp[0], tp[1]);
        }
        ctx.strokeStyle = "rgba(255, 107, 107, 0.4)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Stiff timer
      drawTimer(ctx, vesselStartX + vesselLen + 60, stiffY,
        c.stiffTime, c.stiffDone, "#e88080", "⏱ PWV");

      // Label chain
      const chainY = stiffY + 56;
      ctx.textAlign = "center";
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.8)";
      ctx.fillText("↓ Arterial distensibility", vesselStartX + vesselLen * 0.15, chainY);
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.4)";
      ctx.fillText("(↑ Elastic modulus)", vesselStartX + vesselLen * 0.15, chainY + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.33, chainY);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#e88080";
      ctx.fillText("Minimal wall", vesselStartX + vesselLen * 0.47, chainY);
      ctx.fillText("deformation", vesselStartX + vesselLen * 0.47, chainY + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.62, chainY);
      ctx.font = "13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.7)";
      ctx.fillText("Faster pressure wave", vesselStartX + vesselLen * 0.78, chainY);
      ctx.fillText("propagation", vesselStartX + vesselLen * 0.78, chainY + 16);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#e88080";
      ctx.fillText("→ Increased PWV (↑)", vesselStartX + vesselLen * 0.78, chainY + 32);

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

      // Connector bar for elastic
      const barX = vesselStartX - 30;
      const barH2 = 56;
      ctx.fillStyle = "rgba(232,232,240,0.12)";
      ctx.fillRect(barX - 4, elasticY - barH2 / 2, 8, barH2);
      ctx.strokeStyle = "rgba(232,232,240,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 4, elasticY - barH2 / 2, 8, barH2);
      ctx.beginPath();
      ctx.moveTo(barX + 4, elasticY);
      ctx.lineTo(vesselStartX, elasticY);
      const cg2 = ctx.createLinearGradient(barX, elasticY, vesselStartX, elasticY);
      cg2.addColorStop(0, "#d08080");
      cg2.addColorStop(1, "#8b2020");
      ctx.strokeStyle = cg2;
      ctx.lineWidth = 5;
      ctx.stroke();

      drawVessel3D(ctx, vesselStartX, elasticY, vesselLen, 20, 14, t, false);

      // Elastic pulse dot
      if (c.elasticProgress > 0) {
        const pos = getPositionAtProgress(
          elasticPath.points, elasticPath.cumLen, elasticPath.totalLen,
          Math.min(c.elasticProgress, 1)
        );
        drawPulseDot(ctx, pos[0], pos[1], "#5dade2", "rgba(93, 173, 226, 0.6)", t);

        // Trail
        ctx.save();
        ctx.beginPath();
        const trailStart = Math.max(0, c.elasticProgress - 0.15);
        for (let p = trailStart; p <= c.elasticProgress; p += 0.002) {
          const tp = getPositionAtProgress(
            elasticPath.points, elasticPath.cumLen, elasticPath.totalLen, p
          );
          if (p === trailStart) ctx.moveTo(tp[0], tp[1]);
          else ctx.lineTo(tp[0], tp[1]);
        }
        ctx.strokeStyle = "rgba(93, 173, 226, 0.4)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Elastic timer
      drawTimer(ctx, vesselStartX + vesselLen + 60, elasticY,
        c.elasticTime, c.elasticDone, "#5dade2", "⏱ PWV");

      // Label chain
      const chainY2 = elasticY + 72;
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.8)";
      ctx.textAlign = "center";
      ctx.fillText("↑ Arterial distensibility", vesselStartX + vesselLen * 0.15, chainY2);
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.4)";
      ctx.fillText("(↓ Elastic modulus)", vesselStartX + vesselLen * 0.15, chainY2 + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.33, chainY2);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#5dade2";
      ctx.fillText("Greater wall", vesselStartX + vesselLen * 0.47, chainY2);
      ctx.fillText("deformation", vesselStartX + vesselLen * 0.47, chainY2 + 16);
      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.3)";
      ctx.fillText("→", vesselStartX + vesselLen * 0.62, chainY2);
      ctx.font = "13px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(232,232,240,0.7)";
      ctx.fillText("Slower pressure wave", vesselStartX + vesselLen * 0.78, chainY2);
      ctx.fillText("propagation", vesselStartX + vesselLen * 0.78, chainY2 + 16);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#5dade2";
      ctx.fillText("→ Lower PWV (↓)", vesselStartX + vesselLen * 0.78, chainY2 + 32);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [drawVessel3D, computePathPoints]);

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
            Rigid arterial walls = straight path. The pulse wave travels at the
            same speed but covers less distance, arriving at the destination
            faster → higher measured PWV.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[rgba(93,173,226,0.2)] bg-[rgba(93,173,226,0.03)]">
          <h4 className="font-semibold text-[#5dade2] text-sm mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#5dade2] inline-block" />
            Elastic Vessel — ↑ Compliance
          </h4>
          <p className="text-xs text-[rgba(232,232,240,0.55)] leading-relaxed">
            Flexible walls deform with each pulse, creating a longer path along
            the vessel wall. Same wave speed but more ground to cover →
            the pulse arrives later → lower measured PWV.
          </p>
        </div>
      </div>
    </div>
  );
}
