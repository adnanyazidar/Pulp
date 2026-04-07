import type { Metadata } from "next";
import { HANDBOOK } from "@/constants/copy";
import { 
  Timer, Zap, Volume2, ShieldCheck, 
  BarChart3, ChevronRight, BookOpen, 
  Sparkles, MousePointer2 
} from "lucide-react";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: HANDBOOK.seo.title,
  description: HANDBOOK.seo.description,
};

export default function HandbookPage() {
  const ICON_MAP: Record<string, LucideIcon> = {
    Timer,
    Zap,
    Volume2,
    ShieldCheck,
    BarChart3,
  };

  return (
    <div className="relative p-6 md:p-12 pb-32">
      <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-16">
        
        {/* 📚 Sticky Table of Contents (Desktop Only) */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div className="flex items-center gap-2 text-pf-primary mb-6">
              <BookOpen size={20} />
              <span className="font-headline font-black uppercase tracking-tighter text-sm">Contents</span>
            </div>
            <nav className="flex flex-col gap-4">
              {HANDBOOK.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 hover:text-pf-primary transition-all flex items-center group"
                >
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all mr-2" />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* 🖊️ Content Area */}
        <article className="flex-1 space-y-24 scroll-smooth">
          
          {/* Hero Section */}
          <header className="space-y-12 relative">
            <div className="absolute -top-12 -left-12 opacity-[0.03] pointer-events-none">
              <Sparkles size={200} />
            </div>
            <div className="space-y-4 relative z-10">
              <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tightest leading-[0.9] text-pf-on-surface">
                {HANDBOOK.hero.title}
              </h1>
              <p className="text-[10px] font-label uppercase tracking-[0.4em] text-pf-primary font-bold">
                Official PomoPulse v1.0 Technical Guide
              </p>
            </div>
            <p className="text-xl md:text-2xl text-pf-on-surface-variant/60 leading-relaxed max-w-2xl font-medium">
              {HANDBOOK.hero.content}
            </p>
          </header>

          {/* Sections Map */}
          <div className="space-y-32">
            {HANDBOOK.sections.map((section) => {
              const Icon = ICON_MAP[section.icon] || Sparkles;
              return (
                <section key={section.id} id={section.id} className="relative group pt-4">
                  {/* Decorative Backdrop Icon */}
                  <div className="absolute -top-8 -right-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 pointer-events-none">
                    <Icon size={180} />
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-pf-primary/10 flex items-center justify-center border border-pf-primary/20 shadow-xl shadow-pf-primary/5">
                        <Icon className="text-pf-primary" size={20} />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-pf-on-surface group-hover:text-pf-primary transition-colors">
                        {section.title}
                      </h2>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none text-pf-on-surface-variant/70 font-label">
                      <p className="leading-loose">
                        {section.content}
                      </p>
                      
                      {section.details && (
                        <ul className="mt-8 space-y-4 list-none p-0">
                          {section.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-pf-primary/60 border-l-2 border-pf-primary/20 pl-4 py-1 hover:border-pf-primary transition-all">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Footer Call to Action */}
          <footer className="pt-24 border-t border-white/5 space-y-8 text-center pb-12">
             <p className="text-pf-on-surface-variant/40 font-label text-sm italic">
                {HANDBOOK.footer}
             </p>
             <a 
              href="/" 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-pf-primary text-pf-on-primary font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-pf-primary/20"
             >
                Launch Dashboard
                <ChevronRight size={18} />
             </a>
          </footer>
        </article>
      </div>

      <BottomNavbar />
    </div>
  );
}
