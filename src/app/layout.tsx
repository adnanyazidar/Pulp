import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import { SideNavbar } from "@/components/layout/side-navbar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { BackgroundAtmosphere } from "@/components/layout/background-atmosphere";
=======
import { TabTitleManager } from "@/components/layout/tab-title-manager";
import { SoundManager } from "@/components/layout/sound-manager";
>>>>>>> feature/productivity-analytics

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
    >
      <head>
        <link
          rel="preload"
          href="/sounds/alarm.mp3"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/sounds/rain.mp3"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/sounds/click-soft.mp3"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
<<<<<<< HEAD
      <body className="min-h-screen antialiased bg-pf-surface overflow-x-hidden">
        <SideNavbar />
        <div className="flex flex-col md:pl-64 min-h-screen">
          <TopNavbar />
          <BackgroundAtmosphere />
          <main className="flex-1 w-full bg-[#121416]">
            {children}
          </main>
        </div>
=======
      <body className="min-h-screen antialiased">
        <TabTitleManager />
        <SoundManager />
        {children}
>>>>>>> feature/productivity-analytics
      </body>
    </html>
  );
}
