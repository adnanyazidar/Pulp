"use client";

import { useSettingsStore as useStore } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface TimerConfigProps {
  durations: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
  onUpdate: (val: TimerConfigProps["durations"]) => void;
}

export function TimerConfig({ durations, onUpdate }: TimerConfigProps) {
  // Local state for the input values as strings to handle 
  // temporary empty states and leading zeros without jumping back to 0.
  const [localDisplay, setLocalDisplay] = useState({
    focus: durations.focus.toString(),
    shortBreak: durations.shortBreak.toString(),
    longBreak: durations.longBreak.toString(),
  });

  // Sync local display if durations prop updates (e.g., reset or draft discard)
  useEffect(() => {
    setLocalDisplay({
      focus: durations.focus.toString(),
      shortBreak: durations.shortBreak.toString(),
      longBreak: durations.longBreak.toString(),
    });
  }, [durations]);

  const handleChange = (id: keyof typeof localDisplay, val: string) => {
    // Only allow numeric string or empty
    if (val !== "" && !/^\d+$/.test(val)) return;

    setLocalDisplay(prev => ({ ...prev, [id]: val }));

    const num = parseInt(val);
    if (!isNaN(num)) {
      onUpdate({
        ...durations,
        [id]: num
      });
    }
  };

  const handleBlur = (id: keyof typeof localDisplay) => {
    // If the user leaves the input blank, reset it to the provided prop value
    if (localDisplay[id] === "") {
      setLocalDisplay(prev => ({ 
        ...prev, 
        [id]: durations[id].toString() 
      }));
    }
  };

  const configs = [
    { id: "focus" as const, label: "Focus Duration", value: localDisplay.focus },
    { id: "shortBreak" as const, label: "Short Break", value: localDisplay.shortBreak },
    { id: "longBreak" as const, label: "Long Break", value: localDisplay.longBreak },
  ];

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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={config.value}
              onChange={(e) => handleChange(config.id, e.target.value)}
              onBlur={() => handleBlur(config.id)}
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
