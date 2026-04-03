import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useTaskStore } from "./task-store";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerState {
  mode: TimerMode;
  timeRemaining: number; // seconds
  isRunning: boolean;
  sessionCount: number;
  totalFocusToday: number; // seconds
  ambientVolume: number; // 0–100
  ambientSoundId: string; // 'rain' | 'study'
  isAmbientPlaying: boolean;
  clickSoundId: "soft" | "tactile" | "none";
  alarmCounter: number; // Incremented when session naturally ends

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchMode: (mode: TimerMode) => void;
  skip: () => void;
  setAmbientVolume: (vol: number) => void;
  setAmbientSoundId: (id: string) => void;
  setClickSoundId: (id: "soft" | "tactile" | "none") => void;
  toggleAmbient: () => void;
}

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "focus",
      timeRemaining: DURATIONS.focus,
      isRunning: false,
      sessionCount: 1,
      totalFocusToday: 0,
      ambientVolume: 66,
      ambientSoundId: "rain",
      isAmbientPlaying: false,
      clickSoundId: "soft",
      alarmCounter: 0,

      start: () => set({ isRunning: true }),

      pause: () => set({ isRunning: false }),

      reset: () => {
        const { mode } = get();
        set({ timeRemaining: DURATIONS[mode], isRunning: false });
      },

      tick: () => {
        const { timeRemaining, isRunning, mode, sessionCount, totalFocusToday } =
          get();
        if (!isRunning || timeRemaining <= 0) return;

        const next = timeRemaining - 1;

        if (next <= 0) {
          // Session complete
          if (mode === "focus") {
            const newCount = sessionCount + 1;
            const nextMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
            // Increment actual pomodoros for the active task
            const { activeTaskId, incrementActPomos } = useTaskStore.getState();
            if (activeTaskId) {
              incrementActPomos(activeTaskId);
            }

            set({
              timeRemaining: DURATIONS[nextMode],
               isRunning: false,
              mode: nextMode,
              sessionCount: newCount,
              totalFocusToday: totalFocusToday + DURATIONS.focus,
              alarmCounter: get().alarmCounter + 1,
            });
          } else {
            // Break complete → back to focus
            set({
              timeRemaining: DURATIONS.focus,
              isRunning: false,
              mode: "focus",
              alarmCounter: get().alarmCounter + 1,
            });
          }
          return;
        }

        set({ timeRemaining: next });
      },

      switchMode: (mode: TimerMode) => {
        set({
          mode,
          timeRemaining: DURATIONS[mode],
          isRunning: false,
        });
      },

      skip: () => {
        const { mode, sessionCount } = get();
        if (mode === "focus") {
          const newCount = sessionCount + 1;
          const nextMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
          set({
            mode: nextMode,
            timeRemaining: DURATIONS[nextMode],
            isRunning: false,
            sessionCount: newCount,
          });
        } else {
          set({
            mode: "focus",
            timeRemaining: DURATIONS.focus,
            isRunning: false,
          });
        }
      },

      setAmbientVolume: (vol: number) => set({ ambientVolume: vol }),

      setAmbientSoundId: (id: string) => set({ ambientSoundId: id }),

      setClickSoundId: (id: "soft" | "tactile" | "none") => set({ clickSoundId: id }),

      toggleAmbient: () =>
        set((s) => ({ isAmbientPlaying: !s.isAmbientPlaying })),
    }),
    {
      name: "pomofocus-timer",
      partialize: (state) => ({
        mode: state.mode,
        sessionCount: state.sessionCount,
        totalFocusToday: state.totalFocusToday,
        ambientVolume: state.ambientVolume,
        ambientSoundId: state.ambientSoundId,
        clickSoundId: state.clickSoundId,
      }),
    }
  )
);

// Utility: format seconds to MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Utility: get display label for mode
export function getModeLabel(mode: TimerMode): string {
  switch (mode) {
    case "focus":
      return "Focus Mode";
    case "shortBreak":
      return "Short Break";
    case "longBreak":
      return "Long Break";
  }
}

// Utility: get total duration for mode
export function getModeDuration(mode: TimerMode): number {
  return DURATIONS[mode];
}
