import { create } from "zustand";
import { useTimerStore } from "./timer-store";
import { useSettingsStore } from "./settings-store";
import { useTaskStore } from "./task-store";
import { useAuthStore } from "./auth-store";
import { getLocalDateKey, formatTimezoneOffset } from "@/lib/date-utils";

interface StatsState {
  dailyHistory: Record<string, number>; // date string -> total minutes
  projectStats: Record<number, number>; // projectId -> total minutes
  totalTasksCompleted: number;
  currentStreak: number;
  lastFocusDate: string | null;
  weeklySessionsCount: number;
  analyticsHistory: { date: string; minutes: number }[];
  hourlyDistribution: { hour: number; minutes: number }[];

  isUpdating: boolean;
  newlyUnlockedBadges: string[]; // For celebration trigger

  // Gamification
  joinDate: string;
  unlockedBadges: string[];
  xp: number;
  level: number;
  isLoading: boolean;

  // Actions
  fetchStats: () => Promise<void>;
  recordSession: (durationMinutes: number, projectId: number | null) => void;
  syncSessionToBackend: (params: { duration: number; sessionType: string; taskId?: number; rating?: number; wasPaused?: boolean; ambientSound?: string }) => Promise<void>;
  addXP: (amount: number) => void;
  clearNewBadges: () => void;
  downloadCSV: () => void;
}

const getTodayKey = () => getLocalDateKey();

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
      hourlyDistribution: [],
      joinDate: new Date().toISOString(),
      unlockedBadges: [],
      xp: 0,
      level: 1,
      isLoading: false,
      isUpdating: false,
      newlyUnlockedBadges: [],

      fetchStats: async () => {
        set({ isUpdating: true });
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          
          const tzOffset = formatTimezoneOffset();

          // Use the new /analytics/summary endpoint
          const { data, error } = await getAuthedApi().api.analytics.summary.get({
            $query: { tzOffset }
          });
          if (error) throw new Error("Failed to fetch analytics");
          
          if (data) {
            interface AnalyticsSummary {
              xp: number;
              level: number;
              currentStreak: number;
              history: { date: string; minutes: number }[];
              projectDistribution: { projectId: number; minutes: number }[];
              hourlyDistribution: { hour: number; minutes: number }[];
              badges: { badgeId: string }[];
            }
            const d = data as unknown as AnalyticsSummary;
            set({
              xp: d.xp ?? 0,
              level: d.level ?? 1,
              currentStreak: d.currentStreak ?? 0,
              analyticsHistory: d.history || [],
              hourlyDistribution: d.hourlyDistribution || [],
              unlockedBadges: (d.badges || []).map(b => b.badgeId),
              // Update dailyHistory for components still using it
              dailyHistory: (d.history || [])
                .filter(h => h && h.date) // Defensive check against null keys
                .reduce((acc: Record<string, number>, curr: { date: string; minutes: number }) => ({
                  ...acc, [curr.date]: curr.minutes
                }), {}),
              // Update projectStats from server data (Overwrite stale data)
              projectStats: (d.projectDistribution || []).reduce((acc: Record<number, number>, curr: { projectId: number; minutes: number }) => ({
                ...acc, [curr.projectId]: curr.minutes
              }), {})
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          setTimeout(() => set({ isUpdating: false }), 500); // Small delay for UX transition
        }
      },

      addXP: (amount: number) => set((state) => ({ xp: state.xp + amount })),

      clearNewBadges: () => set({ newlyUnlockedBadges: [] }),

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
          const tzOffset = formatTimezoneOffset();

          const { data } = await getAuthedApi().api.sessions.complete.post({ 
            duration: params.duration, 
            sessionType: params.sessionType, 
            taskId: params.taskId,
            rating: params.rating,
            wasPaused: params.wasPaused,
            ambientSound: params.ambientSound,
            tzOffset
          });
          
          if (data) {
            const d = data as { xpEarned?: number; newlyUnlocked?: { id: string }[] };
            if (d.xpEarned) get().addXP(d.xpEarned);
            if (d.newlyUnlocked && d.newlyUnlocked.length > 0) {
              set((state) => ({
                newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...d.newlyUnlocked!.map(b => b.id)],
                unlockedBadges: [...new Set([...state.unlockedBadges, ...d.newlyUnlocked!.map(b => b.id)])]
              }));
            }
          }
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
        link.download = "pomopulp_report.csv";
        link.click();
      },
    }),
    {
      name: "pomopulp-stats"
    }
  )
);

// Subscribe to timer-store to update stats automatically
if (typeof window !== "undefined") {
  let lastProcessedTimestamp: number | null = null;

  useTimerStore.subscribe(async (timerState) => {
    // Only process if lastSessionFinishedAt changed AND it's not the initial state
    if (timerState.lastSessionFinishedAt && timerState.lastSessionFinishedAt !== lastProcessedTimestamp) {
      // Small defensive check for mode (since state updates are batch-processed)
      // If mode is now break, it means a focus session just finished.
      const finishedMode = timerState.mode.includes("Break") ? "focus" : "break"; 
      
      if (finishedMode === "focus") {
        const { activeTaskId, tasks } = useTaskStore.getState();
        const activeTask = tasks.find(t => t.id === activeTaskId);
        const projectId = activeTask?.projectId ?? null;
        
        // 1. Update Local Stats (Optimistic)
        const focusDuration = 25; // 25 minutes
        useStatsStore.getState().recordSession(focusDuration, projectId);

        // 2. Sync to Backend (Atomic Transaction)
        const { hasPaused: wasPaused } = useTimerStore.getState();
        const ambientSound = useSettingsStore.getState().soundSettings.ambientSound;

        await useStatsStore.getState().syncSessionToBackend({
          duration: 25 * 60, // 25 minutes in seconds
          sessionType: "focus",
          taskId: (activeTaskId as number) ?? undefined,
          wasPaused,
          ambientSound
        });
        
        // 3. Refresh tasks to update actPomos
        if (activeTaskId) {
          await useTaskStore.getState().fetchTasks();
          
          // 4. Auto-complete check
          const { tasks, updateTask, triggerCelebration } = useTaskStore.getState();
          const updatedTask = tasks.find(t => t.id === activeTaskId);
          
          if (updatedTask && !updatedTask.isCompleted && updatedTask.actPomos >= updatedTask.estPomos) {
            await updateTask(activeTaskId, { isCompleted: true });
            triggerCelebration();
          }
        }
      }
      lastProcessedTimestamp = timerState.lastSessionFinishedAt;
    }
  });
}
