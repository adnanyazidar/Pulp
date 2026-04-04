"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { useSound } from "@/lib/hooks/use-sound";

export function SoundManager() {
  const { alarmCounter, isRunning, mode } = useTimerStore();
  const { playSound, stopSound } = useSound();
  const lastAlarmRef = useRef(alarmCounter);

  // Play alarm when session naturally ends
  useEffect(() => {
    if (alarmCounter > lastAlarmRef.current) {
      playSound("alarm");
    }
    lastAlarmRef.current = alarmCounter;
  }, [alarmCounter, playSound]);

  // Note: Alarm stopping logic removed per user request to let it play all the way through.

  return null;
}
