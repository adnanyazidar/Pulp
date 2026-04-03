"use client";

import { useState } from "react";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { SettingSection } from "@/components/settings/setting-section";
import { TimerConfig } from "@/components/settings/timer-config";
import { SoundscapeConfig } from "@/components/settings/soundscape-config";
import { ThemeConfig } from "@/components/settings/theme-config";
import { ShortcutCheatsheet } from "@/components/settings/shortcut-cheatsheet";
import { DataManagement } from "@/components/settings/data-management";
import { Check, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="p-6 md:p-12 pb-32">
      <div className="max-w-3xl mx-auto space-y-20">
        
        {/* Header Section */}
        <header className="flex items-end justify-between border-b border-white/5 pb-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-headline font-black tracking-tighter text-pf-on-surface">
              Settings
            </h1>
            <p className="text-[10px] font-label uppercase tracking-[0.4em] text-pf-on-surface-variant/40">
              Editorial Configuration • Version 1.4.2
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-full transition-all active:scale-95 disabled:opacity-50",
              showSaved ? "bg-green-500/20 text-green-500" : "bg-pf-primary text-pf-surface hover:shadow-[0_0_20px_rgba(255,107,107,0.3)]"
            )}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : showSaved ? (
              <Check size={18} />
            ) : (
              <Save size={18} />
            )}
            <span className="text-[10px] font-label font-black uppercase tracking-widest">
              {showSaved ? "Settings Saved" : "Save Changes"}
            </span>
          </button>
        </header>

        {/* Configuration Grid */}
        <div className="space-y-24">
          <SettingSection 
            title="Timer Performance" 
            description="Adjust focus intervals and break durations based on your cognitive rhythm."
          >
            <TimerConfig />
          </SettingSection>

          <SettingSection 
            title="Atmospheric Engine" 
            description="Optimize your deep work soundscape with curated ambient scenes and high-fidelity notifications."
          >
            <SoundscapeConfig />
          </SettingSection>

          <SettingSection 
            title="Chromesthesia Customization" 
            description="Select your signature accent color. Changes are applied dynamically across the entire interface."
          >
            <ThemeConfig />
          </SettingSection>

          <SettingSection 
            title="Power User Shortcuts" 
            description="Master the application with instant command execution."
          >
            <ShortcutCheatsheet />
          </SettingSection>

          <SettingSection 
            title="System Governance" 
            description="Manage your local data persistence and security settings."
          >
            <DataManagement />
          </SettingSection>
        </div>

        {/* Footer Quote */}
        <footer className="pt-20 text-center opacity-20 hover:opacity-40 transition-opacity">
          <p className="font-headline italic text-pf-on-surface-variant/60 text-lg">
            "Focus is a matter of deciding what things you're not going to do."
          </p>
        </footer>

      </div>
      
      <BottomNavbar />
    </div>
  );
}
