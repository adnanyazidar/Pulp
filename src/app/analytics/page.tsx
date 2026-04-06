"use client";

import { useEffect, useState } from "react";
import { StatsSummary } from "@/components/analytics/stats-summary";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { ProjectAllocation } from "@/components/analytics/project-allocation";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import { useStatsStore } from "@/store/stats-store";
import { useAuthStore } from "@/store/auth-store";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { dailyHistory } = useStatsStore();
  const { isAuthenticated, setAuthModalOpen } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pf-on-surface/50 font-label tracking-widest text-sm uppercase">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="relative p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12 relative">
        {/* Header Section */}
        <header className="space-y-4">
          <h1 className="text-6xl font-headline font-black tracking-tighter text-pf-on-surface">
            Analytics
          </h1>
          <p className="text-[10px] font-label uppercase tracking-[0.4em] text-pf-on-surface-variant/40">
            Performance Metrics • Deep Work Allocation
          </p>
        </header>

        {/* Blurred Content for Guests */}
        <div className={cn("relative w-full", !isAuthenticated && "h-[600px] overflow-hidden rounded-[3rem]")}>
          <div className={cn("space-y-12 transition-all duration-700", !isAuthenticated && "blur-md opacity-40 select-none pointer-events-none")}>
            <StatsSummary />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WeeklyChart />
              <ProjectAllocation />
            </div>

            <ActivityHeatmap />
          </div>

          {/* Guest Overlay CTA */}
          {!isAuthenticated && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="bg-pf-surface/60 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 flex flex-col items-center shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-pf-surface shadow-2xl flex items-center justify-center mb-6 text-pf-primary border border-white/10">
                  <Lock size={28} />
                </div>
                <h2 className="text-2xl font-pf-display font-medium text-pf-on-surface mb-3">
                  Unlock your focus journey.
                </h2>
                <p className="text-pf-on-surface-variant/60 max-w-sm mb-8">
                  Sign in to see your lifetime analytics, discover productivity patterns, and unlock exclusive rewards.
                </p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-8 h-12 rounded-full bg-pf-primary hover:bg-pf-primary-variant text-pf-on-primary font-medium flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-pf-primary/20"
                >
                  Sign In to View
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
