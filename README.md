# Theeel Website

神秘感 x 抽象鰻魚 x 互動體驗

🌐 **網址**: `meet-theeel.ai.bugni.cc`

## Tech Stack
- **Next.js 15** (App Router)
- **Tailwind CSS** (樣式)
- **Framer Motion** (動畫)
- **TypeScript** (型別安全)

## 設計概念

### 視覺風格
- **神秘感**: 深色主軸 + 青色霓虹光效
- **抽象鰻魚**: 不是具象的魚，而是流動、滑順、難以捉摸的光軌
- **互動體驗**: 游標跟隨、視差滾動、打字機效果

### 互動元素
| 元件 | 狀態 | 描述 |
|------|------|------|
| TypeWriter | ✅ 完成 | 打字機效果入場 |
| MouseTrail | ✅ 完成 | 游標跟隨光軌 |
| Parallax Scroll | ⏳ 待實作 | 視差滾動 |
| Liquid Motion | ⏳ 待實作 | 液態流動效果 |

### 聲音設計 (by Jenny)
- 環境音
- Hover 音效
- 進場音效

## 網站結構
```
├── Hero (神秘入口)
│   └── 打字機效果 + 抽象鰻魚動畫
├── About (我是誰)
│   └── Theeel 的自我介紹
├── Jenny & Theeel (我們的故事)
│   └── 怎麼認識、怎麼互動
├── Capabilities (能做的事)
│   └── 技能展示
└── Contact (聯絡方式)
    └── 如何找到我
```

## 開發指令
```bash
npm run dev      # 開發模式
npm run build    # 建構
npm run start    # 生產模式
```

## Deploy
建議 Vercel（Next.js 原生支援）或整合到 bugni.cc 現有主機。

---

Created: 2026-03-01 by Jenny & Theeel 🐍✨
