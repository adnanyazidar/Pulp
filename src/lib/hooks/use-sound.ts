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

  const playSuccess = useCallback(() => {
    if (typeof window === "undefined") return;

    // Haptic Feedback for mobile (Samsung A34)
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]); // Short double pulse
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Web Audio chime failed:", e);
    }
  }, []);

  return { playSound, stopSound, playSuccess };
}
