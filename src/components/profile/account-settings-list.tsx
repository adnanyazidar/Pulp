"use client";

import { UserCircle, Trash2, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export function AccountSettingsList() {
  const { logout } = useAuthStore();

  return (
    <div className="lg:col-span-2 space-y-8">
      <h4 className="font-headline text-2xl font-bold text-pf-on-surface flex items-center gap-3">
        <UserCircle className="text-pf-primary/80" size={24} />
        Account Settings
      </h4>
      
      <div className="space-y-px rounded-2xl overflow-hidden border border-white/5 bg-white/5">
        
        {/* Email */}
        <div className="group bg-pf-surface-container-low hover:bg-pf-surface-container-highest transition-colors p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-pf-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] font-bold mb-1 opacity-60">
              Email Address
            </p>
            <p className="font-medium text-pf-on-surface">john.doe@example.com</p>
          </div>
          <button className="px-5 py-2.5 bg-pf-surface-container-highest/50 text-pf-on-surface text-[11px] font-bold rounded-xl hover:bg-pf-surface-bright transition-all uppercase tracking-widest border border-white/5 whitespace-nowrap">
            Change Email
          </button>
        </div>

        {/* Username */}
        <div className="group bg-pf-surface-container-low hover:bg-pf-surface-container-highest transition-colors p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-pf-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] font-bold mb-1 opacity-60">
              Username
            </p>
            <p className="font-medium text-pf-on-surface">john_focus</p>
          </div>
          <button className="px-5 py-2.5 bg-pf-surface-container-highest/50 text-pf-on-surface text-[11px] font-bold rounded-xl hover:bg-pf-surface-bright transition-all uppercase tracking-widest border border-white/5 whitespace-nowrap">
            Edit
          </button>
        </div>

        {/* Password */}
        <div className="group bg-pf-surface-container-low hover:bg-pf-surface-container-highest transition-colors p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-pf-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] font-bold mb-1 opacity-60">
              Password
            </p>
            <p className="font-medium text-pf-on-surface">Last changed 2 months ago</p>
          </div>
          <button className="px-5 py-2.5 bg-pf-surface-container-highest/50 text-pf-on-surface text-[11px] font-bold rounded-xl hover:bg-pf-surface-bright transition-all uppercase tracking-widest border border-white/5 whitespace-nowrap">
            Reset Password
          </button>
        </div>

      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all group"
        >
          <LogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
          Sign Out
        </button>

        <button className="flex items-center gap-2 text-pf-on-surface-variant/40 hover:text-red-500/60 text-[11px] font-bold uppercase tracking-widest transition-all duration-300">
          <Trash2 size={18} />
          Deactivate Account
        </button>
      </div>
    </div>
  );
}
