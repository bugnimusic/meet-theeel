"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
}

export default function MouseTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let trailId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      trailId += 1;
      setTrail((prev) => {
        const newPoint = { id: trailId, x: e.clientX, y: e.clientY };
        const newTrail = [...prev, newPoint].slice(-15); // 只保留最近15個點
        return newTrail;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 清理過期的 trail 點
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail((prev) => prev.slice(1));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              left: point.x,
              top: point.y,
              width: 8 + index * 0.5,
              height: 8 + index * 0.5,
              background: `radial-gradient(circle, rgba(0, 212, 170, ${0.3 + index * 0.05}) 0%, transparent 70%)`,
              transform: "translate(-50%, -50%)",
              filter: "blur(2px)",
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* 核心的光點 */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: 20,
          height: 20,
          background: "radial-gradient(circle, rgba(0, 212, 170, 0.6) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}
