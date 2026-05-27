import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ChevronDown, X, Plus } from "lucide-react";
import memoryLibraryBg from "../assets/memory-library-bg.jpg";

const EMOTION_META = {
  joy: { label: "喜悅", en: "Joy", color: "#ffd34d", emoji: "☀️" },
  anger: { label: "憤怒", en: "Anger", color: "#ff4b4b", emoji: "🔥" },
  sadness: { label: "悲傷", en: "Sadness", color: "#4da3ff", emoji: "💧" },
  fear: { label: "恐懼", en: "Fear", color: "#a66cff", emoji: "🟣" },
  disgust: { label: "厭惡", en: "Disgust", color: "#6ee06e", emoji: "🟢" },
};

const EMOTIONS = [
  { id: "all", label: "全部", en: "All", color: "#a855f7", emoji: "✨" },
  ...Object.entries(EMOTION_META).map(([id, data]) => ({ id, ...data })),
];

const STORAGE_KEYS = [
  "emotion-memories",
  "emotionMemories",
  "memories",
  "emotionMemoryRecords",
];

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normaliseEmotion(value = "") {
  const v = String(value).toLowerCase();
  if (["joy", "happy", "喜悅", "開心", "高興"].includes(v)) return "joy";
  if (["anger", "angry", "憤怒", "怒", "生氣"].includes(v)) return "anger";
  if (["sadness", "sad", "悲傷", "傷心", "哀"].includes(v)) return "sadness";
  if (["fear", "scared", "恐懼", "害怕", "懼"].includes(v)) return "fear";
  if (["disgust", "厭惡", "討厭"].includes(v)) return "disgust";
  return v || "joy";
}

function loadMemories() {
  for (const key of STORAGE_KEYS) {
    const data = safeJsonParse(localStorage.getItem(key), null);
    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: item.id || `${Date.now()}-${index}`,
        title: item.title || item.memoryTitle || item.name || "情緒記憶",
        content: item.content || item.text || item.description || item.note || "",
        date: item.date || item.createdAt || item.time || "",
        intensity: item.intensity || item.level || item.score || 5,
        categories: item.categories || item.tags || [],
        emotion: normaliseEmotion(item.emotion || item.emotionId || item.type),
      }));
    }
  }
  return [];
}

function getPreviewMemories(memories) {
  if (memories.length) return memories;
  return [
    { id: "demo-1", title: "和家人一起吃飯", content: "很開心今日和家人一起吃飯。", emotion: "joy", date: "2024.05.20", intensity: 8, categories: ["家庭"] },
    { id: "demo-2", title: "工作壓力好大", content: "今日工作有點緊張。", emotion: "anger", date: "2024.05.21", intensity: 6, categories: ["事業"] },
    { id: "demo-3", title: "想念一個人", content: "有點掛念。", emotion: "sadness", date: "2024.05.22", intensity: 7, categories: ["朋友"] },
    { id: "demo-4", title: "明天的面試", content: "有點害怕但會努力。", emotion: "fear", date: "2024.05.23", intensity: 5, categories: ["成長"] },
    { id: "demo-5", title: "不舒服的事情", content: "想保護自己的界線。", emotion: "disgust", date: "2024.05.24", intensity: 4, categories: ["健康"] },
  ];
}

const ORB_POSITIONS = [
  { top: "33%", left: "18%", size: 118 },
  { top: "31%", left: "54%", size: 84 },
  { top: "47%", left: "11%", size: 96 },
  { top: "51%", left: "58%", size: 112 },
  { top: "63%", left: "34%", size: 78 },
  { top: "66%", left: "69%", size: 72 },
  { top: "39%", left: "75%", size: 56 },
  { top: "58%", left: "5%", size: 52 },
];

