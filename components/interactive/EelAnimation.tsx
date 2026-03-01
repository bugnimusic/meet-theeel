"use client";

import { useEffect, useRef } from "react";

interface EelConfig {
  speed: number;
  amplitude: number;
  frequency: number;
  yOffset: number;
  segments: number;
  maxWidth: number;
  opacity: number;
  phase: number;
  direction: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  vy: number;
  vx: number;
  life: number;
  maxLife: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  life: number;
}

export default function EelAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const bubbles: Bubble[] = [];
    const ripples: Ripple[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const eels: EelConfig[] = [
      { speed: 0.5, amplitude: 60, frequency: 0.012, yOffset: 0.35, segments: 140, maxWidth: 28, opacity: 0.8, phase: 0, direction: 1 },
      { speed: 0.65, amplitude: 45, frequency: 0.015, yOffset: 0.55, segments: 110, maxWidth: 20, opacity: 0.6, phase: 2, direction: -1 },
      { speed: 0.85, amplitude: 35, frequency: 0.02, yOffset: 0.25, segments: 80, maxWidth: 12, opacity: 0.45, phase: 1, direction: 1 },
      { speed: 0.9, amplitude: 30, frequency: 0.022, yOffset: 0.65, segments: 70, maxWidth: 10, opacity: 0.35, phase: 4, direction: -1 },
      { speed: 1.1, amplitude: 25, frequency: 0.025, yOffset: 0.75, segments: 56, maxWidth: 8, opacity: 0.25, phase: 5.5, direction: 1 },
    ];

    const getPoints = (w: number, h: number, eel: EelConfig, time: number) => {
      const { speed, amplitude, frequency, yOffset, segments, phase, direction } = eel;
      const centerY = h * yOffset;
      const totalLen = segments * 4;
      const headX = direction > 0
        ? ((time * speed * 80 + phase * 200) % (w + totalLen)) - totalLen * 0.3
        : w + totalLen * 0.3 - ((time * speed * 80 + phase * 200) % (w + totalLen));

      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const x = headX - i * 4 * direction;
        const waveAmp = amplitude * (0.2 + t * 0.8);
        const y = centerY + Math.sin((x * frequency * direction) + (time * speed * 3) + phase) * waveAmp;
        points.push({ x, y });
      }
      return points;
    };

    const getBodyWidth = (t: number, maxWidth: number): number => {
      if (t < 0.05) return maxWidth * 1.3 * (0.7 + t * 6); // 頭部大 1.3 倍
      if (t < 0.1) return maxWidth * (1.3 - (t - 0.05) * 6); // 過渡到正常
      if (t < 0.4) return maxWidth;
      const tailT = (t - 0.4) / 0.6;
      return Math.max(maxWidth * Math.pow(1 - tailT, 0.6), 0.5);
    };

    // 產生泡泡和漣漪
    const spawnEffects = (points: { x: number; y: number }[], eel: EelConfig) => {
      // 泡泡：從身體隨機位置冒出
      if (Math.random() < 0.3 * eel.opacity) {
        const idx = Math.floor(Math.random() * Math.min(points.length, 30));
        const p = points[idx];
        const spread = eel.maxWidth * 0.5;
        bubbles.push({
          x: p.x + (Math.random() - 0.5) * spread,
          y: p.y + (Math.random() - 0.5) * spread,
          radius: 1 + Math.random() * 3 * (eel.maxWidth / 28),
          opacity: 0.3 + Math.random() * 0.4,
          vy: -(0.3 + Math.random() * 0.8),
          vx: (Math.random() - 0.5) * 0.3,
          life: 0,
          maxLife: 40 + Math.random() * 60,
        });
      }

      // 漣漪：從尾巴擺動時產生
      if (Math.random() < 0.15 * eel.opacity && points.length > 5) {
        const tailIdx = Math.floor(points.length * (0.6 + Math.random() * 0.3));
        const p = points[Math.min(tailIdx, points.length - 1)];
        ripples.push({
          x: p.x,
          y: p.y,
          radius: 2,
          maxRadius: 15 + Math.random() * 20 * (eel.maxWidth / 28),
          opacity: 0.25 * eel.opacity,
          life: 0,
        });
      }
    };

    const updateAndDrawBubbles = (ctx: CanvasRenderingContext2D) => {
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life++;
        b.y += b.vy;
        b.x += b.vx + Math.sin(b.life * 0.1) * 0.2; // 輕微左右搖擺

        const lifeRatio = b.life / b.maxLife;
        const alpha = b.opacity * (1 - lifeRatio);

        if (b.life >= b.maxLife || alpha <= 0) {
          bubbles.splice(i, 1);
          continue;
        }

        // 泡泡外圈
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(150, 220, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // 泡泡高光
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 240, 255, ${alpha * 0.4})`;
        ctx.fill();
      }

      // 限制泡泡數量
      while (bubbles.length > 120) bubbles.shift();
    };

    const updateAndDrawRipples = (ctx: CanvasRenderingContext2D) => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.life++;
        const progress = r.radius / r.maxRadius;
        r.radius += 0.5;

        const alpha = r.opacity * (1 - progress);
        if (r.radius >= r.maxRadius || alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 內圈漣漪
        if (r.radius > 5) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(100, 180, 255, ${alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      while (ripples.length > 40) ripples.shift();
    };

    const drawEel = (ctx: CanvasRenderingContext2D, w: number, h: number, eel: EelConfig, time: number) => {
      const { maxWidth, opacity } = eel;
      const points = getPoints(w, h, eel, time);
      if (points.length < 2) return;

      // 產生泡泡和漣漪
      spawnEffects(points, eel);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 顏色漸層函數：頭部偏藍 → 尾部偏粉紫
      const getColor = (t: number) => {
        // 頭：(80, 50, 200) 深藍紫 → 尾：(200, 120, 240) 粉紫
        const r = Math.round(80 + t * 120);
        const g = Math.round(50 + t * 70);
        const b = Math.round(200 + t * 40);
        return { r, g, b };
      };

      // 1. 外層 Glow
      for (let i = 0; i < points.length - 1; i += 3) {
        const t = i / points.length;
        const width = getBodyWidth(t, maxWidth);
        const c = getColor(t);
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        const ni = Math.min(i + 3, points.length - 1);
        ctx.lineTo(points[ni].x, points[ni].y);
        ctx.lineWidth = width + 16;
        ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${opacity * 0.06 * (1 - t)})`;
        ctx.stroke();
      }

      // 2. 白色鰭
      drawFins(ctx, points, maxWidth, opacity, time, eel);

      // 3. 主體（漸層：頭深藍紫 → 尾粉紫）
      for (let i = 0; i < points.length - 1; i++) {
        const t = i / points.length;
        const width = getBodyWidth(t, maxWidth);
        const c = getColor(t);
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.lineWidth = width;
        ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${opacity * (1 - t * 0.5)})`;
        ctx.stroke();
      }

      // 4. 身體亮面（同樣漸層）
      for (let i = 0; i < points.length - 1; i += 2) {
        const t = i / points.length;
        const width = getBodyWidth(t, maxWidth) * 0.6;
        const ni = Math.min(i + 2, points.length - 1);
        // 亮面偏淺
        const r = Math.round(140 + t * 80);
        const g = Math.round(120 + t * 60);
        const b = Math.round(240 + t * 15);
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[ni].x, points[ni].y);
        ctx.lineWidth = width;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.45 * (1 - t * 0.6)})`;
        ctx.stroke();
      }

      // 5. 骨頭
      drawBones(ctx, points, maxWidth, opacity);

      // 6. 頭部（無圓形，只有眼睛）
      const head = points[0];
      const headNext = points[Math.min(3, points.length - 1)];
      
      // 計算頭部朝向
      const hdx = head.x - headNext.x;
      const hdy = head.y - headNext.y;
      const hLen = Math.sqrt(hdx * hdx + hdy * hdy) || 1;
      const hNx = -hdy / hLen; // 法線（垂直於行進方向）
      const hNy = hdx / hLen;

      // 眼睛（八字形、圓潤、會轉）
      const headColor = getColor(0);
      const eyeDist = maxWidth * 0.35;
      const eyeSize = maxWidth * 0.22; // 頭部放大
      const headAngle = Math.atan2(hdy, hdx);
      
      // 八字形（內八）：上眼往下斜，下眼往上斜
      const eye1x = head.x + hNx * eyeDist;
      const eye1y = head.y + hNy * eyeDist;
      drawLeafEye(ctx, eye1x, eye1y, eyeSize, headAngle - 0.25, opacity, headColor, time);

      const eye2x = head.x - hNx * eyeDist;
      const eye2y = head.y - hNy * eyeDist;
      drawLeafEye(ctx, eye2x, eye2y, eyeSize, headAngle + 0.25, opacity, headColor, time);
    };

    const drawLeafEye = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      angle: number,
      opacity: number,
      bodyColor: { r: number; g: number; b: number },
      time: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const s = size * 2.2;

      // 眼窩
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 1.15, s * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.max(0, bodyColor.r - 30)}, ${Math.max(0, bodyColor.g - 20)}, ${Math.max(0, bodyColor.b - 20)}, ${opacity * 0.7})`;
      ctx.fill();

      // 白眼球（縮小 0.3 倍）
      const eyeS = s * 0.7;
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeS, eyeS * 0.65, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(235, 235, 230, ${opacity * 0.92})`;
      ctx.fill();

      // 眼珠轉圈（放大 0.2 倍）
      const pupilOrbitR = eyeS * 0.2;
      const pupilAngle = time * 0.8;
      const pupilX = Math.cos(pupilAngle) * pupilOrbitR;
      const pupilY = Math.sin(pupilAngle) * pupilOrbitR * 0.6;
      const pupilR = s * 0.38;

      // 深藍虹膜
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(15, 25, 90, ${opacity * 0.95})`;
      ctx.fill();

      // 虹膜紋路（放射狀細線）
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(pupilX + Math.cos(a) * pupilR * 0.3, pupilY + Math.sin(a) * pupilR * 0.3);
        ctx.lineTo(pupilX + Math.cos(a) * pupilR * 0.85, pupilY + Math.sin(a) * pupilR * 0.85);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `rgba(30, 50, 130, ${opacity * 0.4})`;
        ctx.stroke();
      }

      // 瞳孔
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, pupilR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(3, 5, 25, ${opacity * 0.95})`;
      ctx.fill();

      // 高光（跟著眼珠轉）
      ctx.beginPath();
      ctx.arc(pupilX - pupilR * 0.25, pupilY - pupilR * 0.25, pupilR * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
      ctx.fill();

      // 第二高光（小的）
      ctx.beginPath();
      ctx.arc(pupilX + pupilR * 0.2, pupilY + pupilR * 0.15, pupilR * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
      ctx.fill();

      ctx.restore();
    };

    const drawFins = (
      ctx: CanvasRenderingContext2D,
      points: { x: number; y: number }[],
      maxWidth: number,
      opacity: number,
      time: number,
      eel: EelConfig
    ) => {
      // 烏蘇拉鰻魚風格：大片飄逸水草鰭
      const finSpacing = 3; // 更密的鰭
      
      for (let i = 2; i < points.length - 4; i += finSpacing) {
        const t = i / points.length;
        if (t > 0.9) continue;

        const p = points[i];
        const pNext = points[Math.min(i + 3, points.length - 1)];
        const dx = pNext.x - p.x;
        const dy = pNext.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const bodyW = getBodyWidth(t, maxWidth);
        
        // 鰭的大小：中間最大，頭尾較小
        let finScale: number;
        if (t < 0.1) finScale = t * 8;
        else if (t < 0.5) finScale = 1;
        else finScale = Math.max(0, 1 - (t - 0.5) * 1.5);

        // 飄動的波浪（多層疊加，像水草）
        const wave1 = Math.sin(time * 2.5 + i * 0.15 + eel.phase) * 0.7;
        const wave2 = Math.sin(time * 1.8 + i * 0.25 + eel.phase * 1.5) * 0.4;
        const wave3 = Math.sin(time * 3.2 + i * 0.1) * 0.3;
        const totalWave = wave1 + wave2 + wave3;

        const finLength = bodyW * (0.8 + totalWave * 0.4) * finScale;
        if (finLength < 1) continue;

        // 上鰭（大片飄逸）
        const baseUpX = p.x + nx * bodyW * 0.35;
        const baseUpY = p.y + ny * bodyW * 0.35;
        
        // 控制點偏移（讓鰭像水草一樣飄動）
        const cpWave = Math.sin(time * 2 + i * 0.2 + eel.phase) * finLength * 0.5;
        const tipWave = Math.sin(time * 3 + i * 0.18 + eel.phase) * finLength * 0.3;

        ctx.beginPath();
        ctx.moveTo(baseUpX, baseUpY);
        ctx.bezierCurveTo(
          baseUpX + nx * finLength * 0.5 + dx * cpWave / len,
          baseUpY + ny * finLength * 0.5 + dy * cpWave / len,
          baseUpX + nx * finLength * 0.8 + dx * tipWave / len,
          baseUpY + ny * finLength * 0.8 + dy * tipWave / len,
          baseUpX + nx * finLength + dx * (tipWave * 0.5) / len,
          baseUpY + ny * finLength + dy * (tipWave * 0.5) / len
        );
        
        // 鰭的寬度漸變（根部寬、尖端細）
        const finAlpha = opacity * 0.18 * finScale * (1 - t * 0.3);
        ctx.lineWidth = Math.max(1, 3 * finScale * (1 - t * 0.5));
        ctx.strokeStyle = `rgba(220, 230, 255, ${finAlpha})`;
        ctx.stroke();

        // 鰭的半透明填充面（水草飄的感覺）
        if (i % (finSpacing * 2) === 2 && finScale > 0.3) {
          const nextI = Math.min(i + finSpacing * 2, points.length - 1);
          const pN = points[nextI];
          const bodyWN = getBodyWidth(nextI / points.length, maxWidth);
          const baseUpX2 = pN.x + nx * bodyWN * 0.35;
          const baseUpY2 = pN.y + ny * bodyWN * 0.35;

          ctx.beginPath();
          ctx.moveTo(baseUpX, baseUpY);
          ctx.bezierCurveTo(
            baseUpX + nx * finLength * 0.5 + dx * cpWave / len,
            baseUpY + ny * finLength * 0.5 + dy * cpWave / len,
            baseUpX + nx * finLength * 0.8,
            baseUpY + ny * finLength * 0.8,
            baseUpX + nx * finLength,
            baseUpY + ny * finLength
          );
          ctx.lineTo(baseUpX2, baseUpY2);
          ctx.closePath();
          ctx.fillStyle = `rgba(200, 215, 255, ${finAlpha * 0.25})`;
          ctx.fill();
        }

        // 下鰭（對稱但相位不同）
        const baseDownX = p.x - nx * bodyW * 0.35;
        const baseDownY = p.y - ny * bodyW * 0.35;
        const cpWave2 = Math.sin(time * 2.2 + i * 0.22 + eel.phase + 1.5) * finLength * 0.5;
        const tipWave2 = Math.sin(time * 2.8 + i * 0.16 + eel.phase + 1.5) * finLength * 0.3;

        ctx.beginPath();
        ctx.moveTo(baseDownX, baseDownY);
        ctx.bezierCurveTo(
          baseDownX - nx * finLength * 0.5 + dx * cpWave2 / len,
          baseDownY - ny * finLength * 0.5 + dy * cpWave2 / len,
          baseDownX - nx * finLength * 0.8 + dx * tipWave2 / len,
          baseDownY - ny * finLength * 0.8 + dy * tipWave2 / len,
          baseDownX - nx * finLength + dx * (tipWave2 * 0.5) / len,
          baseDownY - ny * finLength + dy * (tipWave2 * 0.5) / len
        );
        ctx.lineWidth = Math.max(1, 3 * finScale * (1 - t * 0.5));
        ctx.strokeStyle = `rgba(220, 230, 255, ${finAlpha * 0.8})`;
        ctx.stroke();
      }
    };

    const drawBones = (
      ctx: CanvasRenderingContext2D,
      points: { x: number; y: number }[],
      maxWidth: number,
      opacity: number
    ) => {
      // 脊椎骨色：青藍綠 (0, 190, 180)
      const boneR = 0, boneG = 190, boneB = 180;

      // 一截一截的脊椎（不是連續線）
      const vertebraeSpacing = 5; // 每 5 個 point 一節
      for (let i = 2; i < points.length - vertebraeSpacing; i += vertebraeSpacing) {
        const t = i / points.length;
        if (t > 0.85) continue;

        const p1 = points[i];
        const p2 = points[Math.min(i + vertebraeSpacing - 1, points.length - 1)];

        // 每節脊椎骨
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = maxWidth * 0.09 * (1 - t * 0.5);
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgba(${boneR}, ${boneG}, ${boneB}, ${opacity * 0.55 * (1 - t * 0.4)})`;
        ctx.stroke();

        // 節點（椎骨關節的圓點）
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, maxWidth * 0.05 * (1 - t * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${boneR + 40}, ${boneG + 30}, ${boneB + 40}, ${opacity * 0.6 * (1 - t * 0.3)})`;
        ctx.fill();
      }

      // 肋骨（從每個椎骨節點往兩側延伸）
      for (let i = 4; i < points.length - 5; i += vertebraeSpacing) {
        const t = i / points.length;
        if (t > 0.75) continue;

        const p = points[i];
        const pNext = points[Math.min(i + 3, points.length - 1)];
        const dx = pNext.x - p.x;
        const dy = pNext.y - p.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const bodyW = getBodyWidth(t, maxWidth);
        const ribLen = bodyW * 0.32 * (1 - t * 0.5);

        // 肋骨（稍微彎曲 — 用兩段線模擬）
        const midFactor = 0.6;
        // 上肋
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(
          p.x + nx * ribLen * midFactor + dx * 0.3,
          p.y + ny * ribLen * midFactor + dy * 0.3,
          p.x + nx * ribLen,
          p.y + ny * ribLen
        );
        ctx.lineWidth = maxWidth * 0.03;
        ctx.strokeStyle = `rgba(${boneR}, ${boneG}, ${boneB}, ${opacity * 0.3 * (1 - t)})`;
        ctx.stroke();

        // 下肋
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(
          p.x - nx * ribLen * midFactor + dx * 0.3,
          p.y - ny * ribLen * midFactor + dy * 0.3,
          p.x - nx * ribLen,
          p.y - ny * ribLen
        );
        ctx.lineWidth = maxWidth * 0.03;
        ctx.strokeStyle = `rgba(${boneR}, ${boneG}, ${boneB}, ${opacity * 0.25 * (1 - t)})`;
        ctx.stroke();
      }
    };

    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      // 先畫小的再畫大的
      for (let i = eels.length - 1; i >= 0; i--) {
        drawEel(ctx, w, h, eels[i], time);
      }

      // 泡泡和漣漪在最上層
      updateAndDrawRipples(ctx);
      updateAndDrawBubbles(ctx);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ opacity: 0.9 }}
    />
  );
}
