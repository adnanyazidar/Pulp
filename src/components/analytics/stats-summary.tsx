"use client";

import { useStatsStore } from "@/store/stats-store";
import { useTaskStore } from "@/store/task-store";
import { Zap, Target, Flame, TrendingUp, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsSummary() {
  const { dailyHistory, totalTasksCompleted, currentStreak, weeklySessionsCount, isUpdating } = useStatsStore();
  const { tasks } = useTaskStore();
  
  const today = new Date().toISOString().split("T")[0];
  const minutesToday = dailyHistory[today] || 0;
  const showHours = minutesToday >= 60;
  const displayTime = showHours ? (minutesToday / 60).toFixed(1) : minutesToday;
  const timeUnit = showHours ? "HOURS" : "MIN";

  // Calculate Avg. Session (Weekly)
  const totalWeeklyMinutes = Object.values(dailyHistory).slice(0, 7).reduce((a, b) => a + b, 0);
  const avgSessionMinutes = weeklySessionsCount > 0 ? Math.round(totalWeeklyMinutes / weeklySessionsCount) : 0;

  // Calculate Velocity
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const velocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const velocityTrend = velocity === 0 ? "Start Working" : velocity >= 70 ? "Optimal Speed" : "Steady Flow";

  const zapIcon = Target;

  const stats = [
    {
      label: "Today's Focus",
      value: displayTime,
      unit: timeUnit,
      icon: Zap,
      color: "text-pf-primary",
      trend: "+12% from yesterday",
      trendColor: "text-pf-primary",
    },
    {
      label: "Avg. Session",
      value: avgSessionMinutes,
      unit: "MIN",
      icon: Timer,
      color: "text-pf-secondary",
      trend: "Steady flow",
      trendColor: "text-pf-secondary",
    },
    {
      label: "Velocity",
      value: velocity,
      unit: "%",
      icon: TrendingUp,
      color: "text-pf-tertiary",
      trend: velocityTrend,
      trendColor: "text-pf-tertiary",
      showProgress: true,
    },
    {
      label: "Streak",
      value: currentStreak,
      unit: "DAYS",
      icon: Flame,
      color: "text-pf-primary",
      trend: "Personal record",
      trendColor: "text-pf-primary",
    },
    {
      label: "Peak Focus",
      value: "09:42",
      unit: "AM",
      icon: zapIcon,
      color: "text-pf-secondary",
      trend: "Morning Phase",
      trendColor: "text-pf-secondary",
    },
  ];

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12 transition-all duration-700",
      isUpdating ? "opacity-40 scale-[0.99] blur-[2px]" : "opacity-100 scale-100 blur-0"
    )}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-pf-surface-container-low p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-label uppercase tracking-[0.2em] text-pf-on-surface-variant/40">
              {stat.label}
            </span>
            <stat.icon size={14} className={cn("opacity-40", stat.color)} />
          </div>
          
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-headline font-black tracking-tighter text-pf-on-surface">
              {stat.value}
            </span>
            <span className="text-[10px] font-label font-bold text-pf-on-surface-variant/40">
              {stat.unit}
            </span>
          </div>

          {stat.showProgress && (
            <div className="h-1 w-full bg-pf-surface-container-highest rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-pf-tertiary transition-all duration-1000"
                style={{ width: `${stat.value}%` }}
              />
            </div>
          )}

          <p className={cn("text-[9px] font-label uppercase tracking-widest opacity-60", stat.trendColor)}>
            • {stat.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
