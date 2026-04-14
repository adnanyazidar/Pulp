import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useTaskStore } from "./task-store";
import { useSettingsStore } from "./settings-store";

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
  lastSessionFinishedAt: number | null; // Timestamp for sync triggers
  hasPaused: boolean; // Tracking for "Zen Master" badge
  expectedEndTime: number | null; // For background tab stability

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

// Helper: get duration in seconds from settings store
export const getModeDuration = (mode: TimerMode): number => {
  const durations = useSettingsStore.getState().timerDurations;
  return (durations[mode] || 25) * 60;
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "focus",
      timeRemaining: getModeDuration("focus"),
      isRunning: false,
      sessionCount: 1,
      totalFocusToday: 0,
      ambientVolume: 66,
      ambientSoundId: "rain",
      isAmbientPlaying: false,
      clickSoundId: "soft",
      alarmCounter: 0,
      lastSessionFinishedAt: null,
      hasPaused: false,
      expectedEndTime: null,

      start: () => {
        const { timeRemaining } = get();
        set({ 
          isRunning: true, 
          expectedEndTime: Date.now() + (timeRemaining * 1000) 
        });
      },

      pause: () => {
        const { expectedEndTime } = get();
        if (expectedEndTime) {
          const remaining = Math.max(0, Math.round((expectedEndTime - Date.now()) / 1000));
          set({ timeRemaining: remaining });
        }
        set({ isRunning: false, hasPaused: true, expectedEndTime: null });
      },

      reset: () => {
        const { mode } = get();
        set({ 
          timeRemaining: getModeDuration(mode), 
          isRunning: false, 
          hasPaused: false,
          expectedEndTime: null 
        });
      },

      tick: () => {
        const { expectedEndTime, isRunning, mode, sessionCount, totalFocusToday } =
          get();
        if (!isRunning || !expectedEndTime) return;

        const now = Date.now();
        const next = Math.max(0, Math.round((expectedEndTime - now) / 1000));

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
              timeRemaining: getModeDuration(nextMode),
              isRunning: false,
              mode: nextMode,
              sessionCount: newCount,
              totalFocusToday: totalFocusToday + getModeDuration("focus"),
              alarmCounter: get().alarmCounter + 1,
              lastSessionFinishedAt: Date.now(),
            });
          } else {
            // Break complete → back to focus
            set({
              timeRemaining: getModeDuration("focus"),
              isRunning: false,
              mode: "focus",
              alarmCounter: get().alarmCounter + 1,
              lastSessionFinishedAt: Date.now(),
            });
          }
          return;
        }

        set({ timeRemaining: next });
      },

      switchMode: (mode: TimerMode) => {
        set({
          mode,
          timeRemaining: getModeDuration(mode),
          isRunning: false,
          hasPaused: false,
          expectedEndTime: null,
        });
      },

      skip: () => {
        const { mode, sessionCount } = get();
        if (mode === "focus") {
          const newCount = sessionCount + 1;
          const nextMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
          set({
            mode: nextMode,
            timeRemaining: getModeDuration(nextMode),
            isRunning: false,
            sessionCount: newCount,
            hasPaused: false,
            expectedEndTime: null,
          });
        } else {
          set({
            mode: "focus",
            timeRemaining: getModeDuration("focus"),
            isRunning: false,
            hasPaused: false,
            expectedEndTime: null,
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
      name: "pomopulp-timer",
      partialize: (state) => ({
        mode: state.mode,
        timeRemaining: state.timeRemaining,
        sessionCount: state.sessionCount,
        totalFocusToday: state.totalFocusToday,
        ambientVolume: state.ambientVolume,
        ambientSoundId: state.ambientSoundId,
        clickSoundId: state.clickSoundId,
      }),
    }
  )
);

// Subscribe to settings store to update timeRemaining when durations change
useSettingsStore.subscribe((state) => {
  const { mode, isRunning, timeRemaining } = useTimerStore.getState();
  // Only update if timer is not running
  if (!isRunning) {
    const newDuration = (state.timerDurations[mode] || 25) * 60;
    if (timeRemaining !== newDuration) {
      useTimerStore.setState({ timeRemaining: newDuration });
    }
  }
});

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
