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
    (set) => ({
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
        // 1. Reset In-Memory Stores (to be safe before redirect)
        import('@/store/daily-focus-store').then(m => {
          m.useDailyFocusStore.getState().clearAll();
        });

        // 2. Hapus Token & User Data
        set({ token: null, user: null, isAuthenticated: false, syncStatus: "synced" });

        // 3. Bersihkan LocalStorage Persist (Manual)
        localStorage.removeItem('pulp-tasks');
        localStorage.removeItem('pomopulp-stats'); // Fixed: was pulp-stats
        localStorage.removeItem('pomopulp-settings'); // Fixed: was pulp-settings
        localStorage.removeItem('pulp-daily-scratchpad');
        localStorage.removeItem('pomopulp-timer');
        localStorage.removeItem('pulp-media');
        localStorage.removeItem('pomopulp-ui');
        localStorage.removeItem('pulp-auth'); // Clear auth persist too just in case

        // 4. Reset Memory State for stats gracefully before redirect
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

        // 5. Kick back to Home and Refresh
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
