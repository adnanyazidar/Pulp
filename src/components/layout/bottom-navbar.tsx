"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, ListTodo, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", label: "Focus", icon: Timer },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-pf-surface-container-low px-6 py-4 flex justify-around items-center z-50 border-t border-white/5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-theme ${
              isActive ? "text-pf-primary" : "text-pf-on-surface-variant"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-label uppercase tracking-[0.2em]">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
