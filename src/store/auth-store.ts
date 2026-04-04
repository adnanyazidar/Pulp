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

      setAuth: (user, token) => set({ user, token, isAuthenticated: true, syncStatus: "synced" }),
      
      logout: () => {
        // 1. Hapus Token & User Data
        set({ token: null, user: null, isAuthenticated: false, syncStatus: "synced" });

        // 2. Bersihkan LocalStorage Persist (Manual)
        localStorage.removeItem('pulp-tasks');
        localStorage.removeItem('pulp-stats');
        localStorage.removeItem('pulp-settings');
        localStorage.removeItem('pulp-auth'); // Clear auth persist too just in case

        // 3. Kick back to Home and Refresh
        window.location.href = '/';
      },
      
      setSyncStatus: (status) => set({ syncStatus: status }),

      setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
    }),
    {
      name: "pulp-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
