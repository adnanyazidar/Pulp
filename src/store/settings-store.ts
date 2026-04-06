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
  fetchSettings: () => Promise<void>;
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

      fetchSettings: async () => {
        try {
          const { getAuthedApi } = await import("@/lib/api");
          const { data, error } = await getAuthedApi().api.settings.get();
          if (error) throw new Error("Failed to fetch settings");
          if (data) {
            const d = data as any;
            set({
              timerDurations: {
                focus: d.focusDuration ?? 25,
                shortBreak: d.shortBreakDuration ?? 5,
                longBreak: d.longBreakDuration ?? 15,
              },
              themeSettings: {
                accentColor: d.accentColor ?? "coral",
              },
              uiSettings: {
                autoStartBreaks: !!d.autoStartBreaks,
                showTabTimer: get().uiSettings.showTabTimer,
              }
            });
            if (typeof document !== "undefined" && (data as any).accentColor) {
              const color = (data as any).accentColor as AccentColor;
              document.documentElement.style.setProperty("--pf-primary", ACCENT_COLORS[color] || ACCENT_COLORS.coral);
            }
          }
        } catch (err: any) {
          console.error("Settings sync error:", err);
        }
      },

      updateTimerDuration: async (mode, minutes) => {
        const prev = get().timerDurations;
        set((state) => ({
          timerDurations: { ...state.timerDurations, [mode]: minutes },
        }));

        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          const fieldMap = { focus: 'focusDuration', shortBreak: 'shortBreakDuration', longBreak: 'longBreakDuration' };
          await getAuthedApi().api.settings.patch({ [fieldMap[mode]]: minutes });
        } catch (err) {
          set({ timerDurations: prev });
        }
      },

      updateSoundSetting: (key, value) =>
        set((state) => ({
          soundSettings: { ...state.soundSettings, [key]: value },
        })),

      updateThemeAccent: async (color) => {
        const prev = get().themeSettings.accentColor;
        set({ themeSettings: { accentColor: color } });
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty("--pf-primary", ACCENT_COLORS[color]);
        }

        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          await getAuthedApi().api.settings.patch({ accentColor: color });
        } catch (err) {
          set({ themeSettings: { accentColor: prev } });
        }
      },

      updateUISetting: async (key, value) => {
        const prev = get().uiSettings;
        set((state) => ({
          uiSettings: { ...state.uiSettings, [key]: value },
        }));

        if (key === 'autoStartBreaks') {
          try {
            const raw = localStorage.getItem("pulp-auth");
            if (!raw) return;
            const token = JSON.parse(raw)?.state?.token;
            if (!token) return;

            const { getAuthedApi } = await import("@/lib/api");
            await getAuthedApi().api.settings.patch({ autoStartBreaks: value });
          } catch (err) {
            set({ uiSettings: prev });
          }
        }
      },

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
