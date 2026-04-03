"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { useSound } from "@/lib/hooks/use-sound";

export function SoundManager() {
  const { alarmCounter } = useTimerStore();
  const { playSound } = useSound();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (alarmCounter > 0) {
      playSound("alarm");
    }
  }, [alarmCounter, playSound]);

  return null;
}
