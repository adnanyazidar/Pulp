"use client";

import { useSettingsStore, AccentColor } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ThemeConfig() {
  const { themeSettings, updateThemeAccent } = useSettingsStore();

  const palettes: { id: AccentColor; label: string; color: string }[] = [
    { id: "coral", label: "Coral Red", color: "bg-[#FF6B6B]" },
    { id: "mint", label: "Midnight Mint", color: "bg-[#66D9CC]" },
    { id: "blue", label: "Breeze Blue", color: "bg-[#A2C9FF]" },
    { id: "pink", label: "Cherry Blossom", color: "bg-[#FFB4AA]" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {palettes.map((palette) => (
        <button
          key={palette.id}
          onClick={() => updateThemeAccent(palette.id)}
          className={cn(
            "p-5 rounded-2xl border transition-all flex flex-col items-center gap-4 text-center group",
            themeSettings.accentColor === palette.id
              ? "bg-pf-primary/5 border-pf-primary/30"
              : "bg-pf-surface-container-low border-white/5 hover:border-white/10"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform group-hover:scale-110",
            palette.color
          )}>
            {themeSettings.accentColor === palette.id && (
              <Check size={18} className="text-pf-surface" />
            )}
          </div>
          <div className="space-y-1">
            <span className={cn(
              "text-[10px] font-label font-bold uppercase tracking-widest block",
              themeSettings.accentColor === palette.id ? "text-pf-primary" : "text-pf-on-surface-variant/40"
            )}>
              {palette.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
