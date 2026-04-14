"use client";

import { useTaskStore } from "@/store/task-store";
import { Edit3, CheckCircle2, Play, Target, Info, PartyPopper } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TOOLTIPS } from "@/constants/copy";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSound } from "@/lib/hooks/use-sound";

export function ActiveTaskCard() {
  const { tasks, activeTaskId, showCelebration, clearCelebration } = useTaskStore();
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const { playSuccess } = useSound();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (showCelebration) {
      playSuccess();
      
      // Generate particles
      const colors = ["#FF6B6B", "#66D9CC", "#A2C9FF", "#FFD93D", "#FF8E3C"];
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -100 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        clearCelebration();
        setParticles([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, clearCelebration, playSuccess]);

  // No active task — show prompt
  if (!activeTask) {
    return (
      <div className="bg-pf-surface-container-low border border-white/5 p-8 rounded-2xl flex flex-col justify-between min-h-[200px] relative overflow-hidden group hover:bg-pf-surface-container-high transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Target className="w-24 h-24" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-pf-on-surface-variant/30" />
            <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant/40 font-bold">
              Active Task
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-0.5 text-pf-on-surface-variant/20 hover:text-pf-primary transition-colors cursor-help">
                    <Info size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {TOOLTIPS.activeTask}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h3 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-pf-on-surface-variant/20 mb-3 animate-pulse">
            No Task Selected
          </h3>
          <p className="text-pf-on-surface-variant/30 text-sm md:text-base max-w-xl">
            Go to Tasks and click the <Play size={12} className="inline text-pf-primary" /> icon to set your focus
          </p>
        </div>

        <div className="flex items-center gap-2 text-pf-on-surface-variant/20 pt-4 border-t border-white/5">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold">
            Waiting for Focus
          </span>
        </div>
      </div>
    );
  }

  // Active task found — show real data
  const projectColor = activeTask.projectColor || undefined;

  return (
    <div className="bg-pf-primary/5 border border-pf-primary/20 p-10 md:p-14 rounded-[2rem] flex flex-col justify-between min-h-[280px] relative overflow-hidden group hover:bg-pf-primary/[0.08] transition-all duration-500 shadow-2xl shadow-pf-primary/5">
      {/* 🔮 Multi-layered Glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-pf-primary/20 blur-[120px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
      
      {/* 🎊 Confetti Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ 
              x: p.x * 4, 
              y: p.y * 2, 
              scale: [0, 1, 0.5], 
              opacity: [1, 1, 0],
              rotate: Math.random() * 360
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-sm z-50"
            style={{ backgroundColor: p.color }}
          />
        ))}
      </AnimatePresence>

      {/* Decorative Icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {activeTask.isCompleted ? (
          <PartyPopper className="w-24 h-24 text-pf-primary animate-bounce transition-theme" />
        ) : (
          <Edit3 className="w-24 h-24 transition-theme" />
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-pf-primary animate-pulse transition-theme" />
          <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-primary font-bold transition-theme">
            Active Task
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-0.5 text-pf-primary/30 hover:text-pf-primary transition-colors cursor-help">
                  <Info size={12} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {TOOLTIPS.activeTask}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {activeTask.projectName && (
            <span
              className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: projectColor ? `${projectColor}20` : undefined,
                color: projectColor,
              }}
            >
              {activeTask.projectName}
            </span>
          )}
        </div>
        <h3 className="font-headline text-4xl md:text-6xl font-black tracking-tight text-pf-on-surface mb-4 leading-tight relative inline-block">
          <span className="relative z-10">{activeTask.content}</span>
          
          {(activeTask.isCompleted || showCelebration) && (
            <motion.svg
              viewBox="0 0 100 20"
              className="absolute top-1/2 left-0 w-[110%] -left-[5%] h-full -translate-y-1/2 pointer-events-none z-20"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0,10 C 20,5 40,15 60,10 C 80,5 100,15 120,10"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="text-pf-primary"
              />
            </motion.svg>
          )}
        </h3>
        <p className="text-pf-on-surface-variant/60 text-base md:text-lg">
          {activeTask.priority} priority &bull; {activeTask.actPomos}/{activeTask.estPomos} pomos
        </p>
      </div>

      <div className={`flex items-center gap-2 pt-4 border-t transition-all duration-500 ${activeTask.isCompleted ? 'text-pf-primary border-pf-primary/30' : 'text-pf-primary border-pf-primary/10'}`}>
        <CheckCircle2 className={`w-4 h-4 transition-theme ${activeTask.isCompleted ? 'fill-pf-primary text-pf-surface' : ''}`} />
        <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold transition-theme">
          {activeTask.isCompleted ? "Goal Reached! Task moved to Done" : "Session In Progress"}
        </span>
      </div>
    </div>
  );
}
