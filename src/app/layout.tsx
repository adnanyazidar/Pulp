import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

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
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
