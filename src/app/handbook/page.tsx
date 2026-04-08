"use client";

import type { Metadata } from "next";
import { HANDBOOK } from "@/constants/copy";
import { 
  Timer, Zap, Volume2, ShieldCheck, 
  ChevronRight, Sparkles, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Timer,
  Zap,
  Volume2,
  ShieldCheck,
  Sparkles,
  ChevronRight,
};



export default function HandbookPage() {
  return (
    <div className="relative min-h-screen bg-pf-surface text-pf-on-surface p-6 md:p-24 pb-48">
      {/* 🧭 Top Navigation Indicator */}
      <div className="max-w-[48rem] mx-auto mb-16 flex items-center gap-2 text-pf-primary/40 uppercase tracking-[0.3em] text-[10px] font-bold">
        <BookOpen size={14} />
        <span>System Handbook v1.0</span>
      </div>

      <article className="max-w-[48rem] mx-auto space-y-32">
        
        {/* 🏔️ Hero Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-headline font-black tracking-tightest leading-[0.85] text-pf-on-surface">
              {HANDBOOK.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-pf-primary font-medium tracking-tight">
              {HANDBOOK.hero.subtitle}
            </p>
          </div>
          <p className="text-lg md:text-xl text-pf-on-surface-variant/70 leading-relaxed font-body">
            {HANDBOOK.hero.content}
          </p>
        </motion.header>

        {/* 🖊️ Content Sections */}
        <div className="space-y-40">
          {HANDBOOK.sections.map((section, idx) => {
            const Icon = ICON_MAP[section.icon] || Sparkles;
            return (
              <motion.section 
                key={section.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: idx * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  {section.subtitle && (
                    <p className="text-pf-primary text-sm font-bold tracking-widest uppercase mb-2">
                      {section.subtitle}
                    </p>
                  )}
                  <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tight text-pf-on-surface">
                    {section.title}
                  </h2>
                </div>

                <div className="prose prose-invert prose-xl max-w-none text-pf-on-surface-variant/80 font-body leading-relaxed">
                  <p>{section.content}</p>
                  
                  {section.details && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                      {section.details.map((detail, dIdx) => (
                        <div key={dIdx} className="p-4 rounded-2xl bg-pf-surface-container border border-pf-outline-variant/30 text-sm font-medium text-pf-on-surface-variant/60">
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* 🏔️ Final CTA */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="pt-32 border-t border-pf-outline-variant/20 text-center space-y-12"
        >
          <div className="space-y-4">
            <h3 className="text-3xl md:text-4xl font-headline font-black tracking-tight">
              {HANDBOOK.cta.title}
            </h3>
            <p className="text-pf-on-surface-variant/50 font-body text-lg italic">
              {HANDBOOK.cta.content}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <a 
              href="/" 
              className="group inline-flex items-center gap-4 px-10 py-5 rounded-full bg-pf-primary text-pf-on-primary font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,180,170,0.15)]"
            >
              {HANDBOOK.cta.button}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-[10px] text-pf-on-surface-variant/30 uppercase tracking-[0.4em] font-black">
              Zero interruptions. Pure Flow.
            </p>
          </div>
        </motion.footer>

      </article>


    </div>
  );
}
