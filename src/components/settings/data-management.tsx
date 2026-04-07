"use client";

import { useSettingsStore, SettingsState } from "@/store/settings-store";
import { Download, Trash2, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataManagementProps {
  uiSettings: SettingsState["uiSettings"];
  onUpdate: (val: SettingsState["uiSettings"]) => void;
}

export function DataManagement({ uiSettings, onUpdate }: DataManagementProps) {
  const { exportData, resetData } = useSettingsStore();

  const toggleAutoStart = () => {
    onUpdate({
      ...uiSettings,
      autoStartBreaks: !uiSettings.autoStartBreaks
    });
  };

  return (
    <div className="space-y-6">
      {/* UI Settings Toggles */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={toggleAutoStart}
          className="flex items-center justify-between p-6 rounded-2xl bg-pf-surface-container-low border border-white/5 hover:border-white/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl transition-all",
              uiSettings.autoStartBreaks ? "bg-pf-primary/20 text-pf-primary" : "bg-white/5 text-white/20"
            )}>
              <Zap size={20} />
            </div>
            <div className="text-left space-y-1">
              <span className="text-[12px] font-headline font-bold text-pf-on-surface">Auto-Start Breaks</span>
              <span className="text-[9px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 block">
                Automatically transition to break after focus
              </span>
            </div>
          </div>
          <div className={cn(
            "w-10 h-5 rounded-full p-1 transition-all",
            uiSettings.autoStartBreaks ? "bg-pf-primary" : "bg-white/10"
          )}>
            <div className={cn(
              "w-3 h-3 bg-white rounded-full transition-all",
              uiSettings.autoStartBreaks ? "translate-x-5" : "translate-x-0"
            )} />
          </div>
        </button>
      </div>

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
    </div>
  );
}
