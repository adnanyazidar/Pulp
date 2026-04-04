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

  // Gamification
  joinDate: string;
  unlockedBadges: string[];
  xp: number;
  level: number;
  isLoading: boolean;

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
      joinDate: new Date().toISOString(),
      unlockedBadges: [],
      xp: 0,
      level: 1,
      isLoading: false,

      fetchStats: async () => {
        set({ isLoading: true });
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          const { data, error } = await getAuthedApi().api.me.get();
          if (error) throw new Error("Failed to fetch stats");
          if (data && (data as any).stats) {
            const stats = (data as any).stats;
            set({
              xp: stats.xp ?? 0,
              level: stats.level ?? 1,
              currentStreak: stats.currentStreak ?? 0,
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          set({ isLoading: false });
        }
      },

      addXP: (amount) => {
        set((state) => {
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

      recordSession: (durationMinutes, projectId) => {
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
          const { data, error } = await getAuthedApi().api.sessions.post(params);
          if (error) throw new Error("Failed to sync session");
          
          if (data && (data as any).gamification) {
            const { xp, level, currentStreak } = (data as any).gamification;
            set({ xp, level, currentStreak });
          }
          setSyncStatus("synced");
        } catch (err) {
          console.error(err);
          setSyncStatus("error");
        }
      },

      downloadCSV: () => {
        const { dailyHistory } = get();
        const dates = Object.keys(dailyHistory).sort();
        const csvContent = "data:text/csv;charset=utf-8,Date,Minutes\n" + dates.map(date => `${date},${dailyHistory[date]}`).join("\n");
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
  let previousAlarmCounter = useTimerStore.getState().alarmCounter;

  useTimerStore.subscribe(async (state) => {
    if (state.alarmCounter > previousAlarmCounter) {
      if (state.mode === "focus") {
        const { activeTaskId, tasks } = useTaskStore.getState();
        const activeTask = tasks.find(t => t.id === activeTaskId);
        const projectId = activeTask?.projectId ?? null;
        
        // 1. Update Local Stats
        useStatsStore.getState().recordSession(25, projectId);

        // 2. Sync to Backend
        await useStatsStore.getState().syncSessionToBackend({
          duration: 25 * 60,
          sessionType: "focus",
          taskId: (activeTaskId as number) ?? undefined
        });
        
        // 3. Refresh tasks to update actPomos
        if (activeTaskId) await useTaskStore.getState().fetchTasks();
      }
      previousAlarmCounter = state.alarmCounter;
    }
  });
}
