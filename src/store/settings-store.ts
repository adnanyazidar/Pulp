import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccentColor = "coral" | "mint" | "blue" | "pink";

interface SettingsState {
  timerDurations: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
  soundSettings: {
    alarmVolume: number;
    alarmSound: string;
    ambientVolume: number;
    ambientSound: string;
    isTicking: boolean;
  };
  themeSettings: {
    accentColor: AccentColor;
  };
  uiSettings: {
    autoStartBreaks: boolean;
    showTabTimer: boolean;
  };

  // Actions
  updateTimerDuration: (mode: "focus" | "shortBreak" | "longBreak", minutes: number) => void;
  updateSoundSetting: (key: keyof SettingsState["soundSettings"], value: any) => void;
  updateThemeAccent: (color: AccentColor) => void;
  updateUISetting: (key: keyof SettingsState["uiSettings"], value: boolean) => void;
  exportData: () => void;
  resetData: () => void;
}

const ACCENT_COLORS: Record<AccentColor, string> = {
  coral: "#FF6B6B",
  mint: "#66D9CC",
  blue: "#A2C9FF",
  pink: "#FFB4AA",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      timerDurations: {
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
      },
      soundSettings: {
        alarmVolume: 50,
        alarmSound: "bell",
        ambientVolume: 30,
        ambientSound: "rain",
        isTicking: false,
      },
      themeSettings: {
        accentColor: "coral",
      },
      uiSettings: {
        autoStartBreaks: false,
        showTabTimer: true,
      },

      updateTimerDuration: (mode, minutes) =>
        set((state) => ({
          timerDurations: { ...state.timerDurations, [mode]: minutes },
        })),

      updateSoundSetting: (key, value) =>
        set((state) => ({
          soundSettings: { ...state.soundSettings, [key]: value },
        })),

      updateThemeAccent: (color) => {
        set({ themeSettings: { accentColor: color } });
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--pf-primary", ACCENT_COLORS[color]);
        }
      },

      updateUISetting: (key, value) =>
        set((state) => ({
          uiSettings: { ...state.uiSettings, [key]: value },
        })),

      exportData: () => {
        const data = {
          settings: get(),
          timestamp: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `pomofocus_backup_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      resetData: () => {
        if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
          localStorage.clear();
          window.location.reload();
        }
      },
    }),
    {
      name: "pomofocus-settings",
      onRehydrateStorage: () => (state) => {
        // Sync theme on load
        if (state && typeof document !== "undefined") {
          document.documentElement.style.setProperty(
            "--pf-primary",
            ACCENT_COLORS[state.themeSettings.accentColor]
          );
        }
      },
    }
  )
);
