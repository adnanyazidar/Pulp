"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, ListTodo, BarChart3, Settings, ChevronLeft, Coffee, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore, SUPPORT_LINKS } from "@/store/ui-store";

const navItems = [
  { href: "/", label: "Timer", icon: Timer },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideNavbar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 72 },
  };

  return (
    <motion.nav
      initial={false}
      animate={isSidebarOpen ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "bg-pf-surface border-r border-pf-outline/10 flex-col py-8 z-50 relative group/sidebar h-screen flex-shrink-0",
        "fixed inset-y-0 left-0 md:relative md:flex",
        isSidebarOpen ? "flex w-[260px]" : "hidden md:flex w-[72px]"
      )}
    >
      {/* 🚀 Collapse Toggle (Chevron Center Edge) */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-pf-primary text-pf-on-primary rounded-full p-1 border border-white/10 shadow-lg opacity-0 group-hover/sidebar:opacity-100 transition-opacity z-[60] cursor-pointer"
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <motion.div
          animate={{ rotate: isSidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={16} />
        </motion.div>
      </button>

      {/* Logo Section */}
      <div className={cn("px-6 mb-12 flex items-center gap-3 overflow-hidden", !isSidebarOpen && "justify-center")}>
        <div className="w-6 h-6 bg-pf-primary rounded-full flex-shrink-0 shadow-lg shadow-pf-primary/20" />
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col whitespace-nowrap"
            >
              <h1 className="font-headline font-black text-pf-primary uppercase text-[10px] tracking-[0.4em]">
                PomoPulse
              </h1>
              <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant/40 mt-1">
                Master your rhythm
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 transition-all duration-200 border-r-4 relative group/item",
                isActive
                  ? "bg-pf-primary/5 text-pf-primary border-pf-primary"
                  : "border-transparent text-pf-on-surface-variant/40 hover:bg-pf-on-surface/5 hover:text-pf-on-surface"
              )}
            >
              <Icon size={20} className={cn("transition-theme shrink-0", !isSidebarOpen && "mx-auto")} />
              
              <AnimatePresence mode="wait">
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-label uppercase tracking-[0.3em] text-[9px] font-bold whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip (Mini-bar mode) */}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-3 py-1 bg-pf-surface-container-high text-pf-on-surface text-[10px] font-bold rounded-md opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-[70]">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Support Settings / Bottom Section */}
      <div className="mt-auto pt-8 flex flex-col gap-2">
        <a 
          href={SUPPORT_LINKS.saweria} 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-4 px-6 py-3 transition-all duration-200 border-r-4 border-transparent text-[#bcaea1] hover:bg-[#bcaea1]/10 hover:text-[#dabe9d] group/support relative overflow-hidden focus:outline-none"
          )}
        >
          <div className="absolute inset-0 bg-[#bcaea1]/5 opacity-0 group-active/support:opacity-100 transition-opacity" />
          <motion.div whileTap={{ scale: 0.9 }}>
            <Coffee size={20} className={cn("transition-transform shrink-0", !isSidebarOpen && "mx-auto")} />
          </motion.div>
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-label uppercase tracking-[0.2em] text-[10px] font-bold whitespace-nowrap"
              >
                Buy me a coffee
              </motion.span>
            )}
          </AnimatePresence>

          {!isSidebarOpen && (
            <div className="absolute left-full ml-4 px-3 py-1 bg-[#2a241f] text-[#dabe9d] text-[10px] font-bold rounded-md opacity-0 group-hover/support:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-[#bcaea1]/20 shadow-xl z-[70]">
              Support Developer
            </div>
          )}
        </a>
        
        {/* Feedback & Bug Report Link (Muted Style) */}
        <a 
          href={SUPPORT_LINKS.githubIssues} 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-4 px-6 py-2 transition-all duration-200 border-r-4 border-transparent text-pf-on-surface-variant/30 hover:bg-pf-on-surface/5 hover:text-pf-primary group/feedback relative overflow-hidden focus:outline-none"
          )}
        >
          <div className="absolute inset-0 bg-pf-on-surface/5 opacity-0 group-active/feedback:opacity-100 transition-opacity" />
          <motion.div whileTap={{ scale: 0.9 }}>
            <MessageSquare size={18} className={cn("transition-colors shrink-0", !isSidebarOpen && "mx-auto")} />
          </motion.div>
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-label uppercase tracking-[0.2em] text-[8px] font-bold whitespace-nowrap"
              >
                Feedback & Bug Report
              </motion.span>
            )}
          </AnimatePresence>

          {!isSidebarOpen && (
            <div className="absolute left-full ml-4 px-3 py-1 bg-pf-surface-container-high text-pf-on-surface text-[10px] font-bold rounded-md opacity-0 group-hover/feedback:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 shadow-xl z-[70]">
              Send feedback or report a bug
            </div>
          )}
        </a>

        {/* Version Tag */}
        <div className={cn("px-8 overflow-hidden pt-2", !isSidebarOpen && "px-0 text-center")}>
          <span className="text-[8px] font-label uppercase tracking-[0.4em] text-pf-on-surface-variant/20 whitespace-nowrap">
            {isSidebarOpen ? "v1.4.2 PREMIUM" : "V1.4"}
          </span>
        </div>
      </div>
    </motion.nav>
  );
}