export default function MemoryPage({ setPage, onCreate }) {
  const [memories, setMemories] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeMemory, setActiveMemory] = useState(null);

  useEffect(() => {
    setMemories(loadMemories());
  }, []);

  const shownMemories = useMemo(() => {
    const source = getPreviewMemories(memories);
    return source.filter((memory) => {
      const emotionMatch = selectedEmotion === "all" || memory.emotion === selectedEmotion;
      const q = query.trim().toLowerCase();
      const text = `${memory.title || ""} ${memory.content || ""} ${(memory.categories || []).join(" ")}`.toLowerCase();
      return emotionMatch && (!q || text.includes(q));
    });
  }, [memories, selectedEmotion, query]);

  const total = memories.length || getPreviewMemories([]).length;
  const todayCount = memories.filter((m) => String(m.date || "").slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  const mostEmotion = useMemo(() => {
    const counts = memories.reduce((acc, m) => {
      acc[m.emotion] = (acc[m.emotion] || 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "joy";
    return EMOTION_META[top] || EMOTION_META.joy;
  }, [memories]);

  const handleAddMemory = () => {
    if (typeof onCreate === "function") return onCreate();
    if (typeof setPage === "function") return setPage("create");
    window.location.hash = "#create";
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050317] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${memoryLibraryBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#040212]/20 via-[#07031a]/5 to-[#03010c]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(151,71,255,.28),transparent_32%),radial-gradient(circle_at_18%_80%,rgba(30,144,255,.18),transparent_30%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 42 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,.9)]"
            style={{ top: `${(i * 23) % 100}%`, left: `${(i * 37) % 100}%` }}
            animate={{ opacity: [0.18, 0.9, 0.18], scale: [0.8, 1.6, 0.8] }}
            transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: i * 0.08 }}
          />
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-5 pb-28 pt-12">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[42px] font-black leading-tight tracking-[-0.04em] drop-shadow-lg">我的記憶庫 ✨</h1>
            <p className="mt-2 text-[17px] text-white/80">你收藏的情緒記憶都在這裡</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_24px_rgba(139,92,246,.25)] backdrop-blur-xl active:scale-95"
            >
              <Search size={22} />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 shadow-[0_0_24px_rgba(139,92,246,.25)] backdrop-blur-xl active:scale-95">
              <SlidersHorizontal size={21} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-3 backdrop-blur-xl"
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜尋標題、內容、分類..."
                className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.id}
              onClick={() => setSelectedEmotion(emotion.id)}
              className="shrink-0 rounded-full border px-4 py-2 text-sm font-bold backdrop-blur-xl transition active:scale-95"
              style={{
                borderColor: selectedEmotion === emotion.id ? emotion.color : "rgba(255,255,255,.1)",
                background: selectedEmotion === emotion.id ? `${emotion.color}33` : "rgba(255,255,255,.1)",
                color: selectedEmotion === emotion.id ? "#fff" : "rgba(255,255,255,.72)",
                boxShadow: selectedEmotion === emotion.id ? `0 0 22px ${emotion.color}66` : "none",
              }}
            >
              {emotion.label}
            </button>
          ))}
        </div>

        <div className="relative mt-4 min-h-[560px] flex-1">
          {shownMemories.length === 0 ? (
            <div className="absolute left-1/2 top-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/10 bg-black/30 p-6 text-center backdrop-blur-xl">
              <p className="text-xl font-bold">暫時未有記憶</p>
              <p className="mt-2 text-sm text-white/60">新增一顆情緒水晶球，慢慢收藏你的回憶。</p>
            </div>
          ) : (
            shownMemories.slice(0, 8).map((memory, index) => {
              const meta = EMOTION_META[memory.emotion] || EMOTION_META.joy;
              const pos = ORB_POSITIONS[index % ORB_POSITIONS.length];
              return (
                <motion.button
                  key={memory.id || index}
                  onClick={() => setActiveMemory(memory)}
                  className="absolute flex items-center justify-center overflow-hidden rounded-full border border-white/30 text-center shadow-2xl backdrop-blur-xl active:scale-95"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: pos.size,
                    height: pos.size,
                    background: `radial-gradient(circle at 28% 22%, rgba(255,255,255,.9), ${meta.color}cc 32%, ${meta.color}88 58%, rgba(255,255,255,.18) 100%)`,
                    boxShadow: `0 0 28px ${meta.color}, inset 12px 14px 18px rgba(255,255,255,.24), inset -14px -18px 28px rgba(0,0,0,.28)`,
                  }}
                  animate={{ y: [-8, 10, -8], rotate: [-1, 1, -1] }}
                  transition={{ duration: 5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="absolute left-[18%] top-[14%] h-[20%] w-[24%] rounded-full bg-white/55 blur-[2px]" />
                  <span className="absolute inset-2 rounded-full border border-white/15" />
                  <span className="relative z-10 px-3 text-xs font-black leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.55)]">
                    {memory.title}
                  </span>
                  <span className="absolute bottom-4 text-xl opacity-75">{meta.emoji}</span>
                </motion.button>
              );
            })
          )}
        </div>

        <div className="pointer-events-none absolute bottom-24 left-5 right-5 flex items-end justify-between gap-3">
          <div className="rounded-[28px] border border-white/10 bg-black/30 px-4 py-4 text-sm shadow-[0_0_35px_rgba(168,85,247,.25)] backdrop-blur-xl">
            <div className="text-white/70">記憶總數</div>
            <div className="text-4xl font-black">{total}</div>
            <div className="mt-2 text-white/70">今日新增 {todayCount}</div>
            <div className="mt-1 text-white/70">最常情緒 <span style={{ color: mostEmotion.color }} className="font-bold">{mostEmotion.label}</span></div>
          </div>

          <button
            onClick={handleAddMemory}
            className="pointer-events-auto mb-3 flex h-16 items-center gap-3 rounded-full border border-white/25 bg-gradient-to-r from-fuchsia-500/90 to-violet-600/90 px-8 text-xl font-black shadow-[0_0_36px_rgba(217,70,239,.75)] active:scale-95"
          >
            <Plus size={28} />
            新增記憶
          </button>
        </div>
      </section>

      <AnimatePresence>
        {activeMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/55 p-4 backdrop-blur-md"
            onClick={() => setActiveMemory(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-[32px] border border-white/15 bg-[#130b2e]/90 p-5 shadow-[0_0_60px_rgba(168,85,247,.35)] backdrop-blur-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/60">{EMOTION_META[activeMemory.emotion]?.label || "情緒"}</p>
                  <h2 className="mt-1 text-2xl font-black">{activeMemory.title}</h2>
                </div>
                <button onClick={() => setActiveMemory(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-white/80">{activeMemory.content || "沒有內容"}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm">強度 {activeMemory.intensity || 5}/10</span>
                {(activeMemory.categories || []).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-sm">{tag}</span>
                ))}
                {activeMemory.date && <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{activeMemory.date}</span>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
