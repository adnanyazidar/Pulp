"use client";

import { useStatsStore } from "@/store/stats-store";
import { Medal, Sunrise, BrainCircuit, Shield } from "lucide-react";
import { motion } from "framer-motion";

export function MilestonesBadges() {
  const { unlockedBadges, level } = useStatsStore();

  const badges = [
    { id: "early_bird", name: "Early Bird", icon: Sunrise, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", description: "Reach Level 5" },
    { id: "focus_master", name: "Focus Master", icon: BrainCircuit, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", description: "Reach Level 10" },
    { id: "week_warrior", name: "Warrior", icon: Shield, color: "text-gray-400", bg: "bg-white/5", border: "border-white/10", description: "7 Day Streak" },
  ];

  const nextLevelProgress = (level / 15) * 100; // Mock: target level 15 for Next Badge

  return (
    <div className="space-y-6 mt-8">
      <h4 className="font-headline text-2xl font-bold text-pf-on-surface flex items-center gap-3">
        <Medal className="text-pf-primary/80" size={24} />
        Milestones
      </h4>
      
      <div className="bg-pf-surface-container-low/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            const Icon = badge.icon;
            
            return (
              <div 
                key={badge.id}
                className={`flex flex-col items-center gap-2 group cursor-help transition-all duration-500 ${!isUnlocked ? "opacity-40 grayscale" : ""}`}
                title={badge.description}
              >
                <div className={`w-14 h-14 rounded-full ${isUnlocked ? badge.bg : "bg-white/5"} flex items-center justify-center border ${isUnlocked ? badge.border : "border-white/10"} transition-transform group-hover:scale-110`}>
                  <Icon size={28} className={isUnlocked ? badge.color : "text-gray-400"} />
                </div>
                <span className={`text-[9px] text-center font-bold uppercase tracking-tight ${isUnlocked ? "text-pf-on-surface" : "text-pf-on-surface-variant"}`}>
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-pf-on-surface-variant font-bold uppercase tracking-wider">
              Next: Centurion Badge
            </span>
            <span className="text-[10px] font-black text-pf-primary">
              {Math.min(100, Math.floor(nextLevelProgress))}%
            </span>
          </div>
          
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="bg-gradient-to-r from-pf-primary to-[#ff5446] h-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, nextLevelProgress)}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
          
          <p className="text-[9px] text-center text-pf-on-surface-variant font-medium opacity-50">
            Reach Level 15 for Centurion Badge
          </p>
        </div>
      </div>
    </div>
  );
}
