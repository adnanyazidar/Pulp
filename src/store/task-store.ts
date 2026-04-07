import { create } from "zustand";

export interface Project {
  id: number;
  name: string;
  color: string;
}

export interface Task {
  id: number;
  content: string;
  projectId: number | null;
  estPomos: number;
  actPomos: number;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  createdAt: string | Date;
  projectName?: string;
  projectColor?: string;
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  activeTaskId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  addTask: (task: { content: string; projectId?: number; priority: "low" | "medium" | "high"; estPomos: number }) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  restoreTask: (task: Task) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  setActiveTask: (id: number | null) => void;
  incrementActPomos: (id: number) => void;
  
  addProject: (project: { name: string; color?: string }) => Promise<void>;
  syncLocalToCloud: () => Promise<void>;
}

import { persist } from "zustand/middleware";

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [
        { id: -1, name: "Work", color: "#FF6B6B" },
        { id: -2, name: "Study", color: "#66D9CC" },
        { id: -3, name: "Personal", color: "#A2C9FF" },
      ],
      activeTaskId: null,
      isLoading: false,
      error: null,

      fetchTasks: async () => {
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          set({ isLoading: true });
          const { getAuthedApi } = await import("@/lib/api");
          const authedApi = getAuthedApi();
          const { data, error } = await authedApi.api.tasks.get();
          if (error) throw new Error("Failed to fetch tasks");
          const taskList = (data as Task[]) || [];

          // Auto-migrate orphaned tasks to the first project
          const { projects } = get();
          if (projects.length > 0) {
            const firstProjectId = projects[0].id;
            const orphans = taskList.filter((t) => !t.projectId);
            for (const orphan of orphans) {
              orphan.projectId = firstProjectId;
              try {
                await authedApi.api.tasks[orphan.id.toString()].patch({ projectId: firstProjectId });
              } catch {}
            }
          }

          set({ tasks: taskList });
        } catch (err) {
          const message = err instanceof Error ? err.message : "An unknown error occurred";
          // Don't set error on 401s during initial load
          if (message !== "Unauthorized") {
            set({ error: message });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProjects: async () => {
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          const authedApi = getAuthedApi();
          const { data, error } = await authedApi.api.tasks.projects.get();
          if (error) throw new Error("Failed to fetch projects");
          const projectList = (data as Project[]) || [];
          
          // Self-healing: create default projects if they are missing
          const defaultNames = ["Work", "Study", "Personal"];
          const existingNames = projectList.map((p) => p.name);
          const missingDefaults = defaultNames.filter(name => !existingNames.includes(name));

          if (missingDefaults.length > 0) {
            const defaultProjs = [
              { name: "Work", color: "#FF6B6B" },
              { name: "Study", color: "#66D9CC" },
              { name: "Personal", color: "#A2C9FF" },
            ];
            
            for (const name of missingDefaults) {
              const p = defaultProjs.find(dp => dp.name === name);
              if (p) {
                await authedApi.api.tasks.projects.post(p);
              }
            }
            
            // Re-fetch after creation to get official IDs
            const { data: refreshed } = await authedApi.api.tasks.projects.get();
            if (refreshed) {
              set({ projects: refreshed as Project[] });
            }
          } else {
            set({ projects: projectList });
          }
        } catch (err) {
          console.error(err);
        }
      },

      addTask: async (taskData) => {
        try {
          const { getAuthedApi } = await import("@/lib/api");
          const token = (() => {
            try {
              const raw = localStorage.getItem("pulp-auth");
              if (!raw) return null;
              return JSON.parse(raw)?.state?.token ?? null;
            } catch { return null; }
          })();

          if (!token) {
            // Guest Mode: Add task locally only
            const newTask: Task = {
              id: Math.floor(Math.random() * -1000000) - 1, // Ensure negative ID for local
              content: taskData.content,
              projectId: taskData.projectId || -1, // default to local Work
              estPomos: taskData.estPomos,
              actPomos: 0,
              priority: taskData.priority,
              isCompleted: false,
              createdAt: new Date().toISOString(),
            };
            set((state: TaskState) => ({ tasks: [newTask, ...state.tasks] }));
            return;
          }

          const authedApi = getAuthedApi();
          const { data } = await authedApi.api.tasks.post({
            ...taskData,
            projectId: taskData.projectId && taskData.projectId > 0 ? taskData.projectId : undefined
          });
          if (data) {
            await get().fetchTasks();
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to add task";
          set({ error: message });
          throw err;
        }
      },

      updateTask: async (id, updates) => {
        const previousTasks = get().tasks;
        set((state: TaskState) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));

        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;
          // Do not sync negatively ID'ed tasks to cloud on update
          if (id < 0) return;

          const { getAuthedApi } = await import("@/lib/api");
          const authedApi = getAuthedApi();
          
          // Filter updates to only include allowed fields for the backend
          const allowedFields = ["content", "projectId", "priority", "estPomos", "actPomos", "isCompleted"];
          const filteredUpdates = Object.keys(updates)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
              // Convert null to undefined for backend compatibility (e.g. projectId)
              // @ts-expect-error - dynamic key
              const val = updates[key];
              // @ts-expect-error - dynamic key
              obj[key] = val === null ? undefined : val;
              return obj;
            }, {});

          const { data } = await authedApi.api.tasks[id.toString()].patch(filteredUpdates);

          // Capture newly unlocked badges (e.g., Clean Sweep, The Organizer)
          const d = data as { newlyUnlocked?: { id: string }[] };
          if (d?.newlyUnlocked && d.newlyUnlocked.length > 0) {
            const { useStatsStore } = await import("./stats-store");
            useStatsStore.setState((state) => ({
              newlyUnlockedBadges: [...state.newlyUnlockedBadges, ...d.newlyUnlocked!.map((b) => b.id)],
              unlockedBadges: [...new Set([...state.unlockedBadges, ...d.newlyUnlocked!.map((b) => b.id)])]
            }));
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to update task";
          set({ tasks: previousTasks, error: message });
          throw err;
        }
      },

      deleteTask: async (id) => {
        const previousTasks = get().tasks;
        set((state: TaskState) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        }));

        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;
          // Local only delete
          if (id < 0) return;

          const { getAuthedApi } = await import("@/lib/api");
          const authedApi = getAuthedApi();
          await authedApi.api.tasks[id.toString()].delete();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to delete task";
          set({ tasks: previousTasks, error: message });
          throw err;
        }
      },

      restoreTask: async (task: Task) => {
        try {
          const { getAuthedApi } = await import("@/lib/api");
          const token = (() => {
            try {
              const raw = localStorage.getItem("pulp-auth");
              if (!raw) return null;
              return JSON.parse(raw)?.state?.token ?? null;
            } catch { return null; }
          })();

          if (!token) {
            set((state: TaskState) => ({ tasks: [task, ...state.tasks] }));
            return;
          }

          const authedApi = getAuthedApi();
          // We use addTask logic but with original data
          const { data } = await authedApi.api.tasks.post({
            content: task.content,
            projectId: task.projectId && task.projectId > 0 ? task.projectId : undefined,
            priority: task.priority,
            estPomos: task.estPomos,
          });
          if (data) await get().fetchTasks();
        } catch (err) {
          console.error(err);
        }
      },

      toggleComplete: async (id: number) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        await get().updateTask(id, { isCompleted: !task.isCompleted });
      },

      setActiveTask: (id: number | null) => set({ activeTaskId: id }),

      incrementActPomos: (id: number) =>
        set((state: TaskState) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, actPomos: t.actPomos + 1 } : t
          ),
        })),

      addProject: async (projectData) => {
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) {
            const newProject: Project = {
              id: Math.floor(Math.random() * -1000) - 100, // Negative ID
              name: projectData.name,
              color: projectData.color || "#FFFFFF",
            };
            set((state: TaskState) => ({ projects: [...state.projects, newProject] }));
            return;
          }
          const token = JSON.parse(raw)?.state?.token;
          if (!token) {
            const newProject: Project = {
              id: Math.floor(Math.random() * -1000) - 100,
              name: projectData.name,
              color: projectData.color || "#FFFFFF",
            };
            set((state: TaskState) => ({ projects: [...state.projects, newProject] }));
            return;
          }

          const { getAuthedApi } = await import("@/lib/api");
          const authedApi = getAuthedApi();
          const { error } = await authedApi.api.tasks.projects.post(projectData);
          if (error) throw new Error("Failed to create project");
          await get().fetchProjects();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to create project";
          set({ error: message });
        }
      },

      syncLocalToCloud: async () => {
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return;

          const { getAuthedApi } = await import("@/lib/api");
          const authedApi = getAuthedApi();
          
          const currentState = get();
          const localProjects = currentState.projects.filter(p => p.id < 0);
          const localTasks = currentState.tasks.filter(t => t.id < 0);

          if (localProjects.length === 0 && localTasks.length === 0) {
            // Nothing to migrate, just fetch cloud
            await currentState.fetchProjects();
            await currentState.fetchTasks();
            return;
          }


          // 1. Migrate Projects and build ID swap map
          const projectIdMap: Record<number, number> = {};
          
          for (const lp of localProjects) {
            const { data, error } = await authedApi.api.tasks.projects.post({ name: lp.name, color: lp.color });
            if (!error && data && (data as { id: number }).id) {
              projectIdMap[lp.id] = (data as { id: number }).id;
            }
          }

          // 2. Fetch fresh projects to get the default cloud projects just in case
          await currentState.fetchProjects();
          const freshProjects = get().projects;
          const firstCloudProjectId = freshProjects.find(p => p.id > 0)?.id;

          // 3. Migrate Tasks
          for (const lt of localTasks) {
            // Swap Project ID or fallback to first available cloud project
            let newProjectId = lt.projectId ? projectIdMap[lt.projectId] : undefined;
            if (!newProjectId && lt.projectId && lt.projectId > 0) newProjectId = lt.projectId; // was already a cloud ID
            if (!newProjectId && firstCloudProjectId) newProjectId = firstCloudProjectId; // fallback

            await authedApi.api.tasks.post({
              content: lt.content,
              projectId: newProjectId,
              priority: lt.priority,
              estPomos: lt.estPomos
            });
            // Note: actPomos and isCompleted are not in the POST schema currently (based on earlier implementation),
            // but this is fine for basic guest tasks. If they had progress, we can update it immediately:
            // The post returns the new task ID we could use to patch progress, but for 'Smart Merge' of guests, basic is fine.
          }

          // 4. Wipe local guest data, then fetch clean official state
          localStorage.removeItem("pulp-tasks");
          localStorage.removeItem("pulp-stats");
          localStorage.removeItem("pulp-settings");
          localStorage.removeItem("pulp-timer");
          
          await currentState.fetchTasks();
          await currentState.fetchProjects(); // One final sync to ensure mapped IDs are saved locally
          
        } catch (err) {
          console.error("Migration failed:", err);
        }
      }
    }),
    {
      name: "pulp-tasks"
    }
  )
);
