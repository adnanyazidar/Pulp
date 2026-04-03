"use client";

import { usePathname } from "next/navigation";
import { BarChart3, Settings, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const topNavItems = [
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function TopNavbar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname === "/tasks") return "Tasks";
    if (pathname === "/analytics") return "Analytics";
    if (pathname === "/settings") return "Settings";
    return "App";
  };

  return (
    <header className="sticky top-0 w-full bg-background/40 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center z-40 h-16">
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-label uppercase tracking-[0.3em] text-pf-on-surface-variant/40 md:block hidden">
          PomoFocus
        </span>
        <span className="text-pf-on-surface-variant/20 md:block hidden">/</span>
        <h2 className="text-sm font-headline font-bold text-pf-on-surface tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Global Utilities */}
      <div className="flex items-center gap-1 md:gap-4">
        {topNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative p-2 rounded-lg transition-colors group",
                isActive ? "text-pf-primary" : "text-pf-on-surface-variant/40 hover:text-pf-on-surface"
              )}
            >
              <Icon size={20} className="transition-transform group-active:scale-90" />
              
              {isActive && (
                <motion.div
                  layoutId="topNavUnderline"
                  className="absolute -bottom-[23px] left-0 right-0 h-0.5 bg-pf-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
