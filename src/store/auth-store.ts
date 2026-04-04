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
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setSyncStatus: (status: AuthState["syncStatus"]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      syncStatus: "synced",

      setAuth: (user, token) => set({ user, token, isAuthenticated: true, syncStatus: "synced" }),
      
      logout: () => set({ user: null, token: null, isAuthenticated: false, syncStatus: "synced" }),
      
      setSyncStatus: (status) => set({ syncStatus: status }),
    }),
    {
      name: "pulp-auth",
    }
  )
);
