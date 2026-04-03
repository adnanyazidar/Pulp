"use client";

import { useEffect, useRef } from "react";
import { useTimerStore, formatTime, getModeLabel } from "@/store/timer-store";
import { BottomNavbar } from "@/components/layout/bottom-navbar";
import { ModeSelector } from "@/components/timer/mode-selector";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TimerProgress } from "@/components/timer/timer-progress";
import { TimerControls } from "@/components/timer/timer-controls";
import { ActiveTaskCard } from "@/components/dashboard/active-task-card";
import { AmbientCard } from "@/components/dashboard/ambient-card";
import { StatsFooter } from "@/components/dashboard/stats-footer";

export default function Home() {
  const {
    mode,
    timeRemaining,
    isRunning,
    tick,
    ambientVolume,
    ambientSoundId,
    isAmbientPlaying,
    clickSoundId,
    alarmCounter,
  } = useTimerStore();

  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sound mapping
  const ambientSounds: Record<string, string> = {
    rain: "/sounds/rain.mp3",
    study: "/sounds/study.mp3",
  };

  const clickSounds: Record<string, string> = {
    soft: "/sounds/click-soft.mp3",
    tactile: "/sounds/click-tactile.mp3",
  };

  // Timer Tick Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // Tab Title Sync
  useEffect(() => {
    const timeDisplay = formatTime(timeRemaining);
    const modeLabel = getModeLabel(mode);
    document.title = isRunning
      ? `(${timeDisplay}) ${modeLabel} | PomoFocus`
      : `${modeLabel} | PomoFocus`;
  }, [timeRemaining, mode, isRunning]);

  // Ambient Audio & Volume Sync
  useEffect(() => {
    if (ambientAudioRef.current) {
      const targetSrc = ambientSounds[ambientSoundId] || ambientSounds.rain;
      if (ambientAudioRef.current.src.indexOf(targetSrc) === -1) {
        ambientAudioRef.current.src = targetSrc;
      }

      ambientAudioRef.current.volume = ambientVolume / 100;

      if (isAmbientPlaying) {
        ambientAudioRef.current.play().catch(() => {});
      } else {
        ambientAudioRef.current.pause();
      }
    }
  }, [ambientVolume, isAmbientPlaying, ambientSoundId]);

  // Click Sound Trigger
  const prevState = useRef({ isRunning, mode });
  useEffect(() => {
    const isRunningChanged = prevState.current.isRunning !== isRunning;
    const isModeChanged = prevState.current.mode !== mode;

    if ((isRunningChanged || isModeChanged) && clickSoundId !== "none") {
      if (clickAudioRef.current) {
        const src = clickSounds[clickSoundId];
        if (src) {
          clickAudioRef.current.src = src;
          clickAudioRef.current.currentTime = 0;
          clickAudioRef.current.play().catch(() => {});
        }
      }
    }
    prevState.current.isRunning = isRunning;
    prevState.current.mode = mode;
  }, [isRunning, mode, clickSoundId]);

  // Alarm Trigger
  const lastAlarmRef = useRef(alarmCounter);
  useEffect(() => {
    if (alarmCounter > lastAlarmRef.current) {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.play().catch(() => {});
      }
    }
    lastAlarmRef.current = alarmCounter;
  }, [alarmCounter]);

  return (
    <div className="p-6 lg:p-12 pb-32">
      {/* Audio elements */}
      <audio ref={ambientAudioRef} loop />
      <audio ref={alarmAudioRef} src="/sounds/alarm.mp3" />
      <audio ref={clickAudioRef} preload="auto" />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center pt-8">
        {/* Mode Selector */}
        <ModeSelector />

        {/* Mode Label */}
        <div className="mb-2">
          <span className="font-headline font-black text-pf-primary/40 tracking-[0.4em] uppercase text-xs md:text-sm transition-theme">
            {getModeLabel(mode)}
          </span>
        </div>

        {/* Timer Block */}
        <div className="relative w-full max-w-2xl text-center mb-12">
          <TimerDisplay />
          <TimerProgress />
          <TimerControls />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <ActiveTaskCard />
          <AmbientCard />
        </div>

        {/* Footer Stats */}
        <StatsFooter />
      </div>

      <BottomNavbar />
    </div>
  );
}
