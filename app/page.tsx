"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MouseTrail from "@/components/interactive/MouseTrail";
import TypeWriter from "@/components/interactive/TypeWriter";
import EelAnimation from "@/components/interactive/EelAnimation";
import EelMobileCSS from "@/components/interactive/EelMobileCSS";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Story from "@/components/sections/Story";
import Entropy from "@/components/sections/Entropy";
import Capabilities from "@/components/sections/Capabilities";
import Contact from "@/components/sections/Contact";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <main className="relative">
      <MouseTrail />
      
      {/* 鰻魚全站背景：桌面 Canvas / 手機 CSS */}
      <div className="fixed inset-0 z-0 hidden md:block">
        <EelAnimation />
      </div>
      <div className="md:hidden">
        <EelMobileCSS />
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
        <Hero />
        <About />
        <Story />
        <Entropy />
        <Capabilities />
        <Contact />
      </div>

      {/* 底部 */}
      <footer className="relative z-10 py-8 text-center text-white/20 text-sm">
        <p>Theeel × Jenny · 2026</p>
      </footer>
    </main>
  );
}
