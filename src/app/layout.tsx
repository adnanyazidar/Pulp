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

import { CelebrationModal } from "@/components/ui/celebration-modal";

export const metadata: Metadata = {
  title: "PomoPulp — Master Your Rhythm, Stay in Flow",
  description:
    "Elevate your productivity with PomoPulp. Featuring an immersive ambient mixer, integrated Spotify/YouTube media hub, and elite focus analytics. Crafted by oramzy.",
  keywords: ["pomodoro", "timer", "productivity", "focus", "task management", "pomopulp"],
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
        <CelebrationModal />
        
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
