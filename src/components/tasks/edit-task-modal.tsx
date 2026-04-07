"use client";

import { useState, useEffect, useRef } from "react";
import { useTaskStore, Task, Project } from "@/store/task-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Folder, Hash, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskModal({ task, isOpen, onOpenChange }: EditTaskModalProps) {
  const { updateTask, projects } = useTaskStore();
  const [content, setContent] = useState(task.content);
  const [projectId, setProjectId] = useState<number | undefined>(task.projectId || undefined);
  const [estPomos, setEstPomos] = useState(task.estPomos);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus title on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // Reset state to current task just in case
      setContent(task.content);
      setProjectId(task.projectId || undefined);
      setEstPomos(task.estPomos);
      setPriority(task.priority);
    }
  }, [isOpen, task]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;

    try {
      const updates = {
        content,
        projectId,
        estPomos,
        priority,
      };

      // Optimistic update handled inside updateTask
      await updateTask(task.id, updates);
      toast.success("Task updated!");
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Refine your focus mission</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 border-none rounded-2xl p-4 text-xl font-headline placeholder:text-pf-on-surface-variant/20 text-pf-on-surface focus:ring-2 focus:ring-pf-primary/30 outline-none transition-all"
              placeholder="What are you working on?"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Project Selector */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-pf-on-surface-variant border border-white/5">
              <Folder size={14} className="text-pf-primary" />
              <select
                value={projectId || ""}
                onChange={(e) => setProjectId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="bg-transparent border-none focus:ring-0 text-[11px] uppercase tracking-widest font-black cursor-pointer outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-pf-surface-container-highest text-pf-on-surface">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pomo Estimation */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-pf-on-surface-variant border border-white/5">
              <Hash size={14} className="text-pf-primary" />
              <span className="text-[11px] uppercase tracking-widest font-black">Pomos:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={estPomos}
                onChange={(e) => setEstPomos(parseInt(e.target.value) || 1)}
                className="w-10 bg-transparent border-none focus:ring-0 text-sm font-black text-center text-pf-on-surface outline-none"
              />
            </div>
          </div>

          {/* Priority Selector */}
          <div className="flex items-center gap-2 pt-2">
            {(["low", "medium", "high"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black transition-all border",
                  priority === p
                    ? "bg-pf-primary text-pf-surface border-pf-primary shadow-[0_5px_15px_rgba(255,107,107,0.3)]"
                    : "bg-white/5 text-pf-on-surface-variant/40 border-white/5 hover:bg-white/10"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-pf-primary text-pf-surface py-4 rounded-2xl font-label font-black uppercase tracking-[0.3em] hover:shadow-[0_10px_30px_rgba(255,107,107,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
