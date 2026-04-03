import Link from "next/link";
import { Palette, Volume2, ChevronRight } from "lucide-react";

export function PreferencesLinks() {
  return (
    <div className="p-6 bg-pf-surface-container-low/40 rounded-2xl border border-white/5 space-y-4">
      <p className="font-label text-[10px] uppercase tracking-[0.3em] font-bold text-pf-on-surface-variant opacity-50">
        Preferences
      </p>
      
      <div className="space-y-1">
        <Link 
          href="/settings" 
          className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-all group"
        >
          <span className="flex items-center gap-3">
            <Palette className="text-gray-500 group-hover:text-pf-primary transition-colors" size={20} />
            <span className="text-sm font-medium text-pf-on-surface-variant group-hover:text-pf-on-surface transition-colors">
              Appearance
            </span>
          </span>
          <ChevronRight className="text-gray-600 group-hover:translate-x-1 transition-transform" size={18} />
        </Link>
        
        <Link 
          href="/settings" 
          className="flex items-center justify-between p-3 -mx-3 rounded-xl hover:bg-white/5 transition-all group"
        >
          <span className="flex items-center gap-3">
            <Volume2 className="text-gray-500 group-hover:text-pf-primary transition-colors" size={20} />
            <span className="text-sm font-medium text-pf-on-surface-variant group-hover:text-pf-on-surface transition-colors">
              Sound & Alerts
            </span>
          </span>
          <ChevronRight className="text-gray-600 group-hover:translate-x-1 transition-transform" size={18} />
        </Link>
      </div>
    </div>
  );
}
