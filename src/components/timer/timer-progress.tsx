"use client";

import { useTimerStore, getModeDuration } from "@/store/timer-store";

export function TimerProgress() {
  const { timeRemaining, mode } = useTimerStore();
  const total = getModeDuration(mode);
  const progress = ((total - timeRemaining) / total) * 100;

  return (
    <div className="w-full h-1.5 bg-pf-surface-container-highest mb-16 overflow-hidden rounded-full max-w-md mx-auto">
      <div
        className="h-full primary-glow transition-all duration-1000 ease-linear"
        style={{ width: `${Math.max(progress, 1)}%` }}
      />
    </div>
  );
}
