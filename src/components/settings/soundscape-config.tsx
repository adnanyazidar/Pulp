"use client";

import { useSettingsStore, SettingsState } from "@/store/settings-store";
import { Music, Bell, Bird, CloudRain, Coffee, Wind, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface SoundscapeConfigProps {
  settings: SettingsState["soundSettings"];
  onUpdate: (val: SettingsState["soundSettings"]) => void;
}

export function SoundscapeConfig({ settings, onUpdate }: SoundscapeConfigProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ambientSounds = [
    { id: "rain", label: "Rainfall", icon: CloudRain },
    { id: "study", label: "Library", icon: Music },
    { id: "cafe", label: "Cafe", icon: Coffee },
    { id: "white_noise", label: "Static", icon: Wind },
  ];

  const alarmSounds = [
    { id: "bell", label: "Zen Bell", icon: Bell },
    { id: "bird", label: "Nature", icon: Bird },
    { id: "digital", label: "Digital", icon: Info },
  ];

  const playPreview = (path: string) => {
    if (audioRef.current) {
      audioRef.current.src = path;
      audioRef.current.volume = settings.alarmVolume / 100 / 2; // Preview at half volume
      audioRef.current.play();
      setTimeout(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      }, 1500);
    }
  };

  const handleUpdate = <K extends keyof SettingsState["soundSettings"]>(
    key: K,
    value: SettingsState["soundSettings"][K]
  ) => {
    onUpdate({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-12">
      <audio ref={audioRef} />

      {/* Alarm Sound Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <label className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 font-bold">
            Alarm Sound
          </label>
          <div className="grid grid-cols-3 gap-3">
            {alarmSounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => {
                  handleUpdate("alarmSound", sound.id);
                  playPreview("/sounds/alarm.mp3");
                }}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  settings.alarmSound === sound.id
                    ? "bg-pf-primary/10 border-pf-primary/30 text-pf-primary"
                    : "bg-pf-surface-container-low border-white/5 text-pf-on-surface-variant/40 hover:border-white/10"
                )}
              >
                <sound.icon size={16} />
                <span className="text-[8px] font-label font-bold uppercase tracking-widest">
                  {sound.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 font-bold">
            Alarm Volume
          </label>
          <div className="bg-pf-surface-container-low p-6 rounded-2xl border border-white/5">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.alarmVolume}
              onChange={(e) => handleUpdate("alarmVolume", parseInt(e.target.value))}
              className="w-full h-1 bg-pf-surface-dim rounded-full appearance-none cursor-pointer accent-pf-primary"
            />
          </div>
        </div>
      </div>

      {/* Ambient Sound Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <label className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 font-bold">
            Ambient Scene
          </label>
          <div className="grid grid-cols-4 gap-3">
            {ambientSounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => {
                  handleUpdate("ambientSound", sound.id);
                  const path = sound.id === "rain" ? "/sounds/rain.mp3" : "/sounds/study.mp3";
                  playPreview(path);
                }}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  settings.ambientSound === sound.id
                    ? "bg-pf-primary/10 border-pf-primary/30 text-pf-primary"
                    : "bg-pf-surface-container-low border-white/5 text-pf-on-surface-variant/40 hover:border-white/10"
                )}
              >
                <sound.icon size={16} />
                <span className="text-[8px] font-label font-bold uppercase tracking-widest">
                  {sound.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-label uppercase tracking-widest text-pf-on-surface-variant/40 font-bold">
            Atmosphere Volume
          </label>
          <div className="bg-pf-surface-container-low p-6 rounded-2xl border border-white/5">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.ambientVolume}
              onChange={(e) => handleUpdate("ambientVolume", parseInt(e.target.value))}
              className="w-full h-1 bg-pf-surface-dim rounded-full appearance-none cursor-pointer accent-pf-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
