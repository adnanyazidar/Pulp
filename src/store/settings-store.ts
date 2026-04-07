import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccentColor = "coral" | "mint" | "blue" | "pink";

export interface SettingsState {
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
  updateSettings: (draft: Partial<SettingsState>) => Promise<void>;
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
        set((state: SettingsState) => ({
          timerDurations: { ...state.timerDurations, [mode]: minutes },
        }));

        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          const fieldMap = { focus: 'focusDuration', shortBreak: 'shortBreakDuration', longBreak: 'longBreakDuration' };
          const { data, error } = await getAuthedApi().api.settings.patch({ [fieldMap[mode]]: minutes });
          if (data && (data as any).newlyUnlocked?.length > 0) {
            const { useStatsStore } = await import("./stats-store");
            useStatsStore.setState((state) => ({
              newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...((data as any).newlyUnlocked as any[]).map(b => b.id)],
              unlockedBadges: [...new Set([...state.unlockedBadges, ...((data as any).newlyUnlocked as any[]).map(b => b.id)])]
            }));
          }
        } catch (err) {
          set({ timerDurations: prev });
        }
      },

      updateSoundSetting: (key: keyof SettingsState["soundSettings"], value: any) =>
        set((state: SettingsState) => ({
          soundSettings: { ...state.soundSettings, [key]: value },
        })),

      updateThemeAccent: async (color: AccentColor) => {
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
          const { data, error } = await getAuthedApi().api.settings.patch({ accentColor: color });
          if (data && (data as any).newlyUnlocked?.length > 0) {
            const { useStatsStore } = await import("./stats-store");
            useStatsStore.setState((state) => ({
              newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...((data as any).newlyUnlocked as any[]).map(b => b.id)],
              unlockedBadges: [...new Set([...state.unlockedBadges, ...((data as any).newlyUnlocked as any[]).map(b => b.id)])]
            }));
          }
        } catch (err) {
          set({ themeSettings: { accentColor: prev } });
        }
      },

      updateUISetting: async (key: keyof SettingsState["uiSettings"], value: boolean) => {
        const prev = get().uiSettings;
        set((state: SettingsState) => ({
          uiSettings: { ...state.uiSettings, [key]: value },
        }));

        if (key === 'autoStartBreaks') {
          try {
            const raw = localStorage.getItem("pulp-auth");
            if (!raw) return;
            const token = JSON.parse(raw)?.state?.token;
            if (!token) return;

            const { getAuthedApi } = await import("@/lib/api");
            const { data, error } = await getAuthedApi().api.settings.patch({ autoStartBreaks: value });
            if (data && (data as any).newlyUnlocked?.length > 0) {
              const { useStatsStore } = await import("./stats-store");
              useStatsStore.setState((state) => ({
                newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...((data as any).newlyUnlocked as any[]).map(b => b.id)],
                unlockedBadges: [...new Set([...state.unlockedBadges, ...((data as any).newlyUnlocked as any[]).map(b => b.id)])]
              }));
            }
          } catch (err) {
            set({ uiSettings: prev });
          }
        }
      },

      updateSettings: async (draft) => {
        const prev = {
          timerDurations: get().timerDurations,
          soundSettings: get().soundSettings,
          themeSettings: get().themeSettings,
          uiSettings: get().uiSettings,
        };

        // 1. Optimistic Update
        set((state: SettingsState) => ({
          ...state,
          ...draft,
        }));

        // 2. Sync to Backend
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          
          // Map draft to backend schema
          const payload: any = {};
          if (draft.timerDurations) {
            if (draft.timerDurations.focus) payload.focusDuration = draft.timerDurations.focus;
            if (draft.timerDurations.shortBreak) payload.shortBreakDuration = draft.timerDurations.shortBreak;
            if (draft.timerDurations.longBreak) payload.longBreakDuration = draft.timerDurations.longBreak;
          }
          if (draft.themeSettings?.accentColor) payload.accentColor = draft.themeSettings.accentColor;
          if (draft.uiSettings?.hasOwnProperty('autoStartBreaks')) payload.autoStartBreaks = draft.uiSettings.autoStartBreaks;
          
          // Update css variable for theme preview if it's being committed
          if (draft.themeSettings?.accentColor) {
             document.documentElement.style.setProperty("--pf-primary", ACCENT_COLORS[draft.themeSettings.accentColor]);
          }

          if (Object.keys(payload).length > 0) {
            const { data, error } = await getAuthedApi().api.settings.patch(payload);
            if (error) throw new Error("Failed to sync settings");
            
            // Capture newly unlocked badges
            const d = data as any;
            if (d?.newlyUnlocked && d.newlyUnlocked.length > 0) {
              const { useStatsStore } = await import("./stats-store");
              useStatsStore.setState((state) => ({
                newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...d.newlyUnlocked.map((b: any) => b.id)],
                unlockedBadges: [...new Set([...state.unlockedBadges, ...d.newlyUnlocked.map((b: any) => b.id)])]
              }));
            }
          }
        } catch (err) {
          console.error("Failed to sync bulk settings:", err);
          set(prev);
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
