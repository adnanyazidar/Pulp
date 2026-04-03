"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTimerStore } from "@/store/timer-store";

export function StatsFooter() {
  const { sessionCount, totalFocusToday } = useTimerStore();

  const hours = Math.floor(totalFocusToday / 3600);
  const minutes = Math.floor((totalFocusToday % 3600) / 60);

  return (
    <div className="mt-16 w-full max-w-4xl bg-pf-surface-container-lowest p-8 rounded-2xl border border-white/5 flex flex-wrap justify-around items-center gap-8">
      <div className="text-center group hover:scale-[1.02] transition-all duration-300 cursor-default">
        <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant mb-1">
          Current Session
        </p>
        <p className="font-headline font-bold text-2xl group-hover:text-pf-primary transition-colors">
          #{sessionCount}
        </p>
      </div>

      <div className="h-8 w-px bg-white/[0.03] hidden md:block" />

      <div className="text-center group hover:scale-[1.02] transition-all duration-300 cursor-default">
        <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant mb-1">
          Today's Total
        </p>
        <p className="font-headline font-bold text-2xl group-hover:text-pf-primary transition-colors">
          {hours > 0 ? `${hours}h ` : ""}
          {minutes}m
        </p>
      </div>

      <div className="h-8 w-px bg-white/[0.03] hidden md:block" />

      <div className="text-center">
        <Link
          href="/analytics"
          className="flex items-center gap-2 group opacity-40 hover:opacity-100 hover:scale-[1.02] transition-all duration-300 transition-theme"
        >
          <span className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant group-hover:text-pf-primary transition-theme">
            Full Reports
          </span>
          <ArrowRight className="w-3 h-3 text-pf-on-surface-variant group-hover:text-pf-primary transition-theme" />
        </Link>
      </div>
    </div>
  );
}
