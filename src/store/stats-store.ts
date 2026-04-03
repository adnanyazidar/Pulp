import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useTimerStore } from "./timer-store";
import { useTaskStore } from "./task-store";

interface StatsState {
  dailyHistory: Record<string, number>; // date string -> total minutes
  projectStats: Record<string, number>; // projectId -> total minutes
  totalTasksCompleted: number;
  currentStreak: number;
  lastFocusDate: string | null;
  weeklySessionsCount: number; // For the current week

  // Actions
  recordSession: (durationMinutes: number, projectId: string | null) => void;
  generateMockData: () => void;
  downloadCSV: () => void;
}

const getTodayKey = () => new Date().toISOString().split("T")[0];

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      dailyHistory: {},
      projectStats: {},
      totalTasksCompleted: 0,
      currentStreak: 0,
      lastFocusDate: null,
      weeklySessionsCount: 0,

      recordSession: (durationMinutes, projectId) => {
        const today = getTodayKey();
        const { dailyHistory, projectStats, currentStreak, lastFocusDate, weeklySessionsCount } = get();

        // Update daily history
        const newDailyHistory = { ...dailyHistory };
        newDailyHistory[today] = (newDailyHistory[today] || 0) + durationMinutes;

        // Update project stats
        const newProjectStats = { ...projectStats };
        if (projectId) {
          newProjectStats[projectId] = (newProjectStats[projectId] || 0) + durationMinutes;
        }

        // Update streak
        let newStreak = currentStreak;
        if (lastFocusDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = yesterday.toISOString().split("T")[0];

          if (lastFocusDate === yesterdayKey) {
            newStreak += 1;
          } else if (!lastFocusDate || lastFocusDate !== today) {
            newStreak = 1;
          }
        }

        set({
          dailyHistory: newDailyHistory,
          projectStats: newProjectStats,
          currentStreak: newStreak,
          lastFocusDate: today,
          weeklySessionsCount: weeklySessionsCount + 1,
        });
      },

      generateMockData: () => {
        const history: Record<string, number> = {};
        const pStats: Record<string, number> = {
          work: 1240,
          study: 860,
          personal: 420,
        };

        // Last 30 days
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          // Random minutes between 40 and 200
          history[key] = Math.floor(Math.random() * 160) + 40;
        }

        set({
          dailyHistory: history,
          projectStats: pStats,
          currentStreak: 12,
          totalTasksCompleted: 48,
          weeklySessionsCount: 24,
        });
      },

      downloadCSV: () => {
        const { dailyHistory } = get();
        const dates = Object.keys(dailyHistory).sort();
        
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Date,Minutes\n"
          + dates.map(date => `${date},${dailyHistory[date]}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pomofocus_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }),
    {
      name: "pomofocus-stats",
    }
  )
);

// Subscribe to timer-store to update stats automatically
if (typeof window !== "undefined") {
  let previousAlarmCounter = useTimerStore.getState().alarmCounter;

  useTimerStore.subscribe((state) => {
    if (state.alarmCounter > previousAlarmCounter) {
      // Session finished naturally
      if (state.mode === "focus") {
        const { activeTaskId, tasks } = useTaskStore.getState();
        const activeTask = tasks.find(t => t.id === activeTaskId);
        const projectId = activeTask?.projectId || null;
        
        // Timer duration is 25m in PRD
        useStatsStore.getState().recordSession(25, projectId);
      }
      previousAlarmCounter = state.alarmCounter;
    }
  });
}
