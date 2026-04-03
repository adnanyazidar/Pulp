import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SUPPORT_LINKS = {
  saweria: process.env.NEXT_PUBLIC_SAWERIA_URL || "https://saweria.co/adnanyazidar",
  kofi: "https://ko-fi.com/pomofocus",
};

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true, // Default to expanded on desktop
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: "pomofocus-ui",
    }
  )
);
