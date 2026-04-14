"use client";

import { useStatsStore } from "@/store/stats-store";
import { cn } from "@/lib/utils";
import { getLocalDateKey } from "@/lib/date-utils";

export function ActivityHeatmap() {
  const { dailyHistory, isUpdating } = useStatsStore();

  // Generate last 13 weeks (about 3 months / 91 days) for the heatmap
  const weeks = 13;
  const daysInHeatmap = weeks * 7;
  const heatmapData = Array.from({ length: daysInHeatmap }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysInHeatmap - 1 - i));
    const key = getLocalDateKey(d);
    return {
      minutes: dailyHistory[key] || 0,
      date: key,
    };
  });

  const maxMinutes = Math.max(...Object.values(dailyHistory), 1);

  return (
    <div className={cn(
      "bg-pf-surface-container-low p-8 rounded-2xl border border-white/5 mb-12 overflow-hidden transition-all duration-700",
      isUpdating ? "opacity-30 blur-[4px]" : "opacity-100 blur-0"
    )}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-headline text-lg font-black text-pf-on-surface">Focus Activity</h3>
          <p className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 mt-1">
            Focus Intensity Over Time
          </p>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-label uppercase tracking-widest text-pf-on-surface-variant/40">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-pf-surface-container-highest" />
            <div className="w-2 h-2 rounded-sm bg-pf-primary/20" />
            <div className="w-2 h-2 rounded-sm bg-pf-primary/40" />
            <div className="w-2 h-2 rounded-sm bg-pf-primary/70" />
            <div className="w-2 h-2 rounded-sm bg-pf-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-max">
          {heatmapData.map((day, i) => {
            const intensity = day.minutes > 0 ? Math.min(Math.ceil((day.minutes / maxMinutes) * 4), 4) : 0;
            
            return (
              <div
                key={i}
                title={`${day.date}: ${day.minutes}m`}
                className={cn(
                  "w-3 h-3 rounded-[2px] transition-all hover:scale-125 hover:z-10 cursor-pointer",
                  intensity === 0 && "bg-pf-surface-container-highest opacity-30",
                  intensity === 1 && "bg-pf-primary/20",
                  intensity === 2 && "bg-pf-primary/40",
                  intensity === 3 && "bg-pf-primary/70",
                  intensity === 4 && "bg-pf-primary shadow-[0_0_8px_rgba(255,180,170,0.3)]"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
