"use client";

import { useEffect } from "react";
import { SideNavbar } from "@/components/layout/side-navbar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { BackgroundAtmosphere } from "@/components/layout/background-atmosphere";
import { StatsSummary } from "@/components/analytics/stats-summary";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { ProjectAllocation } from "@/components/analytics/project-allocation";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import { useStatsStore } from "@/store/stats-store";

export default function AnalyticsPage() {
  const { generateMockData, dailyHistory } = useStatsStore();

  useEffect(() => {
    // Generate mock data only if nothing exists (for Phase 1 demo)
    if (Object.keys(dailyHistory).length === 0) {
      generateMockData();
    }
  }, [dailyHistory, generateMockData]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <SideNavbar />
      <BackgroundAtmosphere />
      
      <main className="md:ml-64 flex-1 min-h-screen bg-pf-background">
        <TopNavbar />
        
        <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-3xl font-headline font-black text-pf-on-surface tracking-tighter">
              Productivity Analytics
            </h1>
            <p className="text-pf-on-surface-variant/40 font-label uppercase tracking-[0.2em] text-[10px] mt-1">
              Deep work insights & Project Allocation
            </p>
          </div>

          <StatsSummary />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <WeeklyChart />
            <ProjectAllocation />
          </div>

          <ActivityHeatmap />
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
}
