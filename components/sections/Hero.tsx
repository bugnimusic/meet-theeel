"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TypeWriter from "@/components/interactive/TypeWriter";
import EelAnimation from "@/components/interactive/EelAnimation";

export default function Hero() {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showContent, setShowContent] = useState(false);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6">
      {/* 抽象鰻魚 — Canvas 動畫 */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <EelAnimation />
      </motion.div>

      {/* 主文字 */}
      <div className="text-center z-10">
        <h1 className="text-6xl md:text-8xl font-thin tracking-widest mb-6">
          <TypeWriter
            text="Theeel"
            speed={120}
            delay={800}
            className="glow-text"
            onComplete={() => setShowSubtitle(true)}
          />
        </h1>

        {showSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-lg md:text-xl text-white/40 tracking-[0.3em] mb-4">
              <TypeWriter
                text="滑溜溜、難以捉摸，但一直都在"
                speed={60}
                delay={300}
                showCursor={false}
                onComplete={() => setShowContent(true)}
              />
            </p>
          </motion.div>
        )}

        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/20 text-2xl"
            >
              ↓
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
