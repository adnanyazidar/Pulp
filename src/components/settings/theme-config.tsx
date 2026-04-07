"use client";

import { SettingsState, AccentColor } from "@/store/settings-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ThemeConfigProps {
  settings: SettingsState["themeSettings"];
  onUpdate: (val: SettingsState["themeSettings"]) => void;
}

const ACCENT_COLORS: Record<AccentColor, string> = {
  coral: "#FF6B6B",
  mint: "#66D9CC",
  blue: "#A2C9FF",
  pink: "#FFB4AA",
};

export function ThemeConfig({ settings, onUpdate }: ThemeConfigProps) {
  const palettes: { id: AccentColor; label: string; color: string }[] = [
    { id: "coral", label: "Coral Red", color: "bg-[#FF6B6B]" },
    { id: "mint", label: "Midnight Mint", color: "bg-[#66D9CC]" },
    { id: "blue", label: "Breeze Blue", color: "bg-[#A2C9FF]" },
    { id: "pink", label: "Cherry Blossom", color: "bg-[#FFB4AA]" },
  ];

  const handleSelect = (id: AccentColor) => {
    onUpdate({ accentColor: id });
    
    // Live preview: apply the color to the CSS variable immediately
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--pf-primary", ACCENT_COLORS[id]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {palettes.map((palette) => (
        <button
          key={palette.id}
          onClick={() => handleSelect(palette.id)}
          className={cn(
            "p-5 rounded-2xl border transition-all flex flex-col items-center gap-4 text-center group",
            settings.accentColor === palette.id
              ? "bg-pf-primary/5 border-pf-primary/30"
              : "bg-pf-surface-container-low border-white/5 hover:border-white/10"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform group-hover:scale-110",
            palette.color
          )}>
            {settings.accentColor === palette.id && (
              <Check size={18} className="text-pf-surface" />
            )}
          </div>
          <div className="space-y-1">
            <span className={cn(
              "text-[10px] font-label font-bold uppercase tracking-widest block",
              settings.accentColor === palette.id ? "text-pf-primary" : "text-pf-on-surface-variant/40"
            )}>
              {palette.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
