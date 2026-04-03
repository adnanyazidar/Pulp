"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingSection({ title, description, children, className }: SettingSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="space-y-1">
        <h3 className="text-[10px] font-label uppercase tracking-[0.3em] font-bold text-pf-primary">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] font-label text-pf-on-surface-variant/40 max-w-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {children}
      </div>
    </section>
  );
}
