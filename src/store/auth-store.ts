import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  syncStatus: "synced" | "syncing" | "offline" | "error";
  isAuthModalOpen: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setSyncStatus: (status: AuthState["syncStatus"]) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      syncStatus: "synced",
      isAuthModalOpen: false,

      setAuth: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true, syncStatus: "synced" });
        // Trigger Smart Merge when logging in or registering
        import('@/store/task-store').then(m => {
          m.useTaskStore.getState().syncLocalToCloud();
        });
      },
      
      logout: () => {
        const state = get();
        
        // If we are currently syncing, we should ideally wait or warn, 
        // but for now we'll prioritize the user's intent to exit.
        // We set syncStatus to offline to prevent further sync attempts.
        set({ token: null, user: null, isAuthenticated: false, syncStatus: "offline" });

        // 1. Reset In-Memory Stores
        import('@/store/daily-focus-store').then(m => {
          m.useDailyFocusStore.getState().clearAll();
        });

        // 2. Clear LocalStorage Persist (Manual)
        const keysToClear = [
          'pulp-tasks', 
          'pomopulp-stats', 
          'pomopulp-settings', 
          'pulp-daily-scratchpad', 
          'pomopulp-timer', 
          'pulp-media', 
          'pomopulp-ui', 
          'pulp-auth'
        ];
        keysToClear.forEach(key => localStorage.removeItem(key));

        // 3. Reset Memory State for stats
        import('@/store/stats-store').then(m => {
          m.useStatsStore.setState({
            dailyHistory: {},
            projectStats: {},
            totalTasksCompleted: 0,
            currentStreak: 0,
            lastFocusDate: null,
            weeklySessionsCount: 0,
            analyticsHistory: [],
            unlockedBadges: [],
            xp: 0,
            level: 1,
            isUpdating: false,
            newlyUnlockedBadges: [],
          });
        });

        // 4. Kick back to Home and Refresh
        window.location.href = '/';
      },
      
      setSyncStatus: (status: AuthState["syncStatus"]) => set({ syncStatus: status }),

      setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
    }),
    {
      name: "pulp-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
