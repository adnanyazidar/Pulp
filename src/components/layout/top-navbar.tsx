"use client";

import { BarChart3, User } from "lucide-react";

export function TopNavbar() {
  return (
    <header className="md:hidden sticky top-0 w-full bg-pf-surface px-6 py-4 flex justify-between items-center z-50">
      <h1 className="text-2xl font-bold tracking-tighter text-pf-primary font-headline">
        PomoFocus
      </h1>
      <div className="flex gap-4">
        <BarChart3 className="w-6 h-6 text-pf-primary transition-theme" />
        <User className="w-6 h-6 text-pf-primary transition-theme" />
      </div>
    </header>
  );
}
