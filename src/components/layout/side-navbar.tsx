"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Timer,
  ListTodo,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Timer", icon: Timer },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideNavbar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex h-screen w-64 fixed left-0 bg-pf-surface border-r border-white/5 flex-col py-8 z-50">
      {/* Logo */}
      <div className="px-8 mb-12">
        <h1 className="text-xl font-extrabold text-pf-primary font-headline tracking-tighter">
          PomoFocus
        </h1>
        <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant/60 mt-1">
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
              className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
                isActive
                  ? "bg-pf-primary-container/10 text-pf-primary border-r-4 border-pf-primary"
                  : "text-pf-on-surface-variant/40 hover:bg-white/5 hover:text-pf-on-surface hover:translate-x-1"
              }`}
            >
              <Icon className="w-5 h-5 transition-theme" />
              <span className="font-label uppercase tracking-[0.2em] text-[10px] transition-theme">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
