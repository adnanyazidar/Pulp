"use client";

import { useStatsStore } from "@/store/stats-store";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CelebrationModal() {
  const { newlyUnlockedBadges, clearNewBadges } = useStatsStore();
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  // If we have multiple badges unlocked at once, show them one by one
  const badgeId = newlyUnlockedBadges[currentBadgeIndex];

  const handleNext = () => {
    if (currentBadgeIndex < newlyUnlockedBadges.length - 1) {
      setCurrentBadgeIndex(prev => prev + 1);
    } else {
      clearNewBadges();
      setCurrentBadgeIndex(0);
    }
  };

  if (!badgeId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="relative max-w-sm w-full bg-pf-surface-container-high rounded-[40px] p-8 text-center border border-pf-primary/30 shadow-[0_0_50px_rgba(255,107,107,0.2)] overflow-hidden"
        >
          {/* Animated Background Rays */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,107,107,0.1)_20deg,transparent_40deg)] opacity-50"
            />
          </div>

          {/* Close Button */}
          <button 
            onClick={clearNewBadges}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-pf-on-surface-variant/40 hover:bg-white/10 transition-all z-20"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="relative z-10 space-y-8">
            <motion.div
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-pf-primary to-pf-primary/40 rounded-[32px] flex items-center justify-center shadow-[0_10px_30px_rgba(255,107,107,0.4)]"
            >
              <Trophy size={48} className="text-pf-surface" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xs font-label font-black uppercase tracking-[0.3em] text-pf-primary">
                Achievement Unlocked
              </h2>
              <h1 className="text-4xl font-headline font-black text-pf-on-surface tracking-tighter">
                {badgeId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h1>
              <p className="text-pf-on-surface-variant/60 font-label font-bold text-sm leading-relaxed max-w-[240px] mx-auto">
                You've earned a new badge for your Elite Collection.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={handleNext}
                className="w-full bg-pf-primary text-pf-surface py-4 rounded-2xl font-label font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,107,107,0.3)] transition-all active:scale-95"
              >
                {currentBadgeIndex < newlyUnlockedBadges.length - 1 ? "Next Badge" : "Awesome!"}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] font-label font-bold text-pf-primary uppercase tracking-widest animate-pulse">
                <Star size={12} fill="currentColor" />
                <span>Bonus XP Awarded</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
