"use client";

import { useSettingsStore } from "@/store/settings-store";
import { 
  Sunrise, Moon, Coffee, Sun, 
  Zap, Calendar, Trophy, Infinity as InfinityIcon,
  Waves, Medal, Mountain, 
  CheckCircle2, Folder, Target, CheckCheck,
  CloudRain, Music, Palette, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type BadgeCategory = "Time Traveler" | "Consistency" | "Deep Work" | "Task Execution" | "Explorer";

interface BadgeDef {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: any;
  requirement: string;
}

const BADGE_DEFS: BadgeDef[] = [
  { id: "early_bird", name: "Early Bird", description: "Focused between 04:00 - 07:00 AM", category: "Time Traveler", icon: Sunrise, requirement: "Complete a 25m focus session at dawn" },
  { id: "night_owl", name: "Night Owl", description: "Focused between 11:00 PM - 02:00 AM", category: "Time Traveler", icon: Moon, requirement: "Complete a focus session late at night" },
  { id: "afternoon_perk", name: "Afternoon Perk", description: "3 sessions between 13:00 - 16:00", category: "Time Traveler", icon: Coffee, requirement: "Finish 3 sessions during the afternoon slump" },
  { id: "morning_glory", name: "Morning Glory", description: "2 hours focus before 10:00 AM", category: "Time Traveler", icon: Sun, requirement: "Total 120 mins focus in the morning" },
  
  { id: "first_spark", name: "First Spark", description: "Your very first focus session", category: "Consistency", icon: Zap, requirement: "Complete 1 focus session" },
  { id: "week_warrior", name: "Week Warrior", description: "7-day focus streak", category: "Consistency", icon: Calendar, requirement: "Maintain focus for 7 days in a row" },
  { id: "the_habitual", name: "The Habitual", description: "30-day focus streak", category: "Consistency", icon: Trophy, requirement: "Maintain focus for 30 days in a row" },
  { id: "unstoppable", name: "Unstoppable", description: "100-day focus streak", category: "Consistency", icon: InfinityIcon, requirement: "Maintain focus for 100 days in a row" },
  
  { id: "deep_diver", name: "Deep Diver", description: "Complete 4 sessions (Full Cycle)", category: "Deep Work", icon: Waves, requirement: "Finish 4 focus sessions today without skipping" },
  { id: "zen_master", name: "Zen Master", description: "Focus without pausing", category: "Deep Work", icon: Medal, requirement: "Complete a session without hitting Pause" },
  { id: "hyper_focus", name: "Hyper Focus", description: "5 hours focus in one day", category: "Deep Work", icon: Zap, requirement: "Reach 300 minutes of focus in a single day" },
  { id: "the_peak", name: "The Peak", description: "12 focus sessions in one day", category: "Deep Work", icon: Mountain, requirement: "Finish 12 focus sessions in 24 hours" },
  
  { id: "the_closer", name: "The Closer", description: "Complete 10 tasks in a week", category: "Task Execution", icon: CheckCircle2, requirement: "Finish 10 unique tasks within 7 days" },
  { id: "the_organizer", name: "The Organizer", description: "Tasks in 3 projects", category: "Task Execution", icon: Folder, requirement: "Complete tasks in Work, Study, and Personal" },
  { id: "precise_planner", name: "Precise Planner", description: "Estimated = Actual Pomos", category: "Task Execution", icon: Target, requirement: "Complete a task matching your estimation exactly" },
  { id: "clean_sweep", name: "Clean Sweep", description: "Clear today's task list", category: "Task Execution", icon: CheckCheck, requirement: "Finish all tasks currently on your list" },
  
  { id: "rain_lover", name: "Rain Lover", description: "1 hour with Rain sound", category: "Explorer", icon: CloudRain, requirement: "Focus for 60 mins while listening to Rain" },
  { id: "melomaniac", name: "Melomaniac", description: "3 playlists added", category: "Explorer", icon: Music, requirement: "Add 3 playlists to your Media Hub" },
  { id: "the_stylist", name: "The Stylist", description: "Change accent color", category: "Explorer", icon: Palette, requirement: "Update your theme in Settings" },
  { id: "first_feedback", name: "First Feedback", description: "Provide feedback/Report bug", category: "Explorer", icon: MessageSquare, requirement: "Submit your first feedback report" },
];

export function BadgeGrid({ unlockedIds }: { unlockedIds: string[] }) {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | "All">("All");

  const categories: (BadgeCategory | "All")[] = ["All", "Time Traveler", "Consistency", "Deep Work", "Task Execution", "Explorer"];

  const filteredBadges = selectedCategory === "All" 
    ? BADGE_DEFS 
    : BADGE_DEFS.filter(b => b.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] whitespace-nowrap font-label font-bold uppercase tracking-widest transition-all border",
              selectedCategory === cat 
                ? "bg-pf-primary text-pf-surface border-pf-primary shadow-[0_0_15px_rgba(255,107,107,0.3)]" 
                : "bg-white/5 text-pf-on-surface-variant/40 border-white/5 hover:border-white/10"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedIds.includes(badge.id);
          const Icon = badge.icon;

          return (
            <div 
              key={badge.id}
              className={cn(
                "relative group aspect-square p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-3 overflow-hidden",
                isUnlocked 
                  ? "bg-pf-surface-container-low border-pf-primary/20 shadow-[0_4px_20px_rgba(255,107,107,0.1)] active:scale-95" 
                  : "bg-black/20 border-white/5 opacity-40 grayscale"
              )}
            >
              {/* Glossy Backdrop for Unlocked */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-pf-primary/10 via-transparent to-transparent pointer-events-none" />
              )}

              {/* Icon */}
              <div className={cn(
                "p-3 rounded-2xl transition-all group-hover:scale-110",
                isUnlocked ? "text-pf-primary bg-pf-primary/10" : "text-white/10"
              )}>
                <Icon size={24} />
              </div>

              {/* Text */}
              <div className="text-center space-y-1 z-10">
                <p className="text-[10px] font-headline font-black text-pf-on-surface leading-tight tracking-tight px-2">
                  {badge.name}
                </p>
                {/* Tooltip on Hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-pf-surface/95 opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center pointer-events-none">
                  <p className="text-[9px] font-headline font-black text-pf-primary uppercase tracking-tighter mb-1">
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </p>
                  <p className="text-[11px] font-label font-bold text-pf-on-surface leading-tight">
                    {badge.requirement}
                  </p>
                  <p className="text-[8px] font-label text-pf-on-surface-variant/40 mt-2">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Unlocked Glow */}
              {isUnlocked && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-pf-primary/20 blur-xl rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
