"use client";

import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileStatsGrid } from "@/components/profile/profile-stats-grid";
import { AccountSettingsList } from "@/components/profile/account-settings-list";
import { CommunityRankCard } from "@/components/profile/community-rank-card";
import { MilestonesBadges } from "@/components/profile/milestones-badges";
import { PreferencesLinks } from "@/components/profile/preferences-links";
import { SupportCreatorCard } from "@/components/profile/support-creator-card";
import { BottomNavbar } from "@/components/layout/bottom-navbar";

export default function ProfilePage() {
  return (
    <div className="relative pb-32 min-h-[calc(100vh-64px)] selection:bg-pf-primary/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
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
      
      <BottomNavbar />
    </div>
  );
}
