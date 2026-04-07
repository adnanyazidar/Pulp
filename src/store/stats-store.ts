import { create } from "zustand";
import { useTimerStore } from "./timer-store";
import { useTaskStore } from "./task-store";
import { useAuthStore } from "./auth-store";

interface StatsState {
  dailyHistory: Record<string, number>; // date string -> total minutes
  projectStats: Record<number, number>; // projectId -> total minutes
  totalTasksCompleted: number;
  currentStreak: number;
  lastFocusDate: string | null;
  weeklySessionsCount: number;
  analyticsHistory: { date: string; minutes: number }[];

  // Gamification
  joinDate: string;
  unlockedBadges: string[];
  xp: number;
  level: number;
  isLoading: boolean;
  isUpdating: boolean; // For "flicker" effect/skeleton

  // Actions
  fetchStats: () => Promise<void>;
  recordSession: (durationMinutes: number, projectId: number | null) => void;
  syncSessionToBackend: (params: { duration: number; sessionType: string; taskId?: number; rating?: number }) => Promise<void>;
  addXP: (amount: number) => void;
  checkAchievements: () => void;
  downloadCSV: () => void;
}

const getTodayKey = () => new Date().toISOString().split("T")[0];

import { persist } from "zustand/middleware";

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      dailyHistory: {},
      projectStats: {},
      totalTasksCompleted: 0,
      currentStreak: 0,
      lastFocusDate: null,
      weeklySessionsCount: 0,
      analyticsHistory: [],
      joinDate: new Date().toISOString(),
      unlockedBadges: [],
      xp: 0,
      level: 1,
      isLoading: false,
      isUpdating: false,

      fetchStats: async () => {
        set({ isUpdating: true });
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          // Use the new /analytics/summary endpoint
          const { data, error } = await getAuthedApi().api.analytics.summary.get();
          if (error) throw new Error("Failed to fetch analytics");
          
          if (data) {
            const d = data as any;
            set({
              xp: d.xp ?? 0,
              level: d.level ?? 1,
              currentStreak: d.currentStreak ?? 0,
              analyticsHistory: d.history ?? [],
              // Update dailyHistory for components still using it
              dailyHistory: (d.history || []).reduce((acc: any, curr: any) => ({
                ...acc, [curr.date]: curr.minutes
              }), {})
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setTimeout(() => set({ isUpdating: false }), 500); // Small delay for UX transition
        }
      },

      addXP: (amount: number) => {
        set((state: StatsState) => {
          const newTotalXp = state.xp + amount;
          const XP_PER_LEVEL = 1000;
          if (newTotalXp >= XP_PER_LEVEL) {
            return { xp: newTotalXp - XP_PER_LEVEL, level: state.level + 1 };
          }
          return { xp: newTotalXp };
        });
        get().checkAchievements();
      },

      checkAchievements: () => {
        const { currentStreak, level, unlockedBadges } = get();
        const newBadges = [...unlockedBadges];
        const unlock = (id: string) => { if (!newBadges.includes(id)) newBadges.push(id); };

        if (level >= 5) unlock("early_bird");
        if (level >= 10) unlock("focus_master");
        if (currentStreak >= 7) unlock("week_warrior");

        if (newBadges.length !== unlockedBadges.length) set({ unlockedBadges: newBadges });
      },

      recordSession: (durationMinutes: number, projectId: number | null) => {
        const today = getTodayKey();
        const { dailyHistory, projectStats, currentStreak, lastFocusDate, weeklySessionsCount } = get();

        const newDailyHistory = { ...dailyHistory, [today]: (dailyHistory[today] || 0) + durationMinutes };
        const newProjectStats = { ...projectStats };
        if (projectId) newProjectStats[projectId] = (projectStats[projectId] || 0) + durationMinutes;

        let newStreak = currentStreak;
        if (lastFocusDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = yesterday.toISOString().split("T")[0];
          newStreak = (lastFocusDate === yesterdayKey) ? newStreak + 1 : 1;
        }

        set({
          dailyHistory: newDailyHistory,
          projectStats: newProjectStats,
          currentStreak: newStreak,
          lastFocusDate: today,
          weeklySessionsCount: weeklySessionsCount + 1,
        });
      },

      syncSessionToBackend: async (params) => {
        const { isAuthenticated, setSyncStatus } = useAuthStore.getState();
        if (!isAuthenticated) return;

        setSyncStatus("syncing");
        try {
          const { getAuthedApi } = await import("@/lib/api");
          // Use /api/sessions/complete
          const { data, error } = await getAuthedApi().api.sessions.complete.post(params);
          if (error) throw new Error("Failed to sync session");
          
          // Data is refreshed globally after sync
          await get().fetchStats();
          setSyncStatus("synced");
        } catch (err) {
          console.error(err);
          setSyncStatus("error");
        }
      },

      downloadCSV: () => {
        const { dailyHistory } = get();
        const dates = Object.keys(dailyHistory).sort();
        const csvContent = "data:text/csv;charset=utf-8,Date,Minutes\n" + dates.map((date: string) => `${date},${dailyHistory[date]}`).join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = "pomofocus_report.csv";
        link.click();
      },
    }),
    {
      name: "pulp-stats"
    }
  )
);

// Subscribe to timer-store to update stats automatically
if (typeof window !== "undefined") {
  let lastProcessedTimestamp: number | null = null;

  useTimerStore.subscribe(async (state: any) => {
    // Only process if lastSessionFinishedAt changed AND it's not the initial state
    if (state.lastSessionFinishedAt && state.lastSessionFinishedAt !== lastProcessedTimestamp) {
      // Small defensive check for mode (since state updates are batch-processed)
      // If mode is now break, it means a focus session just finished.
      const finishedMode = state.mode.includes("Break") ? "focus" : "break"; 
      
      if (finishedMode === "focus") {
        const { activeTaskId, tasks } = useTaskStore.getState();
        const activeTask = tasks.find(t => t.id === activeTaskId);
        const projectId = activeTask?.projectId ?? null;
        
        // 1. Update Local Stats (Optimistic)
        const focusDuration = 25; // 25 minutes
        useStatsStore.getState().recordSession(focusDuration, projectId);

        // 2. Sync to Backend (Atomic Transaction)
        await useStatsStore.getState().syncSessionToBackend({
          duration: 25 * 60, // 25 minutes in seconds
          sessionType: "focus",
          taskId: (activeTaskId as number) ?? undefined
        });
        
        // 3. Refresh tasks to update actPomos
        if (activeTaskId) await useTaskStore.getState().fetchTasks();
      }
      lastProcessedTimestamp = state.lastSessionFinishedAt;
    }
  });
}
