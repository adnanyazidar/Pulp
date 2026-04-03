"use client";

import { CreateTask } from "@/components/tasks/create-task";
import { TaskList } from "@/components/tasks/task-list";
import { ContextualFab } from "@/components/tasks/contextual-fab";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

export default function TasksPage() {
  return (
    <div className="relative p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-6xl font-headline font-black tracking-tighter text-pf-on-surface">
            Tasks
          </h1>
          <p className="text-[10px] font-label uppercase tracking-[0.4em] text-pf-on-surface-variant/40">
            Precision Management • Essential Flow
          </p>
        </header>

        <div className="space-y-8">
          <CreateTask />
          <TaskList />
        </div>
      </div>

      <ContextualFab />
      <BottomNavbar />
    </div>
  );
}
