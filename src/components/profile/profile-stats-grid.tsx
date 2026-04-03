"use client";

import { useEffect, useState } from "react";
import { useStatsStore } from "@/store/stats-store";
import { Clock, TrendingUp } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function ProfileStatsGrid() {
  const { dailyHistory, currentStreak, level, xp } = useStatsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate total focus time in hours
  const totalMinutes = Object.values(dailyHistory).reduce((sum, min) => sum + min, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // XP calculation
  const XP_PER_LEVEL = 1000;
  const xpPercentage = (xp / XP_PER_LEVEL) * 100;

  if (!mounted) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Large Card: Timer Display */}
      <div className="md:col-span-2 bg-pf-surface-container-low/60 backdrop-blur-md rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group border border-white/5 shadow-2xl shadow-black/20">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000">
          <Clock size={120} />
        </div>
        
        <div>
          <span className="text-pf-on-surface-variant font-label text-[10px] uppercase tracking-[0.3em] font-bold">
            Total Focus Time
          </span>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-headline text-6xl md:text-7xl font-bold text-pf-primary tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
              <AnimatedNumber value={totalHours} />
            </span>
            <span className="text-pf-on-surface-variant font-headline text-2xl font-bold opacity-60">
              Hours
            </span>
          </div>
        </div>
        
        <p className="text-[11px] font-bold text-pf-on-surface-variant mt-8 flex items-center gap-1.5 uppercase tracking-widest">
          <TrendingUp size={16} className="text-[#66d9cc]" />
          Top 5% of focusers this month
        </p>
      </div>

      {/* Medium Card: Streak */}
      <div className="bg-pf-surface-container-low/60 backdrop-blur-md rounded-2xl p-8 flex flex-col justify-between border border-white/5 shadow-xl shadow-black/20">
        <div>
          <span className="text-pf-on-surface-variant font-label text-[10px] uppercase tracking-[0.3em] font-bold">
            Current Streak
          </span>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-headline text-6xl font-bold text-[#66d9cc] tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
              <AnimatedNumber value={currentStreak} />
            </span>
            <span className="text-pf-on-surface-variant font-headline text-xl font-bold opacity-60">
              Days
            </span>
          </div>
        </div>
        
        <div className="flex gap-1.5 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full ${i < Math.min(currentStreak, 4) ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-white/5 opacity-50'}`}
            />
          ))}
        </div>
      </div>

      {/* Medium Card: Level  */}
      <div className="bg-pf-surface-container-low/60 backdrop-blur-md rounded-2xl p-8 flex flex-col justify-between border border-white/5 shadow-xl shadow-black/20">
        <div>
          <span className="text-pf-on-surface-variant font-label text-[10px] uppercase tracking-[0.3em] font-bold">
            User Level
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-headline text-4xl lg:text-[40px] xl:text-5xl font-black text-[#a2c9ff] tracking-[-0.05em] uppercase whitespace-nowrap">
              {level >= 10 ? "Elite" : level >= 5 ? "Pro" : "Rookie"}
            </span>
            <span className="font-headline text-xl font-bold text-pf-on-surface-variant opacity-60">
              {level}
            </span>
          </div>
        </div>
        
        <div className="mt-8 space-y-3">
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 1.5, delay: 0.2 }}
            />
          </div>
          <p className="text-[9px] text-right text-pf-on-surface-variant font-black uppercase tracking-[0.2em] opacity-60">
            {Math.floor(xp)}/1000 XP TO LV {level + 1}
          </p>
        </div>
      </div>
    </section>
  );
}
