"use client";

import { useStatsStore } from "@/store/stats-store";
import { CalendarDays } from "lucide-react";

export function ProfileHero() {
  const { joinDate, level } = useStatsStore();
  
  // Format join date: e.g. "April 2024"
  const formattedDate = new Date(joinDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getRankTitle = (lvl: number) => {
    if (lvl >= 10) return "Elite Focuser";
    if (lvl >= 5) return "Dedicated Focuser";
    return "Novice Focuser";
  };

  return (
    <section className="flex flex-col md:flex-row md:items-end gap-8 pb-4">
      <div className="relative group shrink-0">
        <div className="absolute -inset-2 bg-gradient-to-br from-pf-primary to-[#ff5446] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <img 
          alt="User Profile" 
          className="relative w-32 h-32 rounded-full border-2 border-white/10 object-cover shadow-[0_0_30px_rgba(255,107,107,0.15)] ring-4 ring-background" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2AEB4qAOENxyOnBBxqF6UCUhYNL8IJbiDCaI40MSTlSRZDaw1CyRMHK5ZkGzQltEhR56oifxH89T0yt7y5rEklLqcVsrhBZG6bP5Y65uEHYH1URT55IiaPtqiY-HRoDjDH4p72DWBS3IPi5Sb0rpbvCjQxC3KK4Q_Is_vvOzlz9OJ-MgwkRGFYuzNbE8CQ__JrUV2p_Fgz1LP-DglACH7oSBGmhcKZsCEHB8fFGpV19s6fPdIBEOjuyLGIyGP18Wu5kxBEp7LdHGC"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <h3 className="font-headline text-4xl font-extrabold tracking-tighter text-pf-on-surface">
            John Doe
          </h3>
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-gradient-to-br from-pf-primary to-[#ff5446] text-[#5c0002] uppercase tracking-[0.2em] shadow-lg shadow-pf-primary/10 w-max">
            {getRankTitle(level)}
          </div>
        </div>
        
        <p className="text-pf-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
          <CalendarDays size={14} />
          Joined {formattedDate}
        </p>
      </div>
    </section>
  );
}
