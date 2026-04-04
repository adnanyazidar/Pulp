"use client";

import { usePathname } from "next/navigation";
import { Settings, User, Menu, Cloud, CloudOff, CloudSync, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNavbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();
  const { isAuthenticated, user, logout, syncStatus, isAuthModalOpen, setAuthModalOpen } = useAuthStore();

  const SyncIcon = () => {
    switch (syncStatus) {
      case "synced":
        return <span title="Synced"><Cloud size={18} className="text-pf-primary" /></span>;
      case "syncing":
        return <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} title="Syncing..."><Cloud size={18} className="text-pf-on-surface-variant/40" /></motion.div>;
      case "offline":
        return <span title="Offline"><CloudOff size={18} className="text-pf-on-surface-variant/20" /></span>;
      case "error":
        return <span title="Sync Error"><Cloud size={18} className="text-pf-error" /></span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 w-full bg-pf-surface/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 z-40">
      <div className="flex h-16 items-center justify-between gap-6">
        {/* 🍔 Mobile Hamburger (Left Side) */}
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-pf-on-surface-variant/60 hover:text-pf-primary transition-colors md:hidden cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center justify-end gap-3 md:gap-6 flex-1">
          {/* Cloud Sync Indicator */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
              <SyncIcon />
              <span className="text-[10px] font-medium uppercase tracking-wider text-pf-on-surface-variant/40 hidden sm:block">
                {syncStatus}
              </span>
            </div>
          )}

          {/* Settings Icon */}
          <Link
            href="/settings"
            className={cn(
              "relative p-2 transition-colors group",
              pathname === "/settings" ? "text-pf-primary" : "text-pf-on-surface-variant/40 hover:text-pf-on-surface"
            )}
          >
            <Settings size={22} className="transition-transform group-active:scale-90" />
            
            {pathname === "/settings" && (
              <motion.div
                layoutId="topNavUnderline"
                className="absolute -bottom-[23px] left-0 right-0 h-0.5 bg-pf-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>

          {/* User Auth / Profile Dropdown */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "relative flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 border border-white/5 hover:border-pf-primary/20 transition-all group outline-none",
                    pathname === "/profile" ? "text-pf-primary" : "text-pf-on-surface"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-pf-primary/20 flex items-center justify-center text-pf-primary font-medium overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                  
                  {pathname === "/profile" && (
                    <motion.div
                      layoutId="topNavUnderline"
                      className="absolute -bottom-[23px] left-0 right-0 h-0.5 bg-pf-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-pf-surface/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuLabel className="px-3 py-2 text-pf-on-surface-variant font-label text-[10px] uppercase tracking-widest opacity-60">
                  Account Management
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-pf-on-surface hover:bg-white/5 cursor-pointer transition-colors group">
                    <User size={18} className="text-pf-on-surface-variant group-hover:text-pf-primary transition-colors" />
                    <span className="text-sm font-medium">My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-pf-on-surface hover:bg-white/5 cursor-pointer transition-colors group">
                    <Settings size={18} className="text-pf-on-surface-variant group-hover:text-pf-primary transition-colors" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 cursor-pointer transition-all group">
                  <LogOut size={18} className="text-red-400 transition-transform group-hover:translate-x-0.5" />
                  <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-5 h-10 rounded-full bg-pf-primary hover:bg-pf-primary-variant text-pf-on-primary text-sm font-medium flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-pf-primary/10"
            >
              <User size={18} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
