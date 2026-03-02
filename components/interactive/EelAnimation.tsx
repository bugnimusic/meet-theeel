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
    let scrollProgressTarget = 0; // 目標值（raw scroll）
    let scrollProgress = 0; // 平滑後的值（用於渲染）
    const bubbles: Bubble[] = [];
    const ripples: Ripple[] = [];
    // Section-specific particles
    const eggs: { x: number; y: number; size: number; wobble: number; opacity: number; vy: number }[] = [];
    const scales: { x: number; y: number; size: number; angle: number; opacity: number; vy: number; vx: number; rot: number }[] = [];
    const vortexParticles: { angle: number; radius: number; speed: number; size: number; opacity: number }[] = [];

    const updateScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressTarget = docH > 0 ? window.scrollY / docH : 0;
    };
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    const isMobile = window.innerWidth < 768;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5);
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

    // 抓取系統（皮克敏風格）
    let mouseX = 0, mouseY = 0;
    let grabbedEelIdx = -1;
    let grabOffsetX = 0, grabOffsetY = 0;
    const eelGrabState: { grabbed: boolean; targetX: number; targetY: number; returnT: number }[] = [];

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      // 找最近的鰻魚頭部
      for (let i = 0; i < eels.length; i++) {
        const pts = lastPoints[i];
        if (!pts || pts.length === 0) continue;
        // 檢查前 20% 的身體（不只是頭，身體也能抓）
        const checkLen = Math.floor(pts.length * 0.3);
        for (let j = 0; j < checkLen; j++) {
          const dx = pts[j].x - mx;
          const dy = pts[j].y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < eels[i].maxWidth * 1.5) {
            grabbedEelIdx = i;
            grabOffsetX = dx;
            grabOffsetY = dy;
            eelGrabState[i] = { grabbed: true, targetX: mx, targetY: my, returnT: 0 };
            // cursor hidden;
            return;
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (grabbedEelIdx >= 0) {
        eelGrabState[grabbedEelIdx].targetX = mouseX;
        eelGrabState[grabbedEelIdx].targetY = mouseY;
      }
    };

    const handleMouseUp = () => {
      if (grabbedEelIdx >= 0) {
        eelGrabState[grabbedEelIdx].grabbed = false;
        eelGrabState[grabbedEelIdx].returnT = 0;
        grabbedEelIdx = -1;
        // cursor hidden;
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    const allEels: EelConfig[] = [
      { speed: 0.5, amplitude: 120, frequency: 0.006, yOffset: 0.35, segments: isMobile ? 60 : 100, maxWidth: isMobile ? 36 : 56, opacity: 0.8, phase: 0, direction: 1 },
      { speed: 0.65, amplitude: 90, frequency: 0.0075, yOffset: 0.55, segments: isMobile ? 50 : 80, maxWidth: isMobile ? 28 : 40, opacity: 0.6, phase: 2, direction: -1 },
      { speed: 0.85, amplitude: 70, frequency: 0.01, yOffset: 0.25, segments: isMobile ? 40 : 60, maxWidth: isMobile ? 18 : 24, opacity: 0.45, phase: 1, direction: 1 },
      { speed: 0.9, amplitude: 60, frequency: 0.011, yOffset: 0.65, segments: 50, maxWidth: 20, opacity: 0.35, phase: 4, direction: -1 },
      { speed: 1.1, amplitude: 50, frequency: 0.0125, yOffset: 0.75, segments: 40, maxWidth: 16, opacity: 0.25, phase: 5.5, direction: 1 },
    ];
    // 手機只留 3 條鰻魚（效能優先）
    const eels = isMobile ? allEels.slice(0, 3) : allEels;

    // 儲存每條鰻魚的最新點（用於碰撞檢測）
    const lastPoints: { x: number; y: number }[][] = eels.map(() => []);
    // 初始化抓取狀態
    for (let i = 0; i < eels.length; i++) {
      if (!eelGrabState[i]) eelGrabState[i] = { grabbed: false, targetX: 0, targetY: 0, returnT: 1 };
    }

    const getPoints = (w: number, h: number, eel: EelConfig, time: number, eelIdx?: number) => {
      const { speed, amplitude, frequency, yOffset, segments, phase, direction } = eel;
      const totalLen = segments * 8;
      
      // scrollProgress 控制游泳方向：0 = 水平游，1 = 完全往下潛
      const verticalMix = Math.min(1, scrollProgress * 2.5); // 快速過渡到垂直
      
      // 水平模式的頭部位置
      const centerY = h * yOffset;
      const horizHeadX = direction > 0
        ? ((time * speed * 80 + phase * 200) % (w + totalLen)) - totalLen * 0.3
        : w + totalLen * 0.3 - ((time * speed * 80 + phase * 200) % (w + totalLen));
      
      // 垂直模式的頭部位置（往下游）
      const centerX = w * (0.15 + yOffset * 0.7); // 用 yOffset 當 xOffset
      const vertHeadY = ((time * speed * 60 + phase * 200) % (h + totalLen)) - totalLen * 0.3;
      
      // 混合水平和垂直
      let headX = horizHeadX * (1 - verticalMix) + centerX * verticalMix;
      let headY = centerY * (1 - verticalMix) + vertHeadY * verticalMix;

      // 如果被抓住，頭部跟著滑鼠
      const gs = eelIdx !== undefined ? eelGrabState[eelIdx] : undefined;
      if (gs && gs.grabbed) {
        headX = gs.targetX + grabOffsetX;
        headY = gs.targetY + grabOffsetY;
      } else if (gs && !gs.grabbed && gs.returnT < 1) {
        gs.returnT = Math.min(1, gs.returnT + 0.02);
        const t = gs.returnT;
        const ease = t * t * (3 - 2 * t);
        headX = gs.targetX * (1 - ease) + headX * ease;
        headY = gs.targetY * (1 - ease) + headY * ease;
      }

      const isGrabbed = gs && gs.grabbed;
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        
        if (isGrabbed) {
          const x = headX - i * 8 * direction;
          const struggle = Math.sin(time * 15 + i * 0.3) * amplitude * 0.6 * t;
          const droop = t * t * 40;
          points.push({ x, y: headY + struggle + droop });
        } else {
          // 水平游的座標
          const hx = headX - i * 8 * direction;
          const baseYH = (gs && gs.returnT < 1) ? headY : centerY;
          const waveAmpH = amplitude * (0.2 + t * 0.8);
          const hy = baseYH + Math.sin((hx * frequency * direction) + (time * speed * 3) + phase) * waveAmpH;
          
          // 垂直游的座標（往下，左右擺動）
          const vy = headY - i * 8; // 身體在頭的上方（因為往下游）
          const waveAmpV = amplitude * (0.2 + t * 0.8);
          const vx = centerX + Math.sin((vy * frequency) + (time * speed * 3) + phase) * waveAmpV;
          
          // 混合
          const x = hx * (1 - verticalMix) + vx * verticalMix;
          const y = hy * (1 - verticalMix) + vy * verticalMix;
          points.push({ x, y });
        }
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

        // 泡泡外層發光
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 180, 255, ${alpha * 0.15})`;
        ctx.fill();

        // 泡泡主體（更亮）
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 210, 255, ${alpha * 0.3})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(180, 230, 255, ${alpha * 0.7})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 泡泡高光（更亮更大）
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.25, b.y - b.radius * 0.25, b.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 245, 255, ${alpha * 0.6})`;
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
      const eelIdx = eels.indexOf(eel);
      const points = getPoints(w, h, eel, time, eelIdx);
      lastPoints[eelIdx] = points;
      if (points.length < 2) return;

      // 產生泡泡和漣漪
      spawnEffects(points, eel);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 顏色漸層函數：頭部偏藍 → 尾部偏粉紫，隨深度變深
      const depthDarken = scrollProgress * 0.5; // 越深顏色越暗
      const getColor = (t: number) => {
        // 頭：(80, 50, 200) 深藍紫 → 尾：(200, 120, 240) 粉紫
        // 深度：越深越偏向深靛藍
        const r = Math.round((80 + t * 120) * (1 - depthDarken * 0.6));
        const g = Math.round((50 + t * 70) * (1 - depthDarken * 0.4));
        const b = Math.round(Math.min(255, (200 + t * 40) * (1 - depthDarken * 0.15)));
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

      // 蛇舌頭（粉紅色，快速甩動）
      const tongueFlick = Math.sin(time * 12) * 0.4 + Math.sin(time * 8) * 0.2; // 快速甩
      const tongueLen = maxWidth * 1.2;
      const tongueBaseX = head.x + (hdx / hLen) * maxWidth * 0.4;
      const tongueBaseY = head.y + (hdy / hLen) * maxWidth * 0.4;
      const tongueTipX = tongueBaseX + (hdx / hLen) * tongueLen;
      const tongueTipY = tongueBaseY + (hdy / hLen) * tongueLen;
      // 分岔
      const forkLen = tongueLen * 0.3;
      const forkAngle = 0.35 + tongueFlick * 0.15;
      const forkX1 = tongueTipX + Math.cos(Math.atan2(hdy, hdx) + forkAngle) * forkLen;
      const forkY1 = tongueTipY + Math.sin(Math.atan2(hdy, hdx) + forkAngle) * forkLen;
      const forkX2 = tongueTipX + Math.cos(Math.atan2(hdy, hdx) - forkAngle) * forkLen;
      const forkY2 = tongueTipY + Math.sin(Math.atan2(hdy, hdx) - forkAngle) * forkLen;

      // 舌身（帶甩動偏移）
      const tongueSwayX = hNx * tongueFlick * maxWidth * 0.3;
      const tongueSwayY = hNy * tongueFlick * maxWidth * 0.3;

      ctx.beginPath();
      ctx.moveTo(tongueBaseX, tongueBaseY);
      ctx.quadraticCurveTo(
        (tongueBaseX + tongueTipX) / 2 + tongueSwayX,
        (tongueBaseY + tongueTipY) / 2 + tongueSwayY,
        tongueTipX + tongueSwayX * 0.5,
        tongueTipY + tongueSwayY * 0.5
      );
      ctx.lineWidth = maxWidth * 0.06;
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(255, 100, 130, ${opacity * 0.85})`;
      ctx.stroke();

      // 分岔
      const tipX = tongueTipX + tongueSwayX * 0.5;
      const tipY = tongueTipY + tongueSwayY * 0.5;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(forkX1 + tongueSwayX * 0.3, forkY1 + tongueSwayY * 0.3);
      ctx.lineWidth = maxWidth * 0.04;
      ctx.strokeStyle = `rgba(255, 80, 120, ${opacity * 0.8})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(forkX2 + tongueSwayX * 0.3, forkY2 + tongueSwayY * 0.3);
      ctx.lineWidth = maxWidth * 0.04;
      ctx.strokeStyle = `rgba(255, 80, 120, ${opacity * 0.8})`;
      ctx.stroke();

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

      // 無白眼球，直接畫藍色眼珠 + 黑瞳孔
      const pupilOrbitR = s * 0.15;
      const pupilAngle = time * 0.8;
      const pupilX = Math.cos(pupilAngle) * pupilOrbitR;
      const pupilY = Math.sin(pupilAngle) * pupilOrbitR * 0.6;
      const pupilR = s * 0.42;

      // 白色外圈（眼珠外推 0.1）
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, pupilR * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(235, 235, 230, ${opacity * 0.9})`;
      ctx.fill();

      // 深藍眼珠
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20, 35, 110, ${opacity * 0.95})`;
      ctx.fill();

      // 虹膜紋路
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(pupilX + Math.cos(a) * pupilR * 0.3, pupilY + Math.sin(a) * pupilR * 0.3);
        ctx.lineTo(pupilX + Math.cos(a) * pupilR * 0.85, pupilY + Math.sin(a) * pupilR * 0.85);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = `rgba(40, 60, 150, ${opacity * 0.4})`;
        ctx.stroke();
      }

      // 黑瞳孔
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, pupilR * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(3, 5, 20, ${opacity * 0.95})`;
      ctx.fill();

      // 高光
      ctx.beginPath();
      ctx.arc(pupilX - pupilR * 0.25, pupilY - pupilR * 0.25, pupilR * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.75})`;
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
      const finSpacing = 5; // 效能優化
      
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

        // 下鰭基準點（先定義，薄膜要用）
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

        // 透明薄膜連結相鄰鰭
        if (i + finSpacing < points.length - 4) {
          const nextI = Math.min(i + finSpacing, points.length - 1);
          const pN = points[nextI];
          const pNNext = points[Math.min(nextI + 3, points.length - 1)];
          const ndx = pNNext.x - pN.x;
          const ndy = pNNext.y - pN.y;
          const nlen = Math.sqrt(ndx * ndx + ndy * ndy) || 1;
          const nnx = -ndy / nlen;
          const nny = ndx / nlen;

          const tN = nextI / points.length;
          const bodyWN = getBodyWidth(tN, maxWidth);
          let finScaleN: number;
          if (tN < 0.1) finScaleN = tN * 8;
          else if (tN < 0.5) finScaleN = 1;
          else finScaleN = Math.max(0, 1 - (tN - 0.5) * 1.5);

          const wave1N = Math.sin(time * 2.5 + nextI * 0.15 + eel.phase) * 0.7;
          const wave2N = Math.sin(time * 1.8 + nextI * 0.25 + eel.phase * 1.5) * 0.4;
          const finLenN = bodyWN * (0.8 + (wave1N + wave2N) * 0.4) * finScaleN;

          // 上鰭薄膜
          const baseUpX2 = pN.x + nnx * bodyWN * 0.35;
          const baseUpY2 = pN.y + nny * bodyWN * 0.35;
          const tipUpX1 = baseUpX + nx * finLength;
          const tipUpY1 = baseUpY + ny * finLength;
          const tipUpX2 = baseUpX2 + nnx * finLenN;
          const tipUpY2 = baseUpY2 + nny * finLenN;

          ctx.beginPath();
          ctx.moveTo(baseUpX, baseUpY);
          ctx.lineTo(tipUpX1, tipUpY1);
          ctx.lineTo(tipUpX2, tipUpY2);
          ctx.lineTo(baseUpX2, baseUpY2);
          ctx.closePath();
          ctx.fillStyle = `rgba(190, 210, 255, ${finAlpha * 0.12})`;
          ctx.fill();

          // 下鰭薄膜
          const baseDownX2 = pN.x - nnx * bodyWN * 0.35;
          const baseDownY2 = pN.y - nny * bodyWN * 0.35;
          const tipDownX1 = baseDownX - nx * finLength;
          const tipDownY1 = baseDownY - ny * finLength;
          const tipDownX2 = baseDownX2 - nnx * finLenN;
          const tipDownY2 = baseDownY2 - nny * finLenN;

          ctx.beginPath();
          ctx.moveTo(baseDownX, baseDownY);
          ctx.lineTo(tipDownX1, tipDownY1);
          ctx.lineTo(tipDownX2, tipDownY2);
          ctx.lineTo(baseDownX2, baseDownY2);
          ctx.closePath();
          ctx.fillStyle = `rgba(190, 210, 255, ${finAlpha * 0.08})`;
          ctx.fill();
        }
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

    // Section-specific particles
    const spawnSectionParticles = (w: number, h: number) => {
      // 產卵區 (scrollProgress ~0.5-0.65): 漂浮的蛋
      if (scrollProgress > 0.4 && scrollProgress < 0.7 && Math.random() < 0.08) {
        eggs.push({
          x: Math.random() * w,
          y: h + 10,
          size: 4 + Math.random() * 8,
          wobble: Math.random() * Math.PI * 2,
          opacity: 0.3 + Math.random() * 0.4,
          vy: -(0.3 + Math.random() * 0.5),
        });
      }
      // 蛻皮區 (scrollProgress ~0.65-0.8): 飄落的鱗片
      if (scrollProgress > 0.55 && scrollProgress < 0.85 && Math.random() < 0.06) {
        scales.push({
          x: Math.random() * w,
          y: -10,
          size: 3 + Math.random() * 5,
          angle: Math.random() * Math.PI * 2,
          opacity: 0.2 + Math.random() * 0.3,
          vy: 0.5 + Math.random() * 0.8,
          vx: (Math.random() - 0.5) * 0.5,
          rot: (Math.random() - 0.5) * 0.05,
        });
      }
      // 轉圈區 (scrollProgress ~0.8-1.0): 漩渦粒子
      if (scrollProgress > 0.75 && vortexParticles.length < 30 && Math.random() < 0.1) {
        vortexParticles.push({
          angle: Math.random() * Math.PI * 2,
          radius: 50 + Math.random() * 150,
          speed: 0.005 + Math.random() * 0.015,
          size: 1 + Math.random() * 3,
          opacity: 0.15 + Math.random() * 0.25,
        });
      }
    };

    const drawSectionParticles = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // 蛋 🥚
      for (let i = eggs.length - 1; i >= 0; i--) {
        const e = eggs[i];
        e.y += e.vy;
        e.wobble += 0.03;
        e.x += Math.sin(e.wobble) * 0.3;
        e.opacity -= 0.002;
        if (e.y < -20 || e.opacity <= 0) { eggs.splice(i, 1); continue; }
        // 蛋形（橢圓）
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, e.size * 0.7, e.size, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 150, ${e.opacity * 0.3})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 200, 100, ${e.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // 光澤
        ctx.beginPath();
        ctx.ellipse(e.x - e.size * 0.2, e.y - e.size * 0.3, e.size * 0.2, e.size * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 220, ${e.opacity * 0.4})`;
        ctx.fill();
      }
      while (eggs.length > 40) eggs.shift();

      // 鱗片 🐍
      for (let i = scales.length - 1; i >= 0; i--) {
        const s = scales[i];
        s.y += s.vy;
        s.x += s.vx;
        s.angle += s.rot;
        s.opacity -= 0.002;
        if (s.y > h + 20 || s.opacity <= 0) { scales.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        // 菱形鱗片
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(s.size * 0.6, 0);
        ctx.lineTo(0, s.size);
        ctx.lineTo(-s.size * 0.6, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(160, 140, 220, ${s.opacity * 0.4})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(200, 180, 255, ${s.opacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }
      while (scales.length > 40) scales.shift();

      // 漩渦 🔄
      if (scrollProgress > 0.75) {
        const cx = w * 0.5;
        const cy = h * 0.5;
        for (let i = vortexParticles.length - 1; i >= 0; i--) {
          const v = vortexParticles[i];
          v.angle += v.speed;
          v.radius -= 0.1; // 慢慢往中心靠
          v.opacity -= 0.001;
          if (v.radius < 5 || v.opacity <= 0) { vortexParticles.splice(i, 1); continue; }
          const vx = cx + Math.cos(v.angle) * v.radius;
          const vy = cy + Math.sin(v.angle) * v.radius;
          ctx.beginPath();
          ctx.arc(vx, vy, v.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 220, 220, ${v.opacity * (scrollProgress - 0.75) * 4})`;
          ctx.fill();
        }
      }
    };

    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);
      time += 0.016;
      // 平滑 scroll（lerp 係數 0.08 = 絲滑過渡）
      scrollProgress += (scrollProgressTarget - scrollProgress) * 0.08;

      // Section-specific particles（背景層）
      spawnSectionParticles(w, h);
      drawSectionParticles(ctx, w, h);

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
      window.removeEventListener("scroll", updateScroll);
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
