"use client";

import { useEffect, useState } from "react";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileStatsGrid } from "@/components/profile/profile-stats-grid";
import { AccountSettingsList } from "@/components/profile/account-settings-list";
import { CommunityRankCard } from "@/components/profile/community-rank-card";
import { MilestonesBadges } from "@/components/profile/milestones-badges";
import { PreferencesLinks } from "@/components/profile/preferences-links";
import { SupportCreatorCard } from "@/components/profile/support-creator-card";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { useAuthStore } from "@/store/auth-store";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { isAuthenticated, setAuthModalOpen } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-pf-on-surface/50 font-label tracking-widest text-sm uppercase">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="relative pb-32 min-h-[calc(100vh-64px)] selection:bg-pf-primary/30">
      <div className="max-w-6xl mx-auto space-y-8 relative">
        
        {/* Blurred Content for Guests */}
        <div className={cn("relative w-full", !isAuthenticated && "h-[600px] overflow-hidden rounded-[3rem]")}>
          <div className={cn("transition-all duration-700", !isAuthenticated && "blur-md opacity-40 select-none pointer-events-none")}>
            {/* Top Hero Section */}
            <ProfileHero />

            {/* 4-Column Bento Gamification Grid */}
            <ProfileStatsGrid />

            {/* Lower Content Split */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-10">
              {/* Main Column (2/3 width on Desktop) */}
              <AccountSettingsList />

              {/* Right Sidebar (1/3 width on Desktop) */}
              <div className="space-y-6">
                <CommunityRankCard />
                <SupportCreatorCard />
                <MilestonesBadges />
                <PreferencesLinks />
              </div>
              
            </section>
          </div>

          {/* Guest Overlay CTA */}
          {!isAuthenticated && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="bg-pf-surface/60 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 flex flex-col items-center shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-pf-surface shadow-2xl flex items-center justify-center mb-6 text-pf-primary border border-white/10">
                  <Lock size={28} />
                </div>
                <h2 className="text-2xl font-pf-display font-medium text-pf-on-surface mb-3">
                  Become a PomoPulse Elite.
                </h2>
                <p className="text-pf-on-surface-variant/60 max-w-sm mb-8">
                  Sign in to manage your account, claim your community rank, and save your preferences securely in the cloud.
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
