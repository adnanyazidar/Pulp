"use client";

import React from "react";
import { SideNavbar } from "@/components/layout/side-navbar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { BackgroundAtmosphere } from "@/components/layout/background-atmosphere";
import { useUIStore } from "@/store/ui-store";
import { AnimatePresence, motion } from "framer-motion";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* 🚀 Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 🧭 Side Navbar (Collapsible) */}
      <SideNavbar />

      {/* 📺 Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 relative overflow-hidden bg-pf-surface-dim">
        <TopNavbar />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <BackgroundAtmosphere />
          <main className="w-full relative z-10 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
