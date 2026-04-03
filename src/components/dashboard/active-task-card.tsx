"use client";

import { Edit3, CheckCircle2 } from "lucide-react";

export function ActiveTaskCard() {
  return (
    <div className="bg-pf-primary/5 border border-pf-primary/20 p-8 rounded-2xl flex flex-col justify-between min-h-[200px] relative overflow-hidden group hover:bg-pf-primary/[0.08] transition-all duration-300">
      {/* Decorative Icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Edit3 className="w-24 h-24 transition-theme" />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-pf-primary animate-pulse transition-theme" />
          <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-primary font-bold transition-theme">
            Active Task
          </p>
        </div>
        <h3 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-pf-on-surface mb-2">
          Drafting PRD
        </h3>
        <p className="text-pf-on-surface-variant/60 text-sm">
          Main focus for this session
        </p>
      </div>

      <div className="flex items-center gap-2 text-pf-primary pt-4 border-t border-pf-primary/10 transition-theme">
        <CheckCircle2 className="w-4 h-4 transition-theme" />
        <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold transition-theme">
          Session In Progress
        </span>
      </div>
    </div>
  );
}
