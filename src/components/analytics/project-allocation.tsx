"use client";

import { useStatsStore } from "@/store/stats-store";
import { useTaskStore } from "@/store/task-store";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

export function ProjectAllocation() {
  const { projectStats, downloadCSV } = useStatsStore();
  const { projects } = useTaskStore();

  const totalMinutes = Object.values(projectStats).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-pf-surface-container-low p-8 rounded-2xl border border-white/5 mb-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="font-headline text-lg font-black text-pf-on-surface">Temporal Allocation</h3>
          <p className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 mt-1">
            Minutes Invested Per Project
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-label font-bold uppercase tracking-widest text-pf-on-surface-variant group"
        >
          <Download size={12} className="group-hover:translate-y-0.5 transition-transform" />
          <span>CSV</span>
        </button>
      </div>

      <div className="space-y-8">
        {projects.map((project) => {
          const minutes = projectStats[project.id] || 0;
          const percentage = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0;
          const hours = (minutes / 60).toFixed(1);

          return (
            <div key={project.id} className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-label uppercase tracking-widest font-bold">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: project.color }} 
                  />
                  <span className="text-pf-on-surface">{project.name}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-pf-on-surface-variant/40">{hours}h</span>
                  <span className="text-pf-on-surface">{percentage.toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="h-1 w-full bg-pf-surface-container-highest rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out delay-[200ms]"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: project.color,
                    boxShadow: `0 0 12px ${project.color}40`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
