"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Download, Trash2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataManagement() {
  const { exportData, resetData } = useSettingsStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={exportData}
        className="flex items-center justify-between p-6 rounded-2xl bg-pf-surface-container-low border border-white/5 hover:border-white/10 hover:bg-pf-primary/5 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pf-primary/10 rounded-xl group-hover:bg-pf-primary/20 transition-all">
            <Download size={20} className="text-pf-primary" />
          </div>
          <div className="text-left space-y-1">
            <span className="text-[12px] font-headline font-bold text-pf-on-surface">Export Project Data</span>
            <span className="text-[9px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 block">Backup to JSON file</span>
          </div>
        </div>
      </button>

      <button
        onClick={resetData}
        className="flex items-center justify-between p-6 rounded-2xl bg-pf-surface-container-low border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-all text-red-500">
            <Trash2 size={20} />
          </div>
          <div className="text-left space-y-1">
            <span className="text-[12px] font-headline font-bold text-pf-on-surface">Reset Application</span>
            <span className="text-[9px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 block">Clear all Local Data</span>
          </div>
        </div>
        <ShieldAlert size={14} className="text-red-500/20 group-hover:text-red-500/40 transition-all" />
      </button>
    </div>
  );
}
