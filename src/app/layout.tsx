import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { TabTitleManager } from "@/components/layout/tab-title-manager";
import { SoundManager } from "@/components/layout/sound-manager";
import { LayoutShell } from "@/components/layout/layout-shell";
import { CloudSyncManager } from "@/components/auth/cloud-sync-manager";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "PomoFocus | Stay in Flow",
  description:
    "A beautifully crafted Pomodoro timer that helps you stay focused, manage tasks, and track your productivity with ambient soundscapes.",
  keywords: ["pomodoro", "timer", "productivity", "focus", "task management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} dark`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-pf-surface overflow-hidden">
        <TabTitleManager />
        <SoundManager />
        <CloudSyncManager />
        <Toaster theme="dark" position="bottom-right" />
        
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
