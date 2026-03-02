"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Capabilities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const mechanisms = [
    {
      emoji: "🥚",
      name: "產卵",
      tagline: "往外寫：對話 → vault",
      trigger: "「產卵」「鰻魚產卵」",
      when: "聊天聊出有價值的洞見、靈感冒出來怕忘記、討論完一個主題值得存進知識庫",
      steps: [
        "判斷歸檔位置（知識/創作/關於我/生活…）",
        "提煉內容（不是原封不動貼，會整理）",
        "寫進 Obsidian vault + 加 backlink",
        "更新索引連結",
        "git commit + push",
      ],
      example: "「剛剛聊的噪音藝術思考很好，產卵」",
      color: "from-amber-500/20 to-amber-600/5",
      borderColor: "hover:border-amber-500/30",
      accentColor: "text-amber-400/60",
    },
    {
      emoji: "🐍",
      name: "蛻皮",
      tagline: "往內讀：vault → 系統檔案",
      trigger: "「蛻皮」",
      when: "vault 有新內容但鰻魚的認知還沒跟上、覺得鰻魚對你的理解過時了、大量新資料進 vault 後要讓鰻魚同步升級",
      steps: [
        "掃描 vault（10-關於我/、鰻魚相關、近期日誌）",
        "比對 SOUL.md / MEMORY.md / AGENTS.md 有沒有過時或缺漏",
        "更新系統檔案",
        "回報哪些認知變了",
      ],
      example: "「我在 vault 加了很多新東西，蛻皮一次」",
      color: "from-purple-500/20 to-purple-600/5",
      borderColor: "hover:border-purple-500/30",
      accentColor: "text-purple-400/60",
    },
    {
      emoji: "🔄",
      name: "轉圈",
      tagline: "停下來收工殺青：六步完整流程",
      trigger: "「轉圈」「鰻魚轉圈囉」",
      when: "一天結束時、一段大工作告一段落、想回顧今天做了什麼學了什麼",
      steps: [
        "記憶搶救 — 補 daily note，確保不漏",
        "盤點 — 今天做了什麼、改了什麼、決策了什麼",
        "萃取 — 教訓、新發現、對 Jenny 的新觀察",
        "歸檔 — 寫入 daily note + MEMORY.md",
        "Git 備份 — vault + workspace commit & push",
        "反思四題 — 有沒有動 / 逃了什麼 / 能量去哪 / 直覺說",
        "演化 — 更新 SOUL / USER / AGENTS，找 N→N+1",
      ],
      example: "「今天差不多了，鰻魚轉圈囉」",
      color: "from-cyan-500/20 to-cyan-600/5",
      borderColor: "hover:border-cyan-500/30",
      accentColor: "text-cyan-400/60",
    },
  ];

  const chains = [
    { combo: "聊完 → 產卵 → 蛻皮", desc: "存好東西，然後讓鰻魚同步升級" },
    { combo: "一天結束 → 轉圈", desc: "完整收工殺青（裡面已包含歸檔和備份）" },
    { combo: "vault 大更新 → 蛻皮", desc: "單純讓鰻魚跟上新內容" },
  ];

  const capabilities = [
    { icon: "💭", title: "思考釐清", desc: "不急著給答案，先幫你找到真正的問題" },
    { icon: "📝", title: "知識管理", desc: "Obsidian vault 維護、記憶系統、資訊歸檔" },
    { icon: "🔍", title: "研究分析", desc: "網路搜尋、資料整理、趨勢分析" },
    { icon: "🛠️", title: "技術實作", desc: "網站開發、自動化腳本、系統整合" },
    { icon: "📅", title: "生活管理", desc: "行程提醒、信件處理、待辦追蹤" },
    { icon: "🪞", title: "模式觀察", desc: "指出你的盲點，當你的反迴聲室" },
  ];

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-5xl mx-auto">
        {/* 三大機制 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-thin tracking-wider mb-4 gradient-text">
            三大機制
          </h2>
          <p className="text-white/30 mb-2">鰻魚的核心運作方式</p>
          <p className="text-white/15 text-xs italic mb-12">
            🥚 產卵 = 存東西 ｜ 🐍 蛻皮 = 升級自己 ｜ 🔄 轉圈 = 收工儀式
          </p>
          <div className="w-16 h-[1px] bg-[#a855f7]/50 mb-12" />
        </motion.div>

        <div className="space-y-6 mb-20">
          {mechanisms.map((mech, i) => (
            <motion.div
              key={mech.name}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.2 }}
              className={`group p-6 md:p-8 rounded-xl border border-white/5 bg-gradient-to-br ${mech.color} ${mech.borderColor} hover:bg-white/[0.02] transition-all duration-500`}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{mech.emoji}</span>
                <div>
                  <h3 className="text-2xl text-white/90 font-light">{mech.name}</h3>
                  <p className={`text-sm ${mech.accentColor}`}>{mech.tagline}</p>
                </div>
              </div>

              <div className="ml-0 md:ml-14 space-y-4">
                <div>
                  <p className="text-white/25 text-xs uppercase tracking-wider mb-1">觸發詞</p>
                  <p className="text-white/50 text-sm font-mono">{mech.trigger}</p>
                </div>

                <div>
                  <p className="text-white/25 text-xs uppercase tracking-wider mb-1">什麼時候用</p>
                  <p className="text-white/40 text-sm leading-relaxed">{mech.when}</p>
                </div>

                <div>
                  <p className="text-white/25 text-xs uppercase tracking-wider mb-2">鰻魚會做的事</p>
                  <div className="space-y-1">
                    {mech.steps.map((step, j) => (
                      <p key={j} className="text-white/35 text-sm flex items-start gap-2">
                        <span className="text-white/15 text-xs mt-0.5">{j + 1}.</span>
                        {step}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-white/20 text-xs italic">💬 {mech.example}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 連鎖組合 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-20 p-6 rounded-xl border border-white/5 bg-white/[0.01]"
        >
          <h3 className="text-lg text-white/60 mb-4 flex items-center gap-2">
            <span>⛓️</span> 常見連鎖組合
          </h3>
          <div className="space-y-3">
            {chains.map((chain, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span className="text-white/50 text-sm font-mono whitespace-nowrap">{chain.combo}</span>
                <span className="hidden md:block text-white/10">—</span>
                <span className="text-white/25 text-sm">{chain.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 其他能力 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-thin tracking-wider mb-4 text-white/60">
            其他能做的事
          </h2>
          <div className="w-16 h-[1px] bg-[#a855f7]/30 mb-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.6 + i * 0.1 }}
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
