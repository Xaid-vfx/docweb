"use client";

import { useEffect, useRef, useCallback } from "react";

export default function VesselAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  /* ------------------------------------------------------------------ */
  /*  Draw anatomical heart cross-section (medical illustration style)   */
  /* ------------------------------------------------------------------ */
  const drawHeart = useCallback(
    (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // --- Outer pericardial silhouette ---
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.bezierCurveTo(30, -70, 65, -55, 60, -18);
      ctx.bezierCurveTo(58, 5, 35, 40, 0, 65);
      ctx.bezierCurveTo(-35, 40, -58, 5, -60, -18);
      ctx.bezierCurveTo(-65, -55, -30, -70, 0, -60);
      ctx.closePath();

      // Myocardial fill — warm pink
      const myoGrad = ctx.createRadialGradient(-8, -8, 10, 0, 0, 68);
      myoGrad.addColorStop(0, "#f4c2c2");
      myoGrad.addColorStop(0.5, "#e8a0a0");
      myoGrad.addColorStop(0.8, "#d88888");
      myoGrad.addColorStop(1, "#c67070");
      ctx.fillStyle = myoGrad;
      ctx.fill();
      ctx.strokeStyle = "#b06060";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // --- Atrial septum (vertical line upper half) ---
      ctx.beginPath();
      ctx.moveTo(0, -55);
      ctx.lineTo(0, -12);
      ctx.strokeStyle = "#a06060";
      ctx.lineWidth = 2;
      ctx.stroke();

      // --- Ventricular septum (vertical line lower half, slight curve) ---
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.quadraticCurveTo(2, 20, 0, 58);
      ctx.strokeStyle = "#a06060";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // --- Right Atrium (blue-tinted chamber, left side of image) ---
      ctx.beginPath();
      ctx.moveTo(-5, -50);
      ctx.bezierCurveTo(-15, -52, -42, -42, -42, -28);
      ctx.bezierCurveTo(-42, -18, -20, -15, -5, -15);
      ctx.closePath();
      ctx.fillStyle = "rgba(160, 195, 230, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(120, 150, 180, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // --- Left Atrium (blue-tinted chamber, right side) ---
      ctx.beginPath();
      ctx.moveTo(5, -50);
      ctx.bezierCurveTo(15, -52, 42, -42, 42, -28);
      ctx.bezierCurveTo(42, -18, 20, -15, 5, -15);
      ctx.closePath();
      ctx.fillStyle = "rgba(160, 195, 230, 0.50)";
      ctx.fill();
      ctx.strokeStyle = "rgba(120, 150, 180, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // --- Mitral/Tricuspid valve line ---
      ctx.beginPath();
      ctx.moveTo(-48, -14);
      ctx.lineTo(48, -14);
      ctx.strokeStyle = "rgba(140, 100, 100, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- Right Ventricle (left side, slightly darker pink) ---
      ctx.beginPath();
      ctx.moveTo(-5, -12);
      ctx.bezierCurveTo(-18, -12, -50, -2, -48, 18);
      ctx.bezierCurveTo(-42, 40, -15, 55, -3, 60);
      ctx.lineTo(-3, -12);
      ctx.closePath();
      ctx.fillStyle = "rgba(210, 170, 170, 0.35)";
      ctx.fill();

      // --- Left Ventricle (right side) ---
      ctx.beginPath();
      ctx.moveTo(5, -12);
      ctx.bezierCurveTo(18, -12, 50, -2, 48, 18);
      ctx.bezierCurveTo(42, 40, 15, 55, 3, 60);
      ctx.lineTo(3, -12);
      ctx.closePath();
      ctx.fillStyle = "rgba(210, 170, 170, 0.30)";
      ctx.fill();

      // --- Great vessels at top (aorta hint) ---
      ctx.beginPath();
      ctx.moveTo(15, -55);
      ctx.bezierCurveTo(20, -70, 35, -72, 40, -60);
      ctx.strokeStyle = "#c88080";
      ctx.lineWidth = 3;
      ctx.stroke();

      // --- Labels with leader lines ---
      ctx.textAlign = "left";
      const labelColor = "#444";
      const lineColor = "rgba(80,80,80,0.4)";

      const drawLabel = (
        text: string,
        labelX: number,
        labelY: number,
        ptX: number,
        ptY: number,
        fontSize: number = 8
      ) => {
        ctx.font = `${fontSize}px 'Inter', sans-serif`;
        ctx.fillStyle = labelColor;
        ctx.fillText(text, labelX, labelY);
        ctx.beginPath();
        ctx.moveTo(labelX, labelY + 2);
        ctx.lineTo(ptX, ptY);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      };

      ctx.textAlign = "center";
      drawLabel("Atrial septum", 0, -72, 0, -55, 8);

      ctx.textAlign = "left";
      drawLabel("Left", 48, -42, 30, -32, 7);
      ctx.fillText("atrium", 48, -34);
      drawLabel("Mitral", 48, -16, 18, -14, 7);
      ctx.fillText("valve", 48, -8);
      drawLabel("Left", 42, 26, 22, 15, 7);
      ctx.fillText("ventricle", 42, 34);

      ctx.textAlign = "right";
      drawLabel("Right", -48, -42, -30, -32, 7);
      ctx.font = "7px 'Inter', sans-serif";
      ctx.fillText("atrium", -48, -34);

      ctx.textAlign = "right";
      drawLabel("Right", -42, 26, -22, 15, 7);
      ctx.font = "7px 'Inter', sans-serif";
      ctx.fillText("ventricle", -42, 34);

      // Ventricular septum label
      ctx.textAlign = "right";
      drawLabel("Ventricular", -42, 0, -5, 5, 7);
      ctx.font = "7px 'Inter', sans-serif";
      ctx.fillText("septum", -42, 8);

      // Tricuspid valve
      ctx.textAlign = "right";
      drawLabel("Tricuspid", -55, 48, -35, 30, 6.5);
      ctx.font = "6.5px 'Inter', sans-serif";
      ctx.fillText("valve", -55, 55);

      ctx.restore();
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  Draw a single 3D cylindrical vessel tube segment                   */
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

      // Compute the inner radius at each point
      const getInnerR = (i: number): number => {
        if (isStiff) {
          // Perfectly straight — no deformation at all
          return baseInnerR;
        } else {
          // Sinusoidal expansion/compression — dramatic wave
          const progress = i / numPts;
          const wave = Math.sin(progress * Math.PI * 3 - time * 1.5);
          return baseInnerR + wave * baseInnerR * 0.48;
        }
      };

      // Collect points for outer and inner walls
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

      // Helper to draw a path from an array of pts
      const tracePath = (pts: [number, number][]) => {
        pts.forEach(([px, py], idx) =>
          idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        );
      };

      // ─── Blood interior ───
      ctx.beginPath();
      tracePath(topInner);
      for (let i = botInner.length - 1; i >= 0; i--) {
        ctx.lineTo(botInner[i][0], botInner[i][1]);
      }
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

      // ─── Top wall (outer skin → inner mucosa) ───
      ctx.beginPath();
      tracePath(topOuter);
      for (let i = topInner.length - 1; i >= 0; i--) {
        ctx.lineTo(topInner[i][0], topInner[i][1]);
      }
      ctx.closePath();

      const topWallGrad = ctx.createLinearGradient(
        x1, centerY - baseInnerR - wallThick - 5,
        x1, centerY - baseInnerR + 5
      );
      topWallGrad.addColorStop(0, "#e8a0a0");
      topWallGrad.addColorStop(0.15, "#d88888");
      topWallGrad.addColorStop(0.4, "#c87070");
      topWallGrad.addColorStop(0.7, "#b85858");
      topWallGrad.addColorStop(1, "#982828");
      ctx.fillStyle = topWallGrad;
      ctx.fill();

      // Specular highlight on top of upper wall
      ctx.beginPath();
      tracePath(topOuter);
      ctx.strokeStyle = "rgba(255, 200, 200, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // ─── Bottom wall ───
      ctx.beginPath();
      tracePath(botInner);
      for (let i = botOuter.length - 1; i >= 0; i--) {
        ctx.lineTo(botOuter[i][0], botOuter[i][1]);
      }
      ctx.closePath();

      const botWallGrad = ctx.createLinearGradient(
        x1, centerY + baseInnerR - 5,
        x1, centerY + baseInnerR + wallThick + 5
      );
      botWallGrad.addColorStop(0, "#982828");
      botWallGrad.addColorStop(0.3, "#b85858");
      botWallGrad.addColorStop(0.6, "#c87070");
      botWallGrad.addColorStop(0.85, "#d88888");
      botWallGrad.addColorStop(1, "#e8a0a0");
      ctx.fillStyle = botWallGrad;
      ctx.fill();

      // Specular highlight on bottom of lower wall
      ctx.beginPath();
      tracePath(botOuter);
      ctx.strokeStyle = "rgba(255, 200, 200, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner edge subtle shine (lumen edge)
      ctx.beginPath();
      tracePath(topInner);
      ctx.strokeStyle = "rgba(255, 160, 160, 0.2)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      tracePath(botInner);
      ctx.strokeStyle = "rgba(255, 160, 160, 0.2)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // ─── End-cap on the LEFT (connection to heart): elliptical ───
      {
        const ir0 = getInnerR(0);
        const or0 = ir0 + wallThick;
        ctx.beginPath();
        ctx.ellipse(x1, centerY, 4, or0, 0, 0, Math.PI * 2);
        const capGrad = ctx.createRadialGradient(x1, centerY, 0, x1, centerY, or0);
        capGrad.addColorStop(0, "#4a0505");
        capGrad.addColorStop(0.5, "#7a1515");
        capGrad.addColorStop(1, "#b85858");
        ctx.fillStyle = capGrad;
        ctx.fill();
      }

      // ─── Arrows inside ───
      if (isStiff) {
        // One large white arrow spanning most of the vessel
        const arrStartX = x1 + length * 0.08;
        const arrEndX = x1 + length * 0.82;
        const arrW = baseInnerR * 0.35;
        const headW = baseInnerR * 0.7;
        const headLen = length * 0.06;

        // Animated alpha pulse
        const pulse = 0.7 + Math.sin(time * 2) * 0.15;

        ctx.save();
        ctx.globalAlpha = pulse;

        ctx.beginPath();
        ctx.moveTo(arrStartX, centerY - arrW);
        ctx.lineTo(arrEndX - headLen, centerY - arrW);
        ctx.lineTo(arrEndX - headLen, centerY - headW);
        ctx.lineTo(arrEndX, centerY);
        ctx.lineTo(arrEndX - headLen, centerY + headW);
        ctx.lineTo(arrEndX - headLen, centerY + arrW);
        ctx.lineTo(arrStartX, centerY + arrW);
        ctx.closePath();

        const arrowGrad = ctx.createLinearGradient(arrStartX, 0, arrEndX, 0);
        arrowGrad.addColorStop(0, "rgba(255,255,255,0.25)");
        arrowGrad.addColorStop(0.4, "rgba(255,255,255,0.65)");
        arrowGrad.addColorStop(1, "rgba(255,255,255,0.9)");
        ctx.fillStyle = arrowGrad;
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
      } else {
        // Multiple arrows for elastic vessel — animated flowing through
        const arrowCount = 4;
        const spacing = length / (arrowCount + 0.5);

        for (let a = 0; a < arrowCount; a++) {
          const rawX = ((time * 40 + a * spacing) % (length + 40)) - 20;
          const ax = x1 + rawX;

          if (ax < x1 + 10 || ax > x1 + length - 30) continue;

          const seg = Math.floor((rawX / length) * numPts);
          const ir = getInnerR(Math.max(0, Math.min(seg, numPts)));

          const fadeIn = Math.min(1, (rawX) / 60);
          const fadeOut = Math.min(1, (length - rawX) / 60);
          const alpha = fadeIn * fadeOut * 0.8;

          const arrW = ir * 0.25;
          const headW = ir * 0.5;
          const headLen = 14;
          const bodyLen = 22;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(ax, centerY);

          ctx.beginPath();
          ctx.moveTo(-bodyLen, -arrW);
          ctx.lineTo(0, -arrW);
          ctx.lineTo(0, -headW);
          ctx.lineTo(headLen, 0);
          ctx.lineTo(0, headW);
          ctx.lineTo(0, arrW);
          ctx.lineTo(-bodyLen, arrW);
          ctx.closePath();

          const ag = ctx.createLinearGradient(-bodyLen, 0, headLen, 0);
          ag.addColorStop(0, "rgba(255,255,255,0.3)");
          ag.addColorStop(1, "rgba(255,255,255,0.85)");
          ctx.fillStyle = ag;
          ctx.fill();

          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      // ─── Stiff vessel: tapered right end + wave reflection ───
      if (isStiff) {
        const endX = x1 + length;
        // Slight taper at the end
        const taperLen = 35;
        const ir = baseInnerR;
        const or_ = ir + wallThick;

        // Narrowing shape on top
        ctx.beginPath();
        ctx.moveTo(endX, centerY - or_);
        ctx.lineTo(endX + taperLen, centerY - or_ * 0.45);
        ctx.lineTo(endX + taperLen, centerY - ir * 0.3);
        ctx.lineTo(endX, centerY - ir);
        ctx.closePath();
        const taperGradT = ctx.createLinearGradient(endX, centerY - or_, endX, centerY);
        taperGradT.addColorStop(0, "#d08080");
        taperGradT.addColorStop(1, "#8b2020");
        ctx.fillStyle = taperGradT;
        ctx.fill();

        // Narrowing shape on bottom
        ctx.beginPath();
        ctx.moveTo(endX, centerY + ir);
        ctx.lineTo(endX + taperLen, centerY + ir * 0.3);
        ctx.lineTo(endX + taperLen, centerY + or_ * 0.45);
        ctx.lineTo(endX, centerY + or_);
        ctx.closePath();
        const taperGradB = ctx.createLinearGradient(endX, centerY, endX, centerY + or_);
        taperGradB.addColorStop(0, "#8b2020");
        taperGradB.addColorStop(1, "#d08080");
        ctx.fillStyle = taperGradB;
        ctx.fill();

        // Dark blood in taper
        ctx.beginPath();
        ctx.moveTo(endX, centerY - ir);
        ctx.lineTo(endX + taperLen, centerY - ir * 0.3);
        ctx.lineTo(endX + taperLen, centerY + ir * 0.3);
        ctx.lineTo(endX, centerY + ir);
        ctx.closePath();
        ctx.fillStyle = "#4a0505";
        ctx.fill();

        // Dashed curved reflection arrows
        const refAlpha = 0.5 + Math.sin(time * 3) * 0.2;
        ctx.save();
        ctx.strokeStyle = `rgba(180, 50, 50, ${refAlpha})`;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);

        // Upper reflection curve
        ctx.beginPath();
        ctx.moveTo(endX + taperLen - 5, centerY - ir * 0.2);
        ctx.quadraticCurveTo(endX + taperLen + 20, centerY - 28, endX + taperLen, centerY - 38);
        ctx.stroke();

        // Draw arrowhead at end of curve
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(endX + taperLen, centerY - 38);
        ctx.lineTo(endX + taperLen + 5, centerY - 32);
        ctx.moveTo(endX + taperLen, centerY - 38);
        ctx.lineTo(endX + taperLen - 5, centerY - 33);
        ctx.stroke();

        // Lower reflection curve
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(endX + taperLen - 5, centerY + ir * 0.2);
        ctx.quadraticCurveTo(endX + taperLen + 20, centerY + 28, endX + taperLen, centerY + 38);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(endX + taperLen, centerY + 38);
        ctx.lineTo(endX + taperLen + 5, centerY + 32);
        ctx.moveTo(endX + taperLen, centerY + 38);
        ctx.lineTo(endX + taperLen - 5, centerY + 33);
        ctx.stroke();

        // Reflected small arrows going back left
        for (let i = 0; i < 3; i++) {
          const phase = ((time * 1.5 + i * 0.7) % 2.5);
          const rx = endX + taperLen - 4 - phase * 16;
          const ry = centerY + Math.sin(phase * 3) * 4;
          const ra = (1 - phase / 2.5) * refAlpha * 0.8;

          ctx.globalAlpha = ra;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + 6, ry - 3);
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + 6, ry + 3);
          ctx.strokeStyle = "#b03030";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.restore();

        // "Early wave reflection" label
        ctx.font = "italic 13px 'Inter', sans-serif";
        ctx.fillStyle = "#b03030";
        ctx.textAlign = "left";
        ctx.fillText("Early wave", endX + taperLen + 12, centerY - 12);
        ctx.fillText("reflection", endX + taperLen + 12, centerY + 4);
      }

      // ─── Elastic vessel: blue expansion/compression arrows ───
      if (!isStiff) {
        // Find peaks and troughs
        for (let n = 0; n < 3; n++) {
          const progress = (n + 0.5) / 3;
          const i = Math.floor(progress * numPts);
          const x = x1 + progress * length;
          const ir = getInnerR(i);
          const or_ = ir + wallThick;

          if (ir > baseInnerR * 1.2) {
            // This is an expansion zone — draw outward blue arrows
            drawExpansionArrow(ctx, x, centerY - or_ - 6, true);
            drawExpansionArrow(ctx, x, centerY + or_ + 6, false);

            // "Wall expansion" label
            ctx.font = "bold 12px 'Inter', sans-serif";
            ctx.fillStyle = "#1a5276";
            ctx.textAlign = "center";
            ctx.fillText("Wall expansion", x, centerY - or_ - 28);
          } else if (ir < baseInnerR * 0.8) {
            // Compression zone
            drawCompressionArrow(ctx, x, centerY - or_ - 2, false);
            drawCompressionArrow(ctx, x, centerY + or_ + 2, true);

            ctx.font = "11px 'Inter', sans-serif";
            ctx.fillStyle = "#1a5276";
            ctx.textAlign = "center";
            ctx.fillText("Wall compression", x, centerY + or_ + 22);
          }
        }
      }
    },
    []
  );

  /* ─── Blue curved expansion arrow ─── */
  function drawExpansionArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pointsUp: boolean
  ) {
    const dir = pointsUp ? -1 : 1;
    ctx.save();
    ctx.strokeStyle = "#1a5276";
    ctx.fillStyle = "#1a5276";
    ctx.lineWidth = 2;

    // Curved arc
    ctx.beginPath();
    ctx.arc(x, y + dir * 3, 16, pointsUp ? Math.PI * 0.15 : -Math.PI * 0.85, pointsUp ? Math.PI * 0.85 : -Math.PI * 0.15);
    ctx.stroke();

    // Arrowheads at both ends of the arc
    const angle1 = pointsUp ? Math.PI * 0.15 : -Math.PI * 0.85;
    const angle2 = pointsUp ? Math.PI * 0.85 : -Math.PI * 0.15;
    const r = 16;

    // Left arrowhead
    const lx = x + Math.cos(angle1) * r;
    const ly = y + dir * 3 + Math.sin(angle1) * r;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + (pointsUp ? -4 : 4), ly + dir * 5);
    ctx.lineTo(lx + (pointsUp ? 5 : -3), ly + dir * 1);
    ctx.closePath();
    ctx.fill();

    // Right arrowhead
    const rx = x + Math.cos(angle2) * r;
    const ry = y + dir * 3 + Math.sin(angle2) * r;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + (pointsUp ? 4 : -4), ry + dir * 5);
    ctx.lineTo(rx + (pointsUp ? -5 : 3), ry + dir * 1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* ─── Blue curved compression arrow (points inward) ─── */
  function drawCompressionArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pointsUp: boolean
  ) {
    const dir = pointsUp ? -1 : 1;
    ctx.save();
    ctx.strokeStyle = "rgba(26, 82, 118, 0.7)";
    ctx.fillStyle = "rgba(26, 82, 118, 0.7)";
    ctx.lineWidth = 1.5;

    // Small V-shaped arrow
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x, y + dir * 8);
    ctx.lineTo(x + 8, y);
    ctx.stroke();

    // Arrowhead at bottom of V
    ctx.beginPath();
    ctx.moveTo(x, y + dir * 8);
    ctx.lineTo(x - 3, y + dir * 3);
    ctx.lineTo(x + 3, y + dir * 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  Main animation loop                                                */
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

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      timeRef.current += 0.016;
      const t = timeRef.current;

      // Layout
      const heartScale = Math.min(1.1, w * 0.001);
      const heartX = 85;
      const vesselStartX = heartX + 78 * heartScale;
      const vesselLen = w - vesselStartX - 110;
      const stiffY = h * 0.27;
      const elasticY = h * 0.73;

      // ──── STIFF VESSEL SECTION ────

      // Title
      ctx.font = "bold 18px 'Inter', sans-serif";
      ctx.fillStyle = "#c23038";
      ctx.textAlign = "center";
      ctx.fillText("Stiff Vessel (↓ Compliance)", vesselStartX + vesselLen / 2, stiffY - 62);

      // Draw heart
      drawHeart(ctx, heartX, stiffY, heartScale);

      // Connection line from heart to vessel
      const connY = stiffY;
      ctx.beginPath();
      ctx.moveTo(heartX + 58 * heartScale, connY - 2);
      ctx.lineTo(vesselStartX, connY);
      const connGrad = ctx.createLinearGradient(heartX + 55, connY, vesselStartX, connY);
      connGrad.addColorStop(0, "#d08080");
      connGrad.addColorStop(1, "#8b2020");
      ctx.strokeStyle = connGrad;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw stiff vessel
      drawVessel3D(ctx, vesselStartX, stiffY, vesselLen, 20, 14, t, true);

      // Bottom chain of text
      const chainY = stiffY + 56;
      ctx.textAlign = "center";

      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#444";
      ctx.fillText("↓ Arterial distensibility", vesselStartX + vesselLen * 0.15, chainY);
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText("(↑ Elastic modulus)", vesselStartX + vesselLen * 0.15, chainY + 16);

      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "#aaa";
      ctx.fillText("→", vesselStartX + vesselLen * 0.33, chainY);

      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#c23038";
      ctx.fillText("Minimal wall", vesselStartX + vesselLen * 0.47, chainY);
      ctx.fillText("deformation", vesselStartX + vesselLen * 0.47, chainY + 16);

      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "#aaa";
      ctx.fillText("→", vesselStartX + vesselLen * 0.62, chainY);

      ctx.font = "13px 'Inter', sans-serif";
      ctx.fillStyle = "#444";
      ctx.fillText("Faster pressure wave", vesselStartX + vesselLen * 0.78, chainY);
      ctx.fillText("propagation", vesselStartX + vesselLen * 0.78, chainY + 16);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#c23038";
      ctx.fillText("→ Increased PWV (↑)", vesselStartX + vesselLen * 0.78, chainY + 32);

      // ──── Divider ────
      ctx.beginPath();
      ctx.moveTo(20, h * 0.5);
      ctx.lineTo(w - 20, h * 0.5);
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ──── ELASTIC VESSEL SECTION ────

      ctx.font = "bold 18px 'Inter', sans-serif";
      ctx.fillStyle = "#1a5276";
      ctx.textAlign = "center";
      ctx.fillText("Elastic Vessel (↑ Compliance)", vesselStartX + vesselLen / 2, elasticY - 78);

      // Simple connection rectangle instead of full heart for elastic
      ctx.fillStyle = "#ddd";
      ctx.fillRect(heartX - 6, elasticY - 34, 12, 68);
      ctx.strokeStyle = "#bbb";
      ctx.lineWidth = 1;
      ctx.strokeRect(heartX - 6, elasticY - 34, 12, 68);

      // Connection line
      ctx.beginPath();
      ctx.moveTo(heartX + 6, elasticY);
      ctx.lineTo(vesselStartX, elasticY);
      ctx.strokeStyle = connGrad;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw elastic vessel
      drawVessel3D(ctx, vesselStartX, elasticY, vesselLen, 20, 14, t, false);

      // Bottom chain text
      const chainY2 = elasticY + 72;

      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#444";
      ctx.textAlign = "center";
      ctx.fillText("↑ Arterial distensibility", vesselStartX + vesselLen * 0.15, chainY2);
      ctx.font = "11px 'Inter', sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText("(↓ Elastic modulus)", vesselStartX + vesselLen * 0.15, chainY2 + 16);

      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "#aaa";
      ctx.fillText("→", vesselStartX + vesselLen * 0.33, chainY2);

      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#1a5276";
      ctx.fillText("Greater wall", vesselStartX + vesselLen * 0.47, chainY2);
      ctx.fillText("deformation", vesselStartX + vesselLen * 0.47, chainY2 + 16);

      ctx.font = "16px 'Inter', sans-serif";
      ctx.fillStyle = "#aaa";
      ctx.fillText("→", vesselStartX + vesselLen * 0.62, chainY2);

      ctx.font = "13px 'Inter', sans-serif";
      ctx.fillStyle = "#444";
      ctx.fillText("Slower pressure wave", vesselStartX + vesselLen * 0.78, chainY2);
      ctx.fillText("propagation", vesselStartX + vesselLen * 0.78, chainY2 + 16);
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = "#1a5276";
      ctx.fillText("→ Lower PWV (↓)", vesselStartX + vesselLen * 0.78, chainY2 + 32);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [drawHeart, drawVessel3D]);

  return (
    <div className="w-full">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f8f6f4 0%, #fdf9f6 50%, #f5f0eb 100%)",
          border: "1px solid rgba(180, 160, 140, 0.25)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          padding: "24px",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: 640, display: "block" }}
        />
      </div>
      {/* Compact legend below */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[rgba(230,57,70,0.2)] bg-[rgba(230,57,70,0.03)]">
          <h4 className="font-semibold text-[#c23038] text-sm mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#c23038] inline-block" />
            Stiff Vessel — ↓ Compliance
          </h4>
          <p className="text-xs text-[rgba(232,232,240,0.55)] leading-relaxed">
            Rigid arterial walls cause minimal wall deformation during pulse propagation.
            The pulse wave travels faster with early wave reflection, increasing cardiac afterload and contributing to left atrial remodeling.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[rgba(69,123,157,0.2)] bg-[rgba(69,123,157,0.03)]">
          <h4 className="font-semibold text-[#457b9d] text-sm mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#457b9d] inline-block" />
            Elastic Vessel — ↑ Compliance
          </h4>
          <p className="text-xs text-[rgba(232,232,240,0.55)] leading-relaxed">
            Flexible walls absorb each pulse through expansion and compression (the Windkessel effect).
            Pressure wave propagates slowly, maintaining healthy ventricular–arterial coupling and lower PWV.
          </p>
        </div>
      </div>
    </div>
  );
}
