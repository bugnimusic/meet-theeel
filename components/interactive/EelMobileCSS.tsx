"use client";

import { useEffect, useState } from "react";

// 手機版鰻魚：純 CSS 動畫，跑在 GPU compositor thread，不卡頓
export default function EelMobileCSS() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const eels = [
    { delay: "0s", duration: "12s", size: 1, x: 15, opacity: 0.8, flip: false },
    { delay: "-4s", duration: "15s", size: 0.7, x: 55, opacity: 0.55, flip: true },
    { delay: "-8s", duration: "18s", size: 0.5, x: 75, opacity: 0.35, flip: false },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <style jsx>{`
        @keyframes swimDown {
          0% { transform: translateY(-30vh) translateX(0px); }
          25% { transform: translateY(-5vh) translateX(15px); }
          50% { transform: translateY(25vh) translateX(-10px); }
          75% { transform: translateY(55vh) translateX(20px); }
          100% { transform: translateY(110vh) translateX(0px); }
        }
        @keyframes wiggle {
          0%, 100% { d: path("M 0,0 C 8,-12 16,12 24,0 C 32,-12 40,12 48,0 C 56,-12 64,12 72,0 C 80,-12 88,12 96,0 C 104,-12 112,12 120,0 C 128,-12 136,12 144,0 C 152,-12 160,12 168,0"); }
          50% { d: path("M 0,0 C 8,12 16,-12 24,0 C 32,12 40,-12 48,0 C 56,12 64,-12 72,0 C 80,12 88,-12 96,0 C 104,12 112,-12 120,0 C 128,12 136,-12 144,0 C 152,12 160,-12 168,0"); }
        }
        @keyframes finWave {
          0%, 100% { transform: scaleY(1) rotate(0deg); }
          25% { transform: scaleY(1.3) rotate(5deg); }
          50% { transform: scaleY(0.7) rotate(0deg); }
          75% { transform: scaleY(1.2) rotate(-5deg); }
        }
        @keyframes tongueFlick {
          0%, 40%, 100% { transform: scaleX(0.3) scaleY(0.5); opacity: 0.6; }
          50%, 55% { transform: scaleX(1) scaleY(1); opacity: 0.85; }
        }
        .eel-swim {
          animation: swimDown var(--dur) linear infinite;
          animation-delay: var(--delay);
          will-change: transform;
        }
        .eel-body path {
          animation: wiggle 2s ease-in-out infinite;
          will-change: d;
        }
        .eel-fin {
          animation: finWave 3s ease-in-out infinite;
          transform-origin: bottom center;
          will-change: transform;
        }
        .eel-tongue {
          animation: tongueFlick 1.5s ease-in-out infinite;
          transform-origin: center left;
          will-change: transform;
        }
      `}</style>

      {eels.map((eel, i) => (
        <div
          key={i}
          className="eel-swim absolute"
          style={{
            "--dur": eel.duration,
            "--delay": eel.delay,
            left: `${eel.x}%`,
            top: 0,
            opacity: eel.opacity,
            transform: `scale(${eel.size})${eel.flip ? " scaleX(-1)" : ""}`,
          } as React.CSSProperties}
        >
          <svg
            width="180"
            height="80"
            viewBox="-10 -35 190 80"
            fill="none"
            style={{ transform: "rotate(90deg)" }}
          >
            {/* 外層 glow */}
            <g filter="url(#glow)">
              <g className="eel-body">
                <path
                  d="M 0,0 C 8,-12 16,12 24,0 C 32,-12 40,12 48,0 C 56,-12 64,12 72,0 C 80,-12 88,12 96,0 C 104,-12 112,12 120,0 C 128,-12 136,12 144,0 C 152,-12 160,12 168,0"
                  stroke="url(#bodyGrad)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            </g>

            {/* 身體主體 */}
            <g className="eel-body">
              <path
                d="M 0,0 C 8,-12 16,12 24,0 C 32,-12 40,12 48,0 C 56,-12 64,12 72,0 C 80,-12 88,12 96,0 C 104,-12 112,12 120,0 C 128,-12 136,12 144,0 C 152,-12 160,12 168,0"
                stroke="url(#bodyGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* 亮面 */}
            <g className="eel-body">
              <path
                d="M 0,0 C 8,-12 16,12 24,0 C 32,-12 40,12 48,0 C 56,-12 64,12 72,0 C 80,-12 88,12 96,0 C 104,-12 112,12 120,0 C 128,-12 136,12 144,0 C 152,-12 160,12 168,0"
                stroke="url(#bodyShine)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                opacity="0.4"
              />
            </g>

            {/* 脊椎骨 */}
            <g className="eel-body">
              <path
                d="M 0,0 C 8,-12 16,12 24,0 C 32,-12 40,12 48,0 C 56,-12 64,12 72,0 C 80,-12 88,12 96,0 C 104,-12 112,12 120,0 C 128,-12 136,12 144,0 C 152,-12 160,12 168,0"
                stroke="rgba(0,190,180,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="8 6"
                fill="none"
              />
            </g>

            {/* 鰭（上下各一排） */}
            {[0, 24, 48, 72, 96, 120].map((x, fi) => (
              <g key={fi}>
                <line
                  className="eel-fin"
                  x1={x} y1={-5} x2={x} y2={-22}
                  stroke="rgba(220,230,255,0.15)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ animationDelay: `${fi * 0.2}s` }}
                />
                <line
                  className="eel-fin"
                  x1={x} y1={5} x2={x} y2={22}
                  stroke="rgba(220,230,255,0.1)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{ animationDelay: `${fi * 0.2 + 0.1}s` }}
                />
              </g>
            ))}

            {/* 舌頭 */}
            <g className="eel-tongue">
              <line x1={-2} y1={0} x2={-14} y2={-3} stroke="rgba(255,100,130,0.7)" strokeWidth="1" strokeLinecap="round" />
              <line x1={-2} y1={0} x2={-14} y2={3} stroke="rgba(255,100,130,0.7)" strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* 眼睛 */}
            {/* 左眼 */}
            <circle cx="2" cy="-6" r="4" fill="rgba(50,30,120,0.7)" />
            <circle cx="2" cy="-6" r="3.2" fill="rgba(235,235,230,0.9)" />
            <circle cx="2" cy="-6" r="2.8" fill="rgba(20,35,110,0.95)" />
            <circle cx="2" cy="-6" r="1.3" fill="rgba(3,5,20,0.95)" />
            <circle cx="1.3" cy="-6.7" r="0.5" fill="rgba(255,255,255,0.7)" />
            {/* 右眼 */}
            <circle cx="2" cy="6" r="4" fill="rgba(50,30,120,0.7)" />
            <circle cx="2" cy="6" r="3.2" fill="rgba(235,235,230,0.9)" />
            <circle cx="2" cy="6" r="2.8" fill="rgba(20,35,110,0.95)" />
            <circle cx="2" cy="6" r="1.3" fill="rgba(3,5,20,0.95)" />
            <circle cx="1.3" cy="5.3" r="0.5" fill="rgba(255,255,255,0.7)" />

            {/* Gradients */}
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="168" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgb(80,50,200)" />
                <stop offset="100%" stopColor="rgb(200,120,240)" />
              </linearGradient>
              <linearGradient id="bodyShine" x1="0" y1="0" x2="168" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgb(140,120,240)" />
                <stop offset="100%" stopColor="rgb(220,180,255)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>
      ))}

      {/* 漂浮泡泡（純 CSS） */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`bubble-${i}`}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            left: `${10 + Math.random() * 80}%`,
            background: "rgba(150,210,255,0.15)",
            border: "1px solid rgba(180,230,255,0.2)",
            animation: `swimDown ${8 + Math.random() * 10}s linear infinite reverse`,
            animationDelay: `${-Math.random() * 15}s`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
