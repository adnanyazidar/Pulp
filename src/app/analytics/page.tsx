"use client";

import { useEffect } from "react";
import { StatsSummary } from "@/components/analytics/stats-summary";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { ProjectAllocation } from "@/components/analytics/project-allocation";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import { useStatsStore } from "@/store/stats-store";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

export default function AnalyticsPage() {
  const { generateMockData, dailyHistory } = useStatsStore();

  useEffect(() => {
    // Generate mock data only if nothing exists (for Phase 1 demo)
    if (Object.keys(dailyHistory).length === 0) {
      generateMockData();
    }
  }, [dailyHistory, generateMockData]);

  return (
    <div className="relative p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="space-y-4">
          <h1 className="text-6xl font-headline font-black tracking-tighter text-pf-on-surface">
            Analytics
          </h1>
          <p className="text-[10px] font-label uppercase tracking-[0.4em] text-pf-on-surface-variant/40">
            Performance Metrics • Deep Work Allocation
          </p>
        </header>

        <StatsSummary />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WeeklyChart />
          <ProjectAllocation />
        </div>

        <ActivityHeatmap />
      </div>

      <BottomNavbar />
    </div>
  );
}
