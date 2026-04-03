"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Timer,
  ListTodo,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Timer", icon: Timer },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideNavbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex h-screen w-64 fixed left-0 bg-background border-r border-white/5 flex-col py-8 z-50">
      {/* Logo */}
      <div className="px-8 mb-12">
        <h1 className="text-xl font-black text-pf-primary font-headline tracking-tighter uppercase text-[10px] tracking-[0.4em]">
          PomoFocus
        </h1>
        <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant/40 mt-1">
          Stay in flow
        </p>
      </div>

      {/* Nav Items */}
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 transition-all duration-200",
                isActive
                  ? "bg-pf-primary/5 text-pf-primary border-r-4 border-pf-primary translate-x-1"
                  : "text-pf-on-surface-variant/40 hover:bg-white/5 hover:text-pf-on-surface hover:translate-x-1"
              )}
            >
              <Icon size={18} className="transition-theme" />
              <span className="font-label uppercase tracking-[0.3em] text-[9px] font-bold transition-theme">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Version Tag */}
      <div className="px-8 mt-auto pt-8">
        <span className="text-[8px] font-label uppercase tracking-[0.4em] text-pf-on-surface-variant/20 block">
          v1.4.2 PREMIUM
        </span>
      </div>
    </nav>
  );
}
