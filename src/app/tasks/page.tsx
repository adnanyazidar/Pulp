"use client";

import { SideNavbar } from "@/components/layout/side-navbar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { BackgroundAtmosphere } from "@/components/layout/background-atmosphere";
import { CreateTask } from "@/components/tasks/create-task";
import { TaskList } from "@/components/tasks/task-list";
import { ContextualFab } from "@/components/tasks/contextual-fab";

export default function TasksPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <SideNavbar />
      <BackgroundAtmosphere />
      
      <main className="md:ml-64 flex-1 min-h-screen bg-pf-background">
        <TopNavbar />
        
        <div className="max-w-4xl mx-auto px-6 py-8">
          <CreateTask />
          <TaskList />
        </div>
      </main>

      <ContextualFab />
      <BottomNavbar />
    </div>
  );
}
