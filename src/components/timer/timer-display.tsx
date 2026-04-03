"use client";

import { useTimerStore, formatTime } from "@/store/timer-store";

export function TimerDisplay() {
  const { timeRemaining } = useTimerStore();
  const display = formatTime(timeRemaining);

  return (
    <div className="mb-12 timer-glow relative inline-block">
      {/* Subtle background disk glow */}
      <div className="absolute inset-0 bg-pf-primary/[0.035] rounded-full blur-3xl -z-10" />
      <span className="font-headline font-extrabold text-[6rem] sm:text-[8rem] md:text-[14rem] leading-none tabular-nums tracking-tighter text-pf-on-surface block transition-theme select-none">
        {display}
      </span>
    </div>
  );
}
