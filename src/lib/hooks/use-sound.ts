"use client";

import { useEffect, useRef, useCallback } from "react";

type SoundType = "click-soft" | "click-tactile" | "alarm";

export function useSound() {
  const sounds = useRef<Record<SoundType, HTMLAudioElement | null>>({
    "click-soft": null,
    "click-tactile": null,
    alarm: null,
  });

  useEffect(() => {
    // Only pre-load on client side
    if (typeof window === "undefined") return;

    sounds.current = {
      "click-soft": new Audio("/sounds/click-soft.mp3"),
      "click-tactile": new Audio("/sounds/click-tactile.mp3"),
      alarm: new Audio("/sounds/alarm.mp3"),
    };

    // Preload settings
    Object.values(sounds.current).forEach((audio) => {
      if (audio) {
        audio.preload = "auto";
        audio.load();
      }
    });
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const audio = sounds.current[type];
    if (audio) {
      // Reset to start if already playing or just finished
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn("Failed to play sound:", err));
    }
  }, []);

  const stopSound = useCallback((type: SoundType) => {
    const audio = sounds.current[type];
    if (audio && !audio.paused) {
      // Premium Fade Out (300ms)
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.1) {
          audio.volume -= 0.1;
        } else {
          clearInterval(fadeInterval);
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1; // Reset volume for next time
        }
      }, 30);
    }
  }, []);

  return { playSound, stopSound };
}
