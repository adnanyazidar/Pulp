import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Project {
  id: string;
  name: string;
  color: string; // Hex color for the indicator line
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  estPomos: number; // Estimated pomodoros
  actPomos: number; // Actual pomodoros completed
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  note?: string;
  createdAt: number;
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  activeTaskId: string | null;

  // Actions
  addTask: (task: Omit<Task, "id" | "actPomos" | "isCompleted" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  incrementActPomos: (id: string) => void;
  
  // Project Actions (for future extensibility)
  addProject: (project: Omit<Project, "id">) => void;
}

const DEFAULT_PROJECTS: Project[] = [
  { id: "work", name: "Work", color: "#ffb4aa" }, // Coral
  { id: "study", name: "Study", color: "#66d9cc" }, // Tosca
  { id: "personal", name: "Personal", color: "#a2c9ff" }, // Blue
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      projects: DEFAULT_PROJECTS,
      activeTaskId: null,

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: crypto.randomUUID(),
              actPomos: 0,
              isCompleted: false,
              createdAt: Date.now(),
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        })),

      toggleComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
          ),
        })),

      setActiveTask: (id) => set({ activeTaskId: id }),

      incrementActPomos: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, actPomos: t.actPomos + 1 } : t
          ),
        })),

      addProject: (projectData) =>
        set((state) => ({
          projects: [
            ...state.projects,
            { ...projectData, id: crypto.randomUUID() },
          ],
        })),
    }),
    {
      name: "pomofocus-tasks",
    }
  )
);
