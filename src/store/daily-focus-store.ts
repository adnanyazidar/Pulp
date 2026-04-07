import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DailyNote {
  id: string;
  content: string;
  isCompleted: boolean;
}

interface DailyFocusState {
  notes: DailyNote[];
  addNote: (content: string) => void;
  toggleNote: (id: string) => void;
  deleteNote: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

export const useDailyFocusStore = create<DailyFocusState>()(
  persist(
    (set) => ({
      notes: [],

      addNote: (content) =>
        set((state) => ({
          notes: [
            { id: crypto.randomUUID(), content, isCompleted: false },
            ...state.notes,
          ],
        })),

      toggleNote: (id) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isCompleted: !n.isCompleted } : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),

      clearCompleted: () =>
        set((state) => ({
          notes: state.notes.filter((n) => !n.isCompleted),
        })),

      clearAll: () => set({ notes: [] }),
    }),
    { name: "pulp-daily-scratchpad" }
  )
);
