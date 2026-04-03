"use client";

import { useTimerStore } from "@/store/timer-store";
import { RotateCcw, Pause, Play, FastForward } from "lucide-react";

export function TimerControls() {
  const { isRunning, start, pause, reset, skip } = useTimerStore();

  return (
    <div className="flex items-center justify-center gap-6 md:gap-8 mb-16 md:md-24">
      {/* Reset */}
      <button
        onClick={reset}
        className="p-5 md:p-6 glass rounded-full text-pf-on-surface-variant hover:text-white transition-all active:scale-90 border border-white/5 cursor-pointer"
        aria-label="Reset timer"
      >
        <RotateCcw className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      {/* Start / Pause */}
      <button
        onClick={isRunning ? pause : start}
        className="px-12 md:px-16 py-6 md:py-8 primary-glow rounded-full text-pf-on-primary-container font-headline font-extrabold text-2xl md:text-3xl tracking-tight shadow-[0_12px_30px_rgba(255,84,70,0.2)] active:scale-95 transition-all duration-300 cursor-pointer select-none"
        aria-label={isRunning ? "Pause timer" : "Start timer"}
      >
        {isRunning ? "PAUSE" : "START"}
      </button>

      {/* Skip */}
      <button
        onClick={skip}
        className="p-5 md:p-6 glass rounded-full text-pf-on-surface-variant hover:text-white transition-all active:scale-90 border border-white/5 cursor-pointer"
        aria-label="Skip to next mode"
      >
        <FastForward className="w-6 h-6 md:w-7 md:h-7" />
      </button>
    </div>
  );
}
