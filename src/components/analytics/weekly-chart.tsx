"use client";

import { useStatsStore } from "@/store/stats-store";
import { useTimerStore } from "@/store/timer-store";
import { cn } from "@/lib/utils";

export function WeeklyChart() {
  const { dailyHistory, isUpdating } = useStatsStore();
  const { mode } = useTimerStore();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return {
      day: days[d.getDay()],
      minutes: dailyHistory[key] || 0,
      date: key,
    };
  });

  const maxMinutes = Math.max(...last7Days.map((d) => d.minutes), 1);

  return (
    <div className={cn(
      "bg-pf-surface-container-low p-8 rounded-2xl border border-white/5 mb-12 transition-all duration-700",
      isUpdating ? "opacity-30 blur-[4px]" : "opacity-100 blur-0"
    )}>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="font-headline text-lg font-black text-pf-on-surface">Weekly Progress</h3>
          <p className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 mt-1">
            Focus Minutes Per Day
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2h-2 h-2 rounded-full transition-colors duration-500",
              mode === "focus" ? "bg-pf-primary" : "bg-pf-tertiary"
            )} />
            <span className="text-[8px] uppercase tracking-widest text-pf-on-surface-variant">Focus</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between h-48 gap-2 px-4">
        {last7Days.map((day, i) => {
          const heightPercent = (day.minutes / maxMinutes) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-pf-surface-container-highest px-2 py-1 rounded text-[10px] whitespace-nowrap z-10 border border-white/10 pointer-events-none">
                {day.minutes}m focus
              </div>

              {/* Bar Container */}
              <div className="w-full max-w-[12px] h-40 flex items-end">
                <div 
                  className={cn(
                    "w-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,180,170,0.1)] hover:shadow-[0_0_20px_rgba(255,180,170,0.3)]",
                    mode === "focus" ? "bg-pf-primary" : "bg-pf-tertiary",
                    day.minutes === maxMinutes ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                  )}
                  style={{ 
                    height: `${heightPercent}%`,
                    animation: `grow-up 1s ease-out forwards ${i * 100}ms`
                  }}
                />
              </div>
              
              <span className="mt-6 text-[9px] font-label font-bold uppercase tracking-widest text-pf-on-surface-variant/40 group-hover:text-pf-on-surface-variant transition-colors">
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
