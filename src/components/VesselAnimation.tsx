"use client";

import { useEffect, useRef, useCallback } from "react";

export default function VesselAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const heartImgRef = useRef<HTMLImageElement | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Load heart image on mount                                          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const img = new Image();
    img.src = "/heart-cross-section.png";
    img.onload = () => {
      heartImgRef.current = img;
    };
  }, []);

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
          return baseInnerR;
        } else {
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

      const tracePath = (pts: [number, number][]) => {
        pts.forEach(([px, py], idx) =>
          idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        );
      };

      // ─── Blood interior ───
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

      // ─── Top wall ───
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

      // Specular highlight
      ctx.beginPath();
      tracePath(topOuter);
      ctx.strokeStyle = "rgba(255, 200, 200, 0.3)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // ─── Bottom wall ───
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

      // Inner lumen edge shine
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

      // ─── Left end-cap ───
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

      // ─── Arrows inside ───
      if (isStiff) {
        // One large white arrow spanning most of the vessel
        const arrStartX = x1 + length * 0.08;
        const arrEndX = x1 + length * 0.82;
        const arrW = baseInnerR * 0.35;
        const headW = baseInnerR * 0.7;
        const headLen = length * 0.06;
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

        const ag = ctx.createLinearGradient(arrStartX, 0, arrEndX, 0);
        ag.addColorStop(0, "rgba(255,255,255,0.25)");
        ag.addColorStop(0.4, "rgba(255,255,255,0.65)");
        ag.addColorStop(1, "rgba(255,255,255,0.9)");
        ctx.fillStyle = ag;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      } else {
        // Multiple flowing arrows for elastic vessel
        const arrowCount = 4;
        const spacing = length / (arrowCount + 0.5);

        for (let a = 0; a < arrowCount; a++) {
          const rawX = ((time * 40 + a * spacing) % (length + 40)) - 20;
          const ax = x1 + rawX;
          if (ax < x1 + 10 || ax > x1 + length - 30) continue;

          const seg = Math.floor((rawX / length) * numPts);
          const ir = getInnerR(Math.max(0, Math.min(seg, numPts)));

          const fadeIn = Math.min(1, rawX / 60);
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

          const aGrad = ctx.createLinearGradient(-bodyLen, 0, headLen, 0);
          aGrad.addColorStop(0, "rgba(255,255,255,0.3)");
          aGrad.addColorStop(1, "rgba(255,255,255,0.85)");
          ctx.fillStyle = aGrad;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      // ─── Stiff vessel: tapered right end + wave reflection ───
      if (isStiff) {
        const endX = x1 + length;
        const taperLen = 35;
        const ir = baseInnerR;
        const or_ = ir + wallThick;

        // Top taper
        ctx.beginPath();
        ctx.moveTo(endX, centerY - or_);
        ctx.lineTo(endX + taperLen, centerY - or_ * 0.45);
        ctx.lineTo(endX + taperLen, centerY - ir * 0.3);
        ctx.lineTo(endX, centerY - ir);
        ctx.closePath();
        const tgt = ctx.createLinearGradient(endX, centerY - or_, endX, centerY);
        tgt.addColorStop(0, "#d08080");
        tgt.addColorStop(1, "#8b2020");
        ctx.fillStyle = tgt;
        ctx.fill();

        // Bottom taper
        ctx.beginPath();
        ctx.moveTo(endX, centerY + ir);
        ctx.lineTo(endX + taperLen, centerY + ir * 0.3);
        ctx.lineTo(endX + taperLen, centerY + or_ * 0.45);
        ctx.lineTo(endX, centerY + or_);
        ctx.closePath();
        const tgb = ctx.createLinearGradient(endX, centerY, endX, centerY + or_);
        tgb.addColorStop(0, "#8b2020");
        tgb.addColorStop(1, "#d08080");
        ctx.fillStyle = tgb;
        ctx.fill();

        // Blood in taper
        ctx.beginPath();
        ctx.moveTo(endX, centerY - ir);
        ctx.lineTo(endX + taperLen, centerY - ir * 0.3);
        ctx.lineTo(endX + taperLen, centerY + ir * 0.3);
        ctx.lineTo(endX, centerY + ir);
        ctx.closePath();
        ctx.fillStyle = "#4a0505";
        ctx.fill();

        // Dashed reflection arrows
        const refAlpha = 0.5 + Math.sin(time * 3) * 0.2;
        ctx.save();
        ctx.strokeStyle = `rgba(180, 50, 50, ${refAlpha})`;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);

        ctx.beginPath();
        ctx.moveTo(endX + taperLen - 5, centerY - ir * 0.2);
        ctx.quadraticCurveTo(endX + taperLen + 20, centerY - 28, endX + taperLen, centerY - 38);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(endX + taperLen, centerY - 38);
        ctx.lineTo(endX + taperLen + 5, centerY - 32);
        ctx.moveTo(endX + taperLen, centerY - 38);
        ctx.lineTo(endX + taperLen - 5, centerY - 33);
        ctx.stroke();

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

        // Small reflected arrows going left
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

        // Label
        ctx.font = "italic 13px 'Inter', sans-serif";
        ctx.fillStyle = "#b03030";
        ctx.textAlign = "left";
        ctx.fillText("Early wave", endX + taperLen + 12, centerY - 12);
        ctx.fillText("reflection", endX + taperLen + 12, centerY + 4);
      }

      // ─── Elastic vessel: blue expansion/compression arrows ───
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
            ctx.fillStyle = "#1a5276";
            ctx.textAlign = "center";
            ctx.fillText("Wall expansion", x, centerY - or_ - 28);
          } else if (ir < baseInnerR * 0.8) {
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

  /* ─── Blue expansion arrow ─── */
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

    ctx.beginPath();
    ctx.arc(
      x,
      y + dir * 3,
      16,
      pointsUp ? Math.PI * 0.15 : -Math.PI * 0.85,
      pointsUp ? Math.PI * 0.85 : -Math.PI * 0.15
    );
    ctx.stroke();

    const r = 16;
    const angle1 = pointsUp ? Math.PI * 0.15 : -Math.PI * 0.85;
    const angle2 = pointsUp ? Math.PI * 0.85 : -Math.PI * 0.15;

    const lx = x + Math.cos(angle1) * r;
    const ly = y + dir * 3 + Math.sin(angle1) * r;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + (pointsUp ? -4 : 4), ly + dir * 5);
    ctx.lineTo(lx + (pointsUp ? 5 : -3), ly + dir * 1);
    ctx.closePath();
    ctx.fill();

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

  /* ─── Blue compression arrow ─── */
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

    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x, y + dir * 8);
    ctx.lineTo(x + 8, y);
    ctx.stroke();

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

      // ── Layout ──
      const heartImgSize = 160;
      const heartAreaW = heartImgSize + 20;
      const vesselStartX = heartAreaW + 10;
      const vesselLen = w - vesselStartX - 110;
      const stiffY = h * 0.27;
      const elasticY = h * 0.73;

      // ──── STIFF VESSEL SECTION ────

      // Title
      ctx.font = "bold 18px 'Inter', sans-serif";
      ctx.fillStyle = "#c23038";
      ctx.textAlign = "center";
      ctx.fillText(
        "Stiff Vessel (↓ Compliance)",
        vesselStartX + vesselLen / 2,
        stiffY - 62
      );

      // Draw heart image
      if (heartImgRef.current) {
        const img = heartImgRef.current;
        const imgAspect = img.width / img.height;
        const drawH = heartImgSize;
        const drawW = drawH * imgAspect;
        const imgX = 10;
        const imgY = stiffY - drawH / 2;
        ctx.drawImage(img, imgX, imgY, drawW, drawH);

        // Connection line from heart image to vessel
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

      // Draw stiff vessel
      drawVessel3D(ctx, vesselStartX, stiffY, vesselLen, 20, 14, t, true);

      // Bottom labels
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
      ctx.fillText(
        "Elastic Vessel (↑ Compliance)",
        vesselStartX + vesselLen / 2,
        elasticY - 78
      );

      // Simple vertical connector bar for elastic vessel (like reference image)
      const barX = vesselStartX - 30;
      const barH = 56;
      ctx.fillStyle = "#ddd";
      ctx.fillRect(barX - 4, elasticY - barH / 2, 8, barH);
      ctx.strokeStyle = "#bbb";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 4, elasticY - barH / 2, 8, barH);

      // Connection line
      ctx.beginPath();
      ctx.moveTo(barX + 4, elasticY);
      ctx.lineTo(vesselStartX, elasticY);
      const cg2 = ctx.createLinearGradient(barX, elasticY, vesselStartX, elasticY);
      cg2.addColorStop(0, "#d08080");
      cg2.addColorStop(1, "#8b2020");
      ctx.strokeStyle = cg2;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Draw elastic vessel
      drawVessel3D(ctx, vesselStartX, elasticY, vesselLen, 20, 14, t, false);

      // Bottom labels
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
  }, [drawVessel3D]);

  return (
    <div className="w-full">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #f8f6f4 0%, #fdf9f6 50%, #f5f0eb 100%)",
          border: "1px solid rgba(180, 160, 140, 0.25)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          padding: "24px",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: 640, display: "block" }}
        />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-[rgba(230,57,70,0.2)] bg-[rgba(230,57,70,0.03)]">
          <h4 className="font-semibold text-[#c23038] text-sm mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#c23038] inline-block" />
            Stiff Vessel — ↓ Compliance
          </h4>
          <p className="text-xs text-[rgba(232,232,240,0.55)] leading-relaxed">
            Rigid arterial walls cause minimal wall deformation during pulse
            propagation. The pulse wave travels faster with early wave
            reflection, increasing cardiac afterload and contributing to left
            atrial remodeling.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[rgba(69,123,157,0.2)] bg-[rgba(69,123,157,0.03)]">
          <h4 className="font-semibold text-[#457b9d] text-sm mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#457b9d] inline-block" />
            Elastic Vessel — ↑ Compliance
          </h4>
          <p className="text-xs text-[rgba(232,232,240,0.55)] leading-relaxed">
            Flexible walls absorb each pulse through expansion and compression
            (the Windkessel effect). Pressure wave propagates slowly,
            maintaining healthy ventricular–arterial coupling and lower PWV.
          </p>
        </div>
      </div>
    </div>
  );
}
