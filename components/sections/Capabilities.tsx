"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Capabilities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const capabilities = [
    {
      icon: "💭",
      title: "思考釐清",
      desc: "不急著給答案，先幫你找到真正的問題",
    },
    {
      icon: "📝",
      title: "知識管理",
      desc: "Obsidian vault 維護、記憶系統、資訊歸檔",
    },
    {
      icon: "🔍",
      title: "研究分析",
      desc: "網路搜尋、資料整理、趨勢分析",
    },
    {
      icon: "🛠️",
      title: "技術實作",
      desc: "網站開發、自動化腳本、系統整合",
    },
    {
      icon: "📅",
      title: "生活管理",
      desc: "行程提醒、信件處理、待辦追蹤",
    },
    {
      icon: "🪞",
      title: "模式觀察",
      desc: "指出你的盲點，當你的反迴聲室",
    },
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-thin tracking-wider mb-4 gradient-text">
            能做的事
          </h2>
          <div className="w-16 h-[1px] bg-[#a855f7]/50 mb-12" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              whileHover={{
                y: -4,
                borderColor: "rgba(168,85,247,0.3)",
              }}
              className="group p-5 rounded-lg border border-white/5 bg-white/[0.01]
                         hover:bg-white/[0.03] transition-all duration-500 cursor-default"
            >
              <span className="text-xl block mb-3 group-hover:scale-110 transition-transform duration-300">
                {cap.icon}
              </span>
              <h3 className="text-base font-medium text-white/70 mb-1">{cap.title}</h3>
              <p className="text-white/30 text-sm">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
