"use client";

import { useTaskStore, Task, Project } from "@/store/task-store";
import { Check, Play, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/hooks/use-sound";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { EditTaskModal } from "./edit-task-modal";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";

interface TaskCardProps {
  task: Task;
  project: Project | undefined;
}

export function TaskCard({ task, project }: TaskCardProps) {
  const { toggleComplete, setActiveTask, activeTaskId } = useTaskStore();
  const { playSound } = useSound();
  const isActive = activeTaskId === task.id;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const projectColor = project?.color || "#ffb4aa";

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center justify-between p-6 rounded-xl bg-pf-surface-container-low hover:bg-pf-surface-container-high transition-all border border-transparent hover:border-white/5",
          isActive && "bg-pf-surface-container-high border-white/10 shadow-[0_0_20px_rgba(255,180,170,0.1)]",
          task.isCompleted && "opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
        )}
      >
        <div className="flex items-center gap-6">
          {/* Checkbox */}
          <button
            data-testid="task-complete-btn"
            onClick={() => {
              toggleComplete(task.id);
              if (!task.isCompleted) {
                playSound("click-soft");
              }
            }}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              task.isCompleted
                ? "bg-pf-primary border-pf-primary"
                : "border-pf-primary/40 hover:border-pf-primary"
            )}
          >
            <Check
              className={cn(
                "w-3.5 h-3.5 transition-all",
                task.isCompleted ? "text-pf-on-primary opacity-100" : "text-transparent group-hover:text-pf-primary"
              )}
              strokeWidth={3}
            />
          </button>

          {/* Play Arrow (Hidden by default, shows on hover or if active) */}
          <button
            data-testid="task-activate-btn"
            onClick={() => setActiveTask(isActive ? null : task.id)}
            className={cn(
              "absolute -left-2 transition-all cursor-pointer",
              isActive ? "opacity-100 text-pf-primary scale-110" : "opacity-0 group-hover:opacity-100 text-pf-primary/60 hover:text-pf-primary"
            )}
          >
            <Play size={20} fill="currentColor" />
          </button>

          <div>
            <h3
              className={cn(
                "font-headline font-bold text-pf-on-surface",
                task.isCompleted && "line-through text-pf-on-surface-variant"
              )}
            >
              {task.content}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-pf-on-surface-variant mt-1">
              {task.priority} Priority • {task.estPomos * 25}m
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          {/* Pomo Dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: task.estPomos }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-500",
                  i < task.actPomos
                    ? "bg-pf-primary shadow-[0_0_8px_rgba(255,180,170,0.5)]"
                    : "bg-pf-surface-container-highest"
                )}
              />
            ))}
          </div>
          <span className="text-[9px] uppercase tracking-tighter text-pf-outline">
            {task.isCompleted ? "COMPLETED" : `ESTIMATED: ${task.estPomos} POMOS`}
          </span>
        </div>

        {/* Power Menu (Three-dot Dropdown) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="task-power-menu-btn" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-2 text-pf-on-surface-variant/40 hover:text-pf-primary hover:bg-white/5 rounded-full transition-all">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" className="glass min-w-[140px] border border-white/10 p-1.5 shadow-2xl">
              <DropdownMenuItem
                data-testid="task-edit-menu"
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-3 font-label font-bold text-xs uppercase tracking-widest text-pf-on-surface hover:bg-pf-primary/10 hover:text-pf-primary rounded-lg transition-all focus:bg-pf-primary/10 cursor-pointer"
              >
                <Pencil size={14} />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="task-delete-menu"
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-3 font-label font-bold text-xs uppercase tracking-widest text-pf-primary/60 hover:bg-pf-primary/10 hover:text-pf-primary rounded-lg transition-all focus:bg-pf-primary/10 cursor-pointer"
              >
                <Trash2 size={14} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>

      <EditTaskModal
        task={task}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
      <DeleteConfirmationModal
        task={task}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
