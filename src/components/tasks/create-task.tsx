"use client";

import { useTaskStore, Project } from "@/store/task-store";
import { Plus, Folder, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CreateTask() {
  const { addTask, projects } = useTaskStore();
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [estPomos, setEstPomos] = useState(1);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Sync default project selection when projects load
  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const promise = addTask({
      content,
      projectId,
      estPomos,
      priority,
    });

    toast.promise(promise, {
      loading: "Creating task...",
      success: () => {
        setContent("");
        setEstPomos(1);
        return "Task created!";
      },
      error: "Failed to create task",
    });
  };

  return (
    <section className="mb-12">
      <form
        onSubmit={handleSubmit}
        className="glass p-6 rounded-xl border border-white/10 shadow-2xl space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xl font-headline placeholder:text-pf-on-surface-variant/40 text-pf-on-surface"
              placeholder="What are you working on?"
              type="text"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim()}
            className="bg-pf-primary-container text-pf-on-primary-container p-2 rounded-lg hover:scale-95 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pf-surface-container-highest text-pf-on-surface-variant">
            <Folder size={14} className="opacity-60" />
            <select
              value={projectId || ""}
              onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="bg-transparent border-none focus:ring-0 text-[10px] uppercase tracking-widest font-bold cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-pf-surface-container-highest text-pf-on-surface">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pomo Estimation Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pf-surface-container-highest text-pf-on-surface-variant">
            <Hash size={14} className="opacity-60" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Pomos:</span>
            <input
              type="number"
              min={1}
              max={10}
              value={estPomos}
              onChange={(e) => setEstPomos(parseInt(e.target.value) || 1)}
              className="w-8 bg-transparent border-none focus:ring-0 text-[10px] font-bold text-center"
            />
          </div>

          {/* Priority Selector */}
          <div className="flex items-center gap-1">
            {(["low", "medium", "high"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all",
                  priority === p
                    ? "bg-pf-primary/20 text-pf-primary border border-pf-primary/20"
                    : "bg-pf-surface-container-highest text-pf-on-surface-variant hover:bg-pf-surface-container-high"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}
