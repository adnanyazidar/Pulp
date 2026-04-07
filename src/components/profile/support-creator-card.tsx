"use client";

import { Heart, Coffee } from "lucide-react";
import { SUPPORT_LINKS } from "@/store/ui-store";

export function SupportCreatorCard() {
  return (
    <div className="relative overflow-hidden group">
      {/* Premium Glow Effect (Muted Gold) */}
      <div className="absolute -inset-4 bg-gradient-to-br from-[#dabe9d] to-[#bcaea1] rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition duration-700 w-32 h-32 -top-10 -right-10"></div>
      
      <div className="relative bg-[#2a241f]/30 backdrop-blur-xl border border-[#bcaea1]/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#dabe9d] to-[#bcaea1] rounded-xl shadow-lg shadow-[#dabe9d]/20">
            <Heart size={20} className="text-[#3b322a] fill-[#3b322a]" />
          </div>
          <h4 className="font-headline text-2xl font-bold text-[#dabe9d] tracking-tighter">
            Support PomoPulse
          </h4>
        </div>
        
        <p className="text-[12px] font-medium leading-relaxed text-[#bcaea1] opacity-90 mb-8">
          PomoPulse is 100% free and open. If this tool helps you stay in flow and reach your goals, consider supporting its growth. 
        </p>

        <a
          href={SUPPORT_LINKS.saweria}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#dabe9d] hover:bg-[#ece2d6] text-[#3b322a] font-bold uppercase tracking-widest text-[11px] py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(218,190,157,0.3)] hover:shadow-[0_0_25px_rgba(218,190,157,0.5)] active:scale-95 focus:outline-none"
        >
          <Coffee size={18} />
          Donate via Saweria
        </a>
      </div>
    </div>
  );
}
