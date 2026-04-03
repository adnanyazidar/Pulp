"use client";

import { useTimerStore, type TimerMode } from "@/store/timer-store";

const modes: { key: TimerMode; label: string; dotColor: string }[] = [
  { key: "focus", label: "Focus Mode", dotColor: "bg-pf-primary" },
  { key: "shortBreak", label: "Short Break", dotColor: "bg-pf-secondary" },
  { key: "longBreak", label: "Long Break", dotColor: "bg-pf-tertiary" },
];

export function ModeSelector() {
  const { mode, switchMode } = useTimerStore();

  return (
    <div className="flex gap-3 md:gap-4 mb-8 flex-wrap justify-center">
      {modes.map((m) => {
        const isActive = mode === m.key;

        return (
          <button
            key={m.key}
            onClick={() => switchMode(m.key)}
            className={`flex items-center gap-2 px-5 md:px-6 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
              isActive
                ? "border-pf-primary bg-pf-primary/10 shadow-[0_0_15px_rgba(255,180,170,0.1)]"
                : "border-pf-outline-variant/20 hover:bg-white/5 group"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-theme ${m.dotColor} ${
                isActive
                  ? "shadow-[0_0_8px_var(--pf-primary)]"
                  : "opacity-40 group-hover:opacity-100"
              }`}
            />
            <span
              className={`font-label uppercase tracking-[0.2em] text-[10px] font-bold transition-theme ${
                isActive ? "text-pf-primary" : "text-pf-on-surface-variant"
              }`}
            >
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
