"use client";

import { useTimerStore } from "@/store/timer-store";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContextualFab() {
  const { isRunning, start, pause } = useTimerStore();

  return (
    <button
      onClick={() => (isRunning ? pause() : start())}
      className={cn(
        "fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all z-50 md:hidden",
        "bg-pf-primary-container text-pf-on-primary-container hover:scale-110 active:scale-95",
        isRunning && "animate-timer-pulse shadow-[0_0_20px_rgba(255,84,70,0.4)]"
      )}
    >
      {isRunning ? (
        <Pause size={32} fill="currentColor" />
      ) : (
        <Play size={32} className="ml-1" fill="currentColor" />
      )}
    </button>
  );
}
