import React from "react";
import "../styles/cosmic.css";

export default function MemoryPage() {
  const memories = [
    { title: "和家人一起吃飯好開心", color: "#FFD54A", size: "large" },
    { title: "工作壓力好大...", color: "#FF4B5C", size: "medium" },
    { title: "想念一個人", color: "#6AA8FF", size: "medium" },
    { title: "看到訊息昨天的混亂", color: "#B06CFF", size: "large" },
    { title: "平時都想哭", color: "#FFB347", size: "small" },
  ];

  return (
    <div className="cosmic-bg">
      <div className="cosmic-header">
        <h1>我的情緒宇宙</h1>
      </div>

      <div className="memory-space">
        {memories.map((m, i) => (
          <div
            key={i}
            className={`memory-ball ${m.size}`}
            style={{
              background: `radial-gradient(circle at 30% 30%, white, ${m.color})`,
              boxShadow: `0 0 35px ${m.color}`
            }}
          >
            <span>{m.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
