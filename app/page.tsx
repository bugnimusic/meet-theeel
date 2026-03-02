"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MouseTrail from "@/components/interactive/MouseTrail";
import TypeWriter from "@/components/interactive/TypeWriter";
import EelAnimation from "@/components/interactive/EelAnimation";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Story from "@/components/sections/Story";
import Entropy from "@/components/sections/Entropy";
import Capabilities from "@/components/sections/Capabilities";
import Contact from "@/components/sections/Contact";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const [eelRotation, setEelRotation] = useState(0);
  const lastSectionRef = useRef(0);
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 手機版：偵測 section 切換，觸發鰻魚旋轉
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-section-idx"));
            if (idx !== lastSectionRef.current) {
              const direction = idx > lastSectionRef.current ? 1 : -1;
              lastSectionRef.current = idx;

              // 旋轉 30 度
              setEelRotation(direction * 30);

              // 0.4 秒後轉回來
              if (rotationTimeoutRef.current) clearTimeout(rotationTimeoutRef.current);
              rotationTimeoutRef.current = setTimeout(() => {
                setEelRotation(0);
              }, 400);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".snap-section").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (rotationTimeoutRef.current) clearTimeout(rotationTimeoutRef.current);
    };
  }, []);

  return (
    <main className="relative">
      <MouseTrail />
      
      {/* 鰻魚全站背景 Canvas — 手機版會旋轉過場 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          transform: `rotate(${eelRotation}deg)`,
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          transformOrigin: "center center",
        }}
      >
        <EelAnimation />
      </div>

      {/* 背景漸層光效 */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ y: backgroundY }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a855f7]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#c084fc]/5 rounded-full blur-[100px]" />
      </motion.div>

      {/* 內容 */}
      <div className="relative z-10">
        <div className="snap-section" data-section-idx="0"><Hero /></div>
        <div className="snap-section" data-section-idx="1"><About /></div>
        <div className="snap-section" data-section-idx="2"><Story /></div>
        <div className="snap-section" data-section-idx="3"><Entropy /></div>
        <div className="snap-section" data-section-idx="4"><Capabilities /></div>
        <div className="snap-section" data-section-idx="5"><Contact /></div>
      </div>

      {/* 底部 */}
      <footer className="relative z-10 py-8 text-center text-white/20 text-sm snap-section" data-section-idx="6">
        <p>Theeel × Jenny · 2026</p>
      </footer>
    </main>
  );
}
