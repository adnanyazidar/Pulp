"use client";

import { useStatsStore } from "@/store/stats-store";
import { Globe, ArrowUpRight, Award } from "lucide-react";

export function CommunityRankCard() {
  const { totalTasksCompleted, currentStreak } = useStatsStore();

  // Simple rank calculation mock based on activity
  const baseRank = 452;
  const currentRank = Math.max(1, baseRank - (currentStreak * 5) - totalTasksCompleted);

  return (
    <div className="space-y-6">
      <h4 className="font-headline text-2xl font-bold text-pf-on-surface flex items-center gap-3">
        <Globe className="text-pf-primary/80" size={24} />
        Community Rank
      </h4>
      
      <div className="bg-pf-surface-container-low/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
          <Award size={150} />
        </div>
        
        <div className="space-y-1 relative z-10">
          <p className="text-[10px] text-pf-on-surface-variant font-bold uppercase tracking-[0.2em] opacity-60">
            Global Position
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-pf-on-surface tracking-tighter">
              #{currentRank}
            </span>
            <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <ArrowUpRight size={14} />
              12
            </span>
          </div>
          
          <p className="text-[11px] text-pf-on-surface-variant opacity-60 font-medium">
            You are in the top 5% of focusers worldwide this week.
          </p>
        </div>
      </div>
    </div>
  );
}
