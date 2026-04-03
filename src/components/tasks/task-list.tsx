"use client";

import { useTaskStore } from "@/store/task-store";
import { TaskCard } from "./task-card";
import { cn } from "@/lib/utils";
import { ClipboardList, ArrowUp } from "lucide-react";

export function TaskList() {
  const { tasks, projects } = useTaskStore();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="relative mb-8">
          <ClipboardList className="w-24 h-24 text-pf-primary opacity-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-pf-primary/5 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
        <h3 className="font-headline text-2xl font-bold text-pf-on-surface mb-2 px-4 max-w-md">
          Your focus journey starts here.
        </h3>
        <p className="text-pf-on-surface-variant/60 font-label uppercase tracking-widest text-[10px] mb-8">
          What's the one thing you want to achieve today?
        </p>
        <div className="flex flex-col items-center gap-2 animate-bounce opacity-40">
          <ArrowUp className="w-5 h-5 text-pf-primary" />
          <span className="text-[8px] uppercase tracking-[0.3em] font-bold">Create Task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {projects.map((project) => {
        const projectTasks = tasks.filter((t) => t.projectId === project.id);
        const activeTasks = projectTasks.filter((t) => !t.isCompleted);
        const completedTasks = projectTasks.filter((t) => t.isCompleted);

        if (projectTasks.length === 0) return null;

        return (
          <section key={project.id}>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h2 className="text-xs uppercase tracking-[0.2em] font-black text-pf-on-surface-variant font-headline">
                {project.name}
              </h2>
              <span className="text-[10px] text-pf-outline px-2 py-0.5 rounded border border-pf-outline/20">
                {activeTasks.length > 0 ? `${activeTasks.length} TASKS` : "DONE"}
              </span>
            </div>

            <div className="space-y-4">
              {/* Active Tasks First */}
              {activeTasks.map((task) => (
                <TaskCard key={task.id} task={task} project={project} />
              ))}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div className="space-y-4 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} project={project} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
