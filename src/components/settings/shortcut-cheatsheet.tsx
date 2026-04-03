"use client";

import { cn } from "@/lib/utils";

export function ShortcutCheatsheet() {
  const shortcuts = [
    { key: "Space", action: "Start / Pause Timer" },
    { key: "R", action: "Reset Timer" },
    { key: "S", action: "Skip Session" },
    { key: "N", action: "Next Mode" },
    { key: "T", action: "Add new Task" },
    { key: "A", action: "Go to Analytics" },
  ];

  return (
    <div className="bg-pf-surface-container-low p-8 rounded-2xl border border-white/5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
        {shortcuts.map((s, i) => (
          <div key={i} className="flex items-center justify-between group transition-all">
            <span className="text-[11px] font-label font-medium text-pf-on-surface-variant/40 group-hover:text-pf-on-surface-variant/60">
              {s.action}
            </span>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-pf-surface-dim border border-white/5 rounded-md text-[10px] font-headline font-bold text-pf-on-surface/60 group-hover:text-pf-primary group-hover:border-pf-primary/20 transition-all shadow-sm">
                {s.key}
              </kbd>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
