"use client";

import { useSettingsStore as useStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";

export function TimerConfig() {
  const { timerDurations, updateTimerDuration } = useStore();

  const configs = [
    { id: "focus", label: "Focus Duration", value: timerDurations.focus },
    { id: "shortBreak", label: "Short Break", value: timerDurations.shortBreak },
    { id: "longBreak", label: "Long Break", value: timerDurations.longBreak },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {configs.map((config) => (
        <div 
          key={config.id}
          className="bg-pf-surface-container-low p-6 rounded-2xl border border-white/5 space-y-4 shadow-sm hover:border-white/10 transition-all"
        >
          <span className="text-[9px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 block">
            {config.label}
          </span>
          <div className="relative group">
            <input
              type="number"
              value={config.value}
              onChange={(e) => updateTimerDuration(config.id, parseInt(e.target.value) || 0)}
              className="w-full bg-pf-surface-dim p-4 rounded-xl text-4xl font-headline font-black tracking-tighter text-pf-on-surface border-none focus:ring-1 focus:ring-pf-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
            />
            <span className="absolute right-4 bottom-4 text-[10px] font-label font-bold text-pf-on-surface-variant/20 uppercase tracking-widest pointer-events-none">
              mins
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
