"use client";

import { SideNavbar } from "@/components/layout/side-navbar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { BackgroundAtmosphere } from "@/components/layout/background-atmosphere";
import { ListTodo } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="min-h-screen">
      <SideNavbar />
      <TopNavbar />
      <BackgroundAtmosphere />
      <main className="md:ml-64 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ListTodo className="w-16 h-16 text-pf-primary mb-6 opacity-20" />
        <h2 className="text-3xl font-headline font-extrabold text-pf-on-surface mb-2">
          Tasks
        </h2>
        <p className="text-pf-on-surface-variant/60 font-label uppercase tracking-[0.2em] text-xs">
          Coming Soon
        </p>
      </main>
      <BottomNavbar />
    </div>
  );
}
