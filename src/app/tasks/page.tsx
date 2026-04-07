"use client";

import { useState, useEffect } from "react";
import { CreateTask } from "@/components/tasks/create-task";
import { TaskList } from "@/components/tasks/task-list";
import { ContextualFab } from "@/components/tasks/contextual-fab";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

export default function TasksPage() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return (
    <div className="min-h-screen flex items-center justify-center text-pf-on-surface/50 font-label tracking-widest text-sm uppercase">
      Loading Tasks...
    </div>
  );

  return (
    <div className="relative p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-6xl font-headline font-black tracking-tighter text-pf-on-surface">
            Tasks
          </h1>
          <p className="text-[10px] font-label uppercase tracking-[0.4em] text-pf-on-surface-variant/40">
            Precision Management &bull; Essential Flow
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
