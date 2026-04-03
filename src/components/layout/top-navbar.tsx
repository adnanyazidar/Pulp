"use client";

import { usePathname } from "next/navigation";
import { Settings, User, Menu } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

export function TopNavbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="sticky top-0 w-full bg-pf-surface/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 z-40">
      <div className="flex h-16 items-center justify-between gap-6">
        {/* 🍔 Mobile Hamburger (Left Side) */}
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-pf-on-surface-variant/60 hover:text-pf-primary transition-colors md:hidden cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center justify-end gap-6 flex-1">
        {/* Settings Icon */}
        <Link
          href="/settings"
          className={cn(
            "relative p-2 transition-colors group",
            pathname === "/settings" ? "text-pf-primary" : "text-pf-on-surface-variant/40 hover:text-pf-on-surface"
          )}
        >
          <Settings size={22} className="transition-transform group-active:scale-90" />
          
          {pathname === "/settings" && (
            <motion.div
              layoutId="topNavUnderline"
              className="absolute -bottom-[23px] left-0 right-0 h-0.5 bg-pf-primary"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Link>

        {/* Profile/User Icon */}
        <Link
          href="/profile"
          className={cn(
            "relative p-2 transition-colors group",
            pathname === "/profile" ? "text-pf-primary" : "text-pf-on-surface-variant/40 hover:text-pf-on-surface"
          )}
        >
          <User size={22} className="transition-transform group-active:scale-90" />
          
          {pathname === "/profile" && (
            <motion.div
              layoutId="topNavUnderline"
              className="absolute -bottom-[23px] left-0 right-0 h-0.5 bg-pf-primary"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Link>
      </div>
    </div>
  </header>
);
}
