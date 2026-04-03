"use client";

import { CloudRain, Volume2, VolumeX, Music, MousePointer2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useTimerStore } from "@/store/timer-store";

export function AmbientCard() {
  const {
    ambientVolume,
    setAmbientVolume,
    ambientSoundId,
    setAmbientSoundId,
    isAmbientPlaying,
    toggleAmbient,
    clickSoundId,
    setClickSoundId,
  } = useTimerStore();

  const soundOptions = [
    { id: "rain", label: "Rainfall", icon: CloudRain },
    { id: "study", label: "Study Aura", icon: Music },
  ];

  const clickOptions = [
    { id: "soft", label: "Soft" },
    { id: "tactile", label: "Tactile" },
    { id: "none", label: "Off" },
  ];

  return (
    <div className="bg-pf-surface-container-low p-8 rounded-2xl flex flex-col gap-8 min-h-[200px] border border-white/5 hover:bg-pf-surface-container transition-all duration-300 group">
      {/* Sound Type Selection */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant">
            Environment
          </p>
          <button
            onClick={toggleAmbient}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 transition-all cursor-pointer ${
              isAmbientPlaying
                ? "bg-pf-primary/10 border-pf-primary/30"
                : "bg-pf-surface-container-high"
            }`}
          >
            <span
              className={`font-label text-[10px] uppercase tracking-[0.2em] font-bold transition-theme ${
                isAmbientPlaying ? "text-pf-primary" : "text-pf-on-surface"
              }`}
            >
              {isAmbientPlaying ? "Active" : "Muted"}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {soundOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = ambientSoundId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAmbientSoundId(opt.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-pf-primary/20 border-pf-primary/40 text-pf-primary"
                    : "bg-white/5 border-white/5 text-pf-on-surface-variant hover:bg-white/10"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive && "animate-wave"}`} />
                <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Click Sound Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-3 h-3 text-pf-on-surface-variant/40" />
          <p className="font-label uppercase tracking-[0.2em] text-[10px] text-pf-on-surface-variant/40">
            Click Feedback
          </p>
        </div>
        <div className="flex gap-2">
          {clickOptions.map((opt) => {
            const isActive = clickSoundId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setClickSoundId(opt.id as any)}
                className={`flex-1 px-2 py-2 rounded-lg border transition-all text-center cursor-pointer ${
                  isActive
                    ? "bg-pf-primary/10 border-pf-primary/30 text-pf-primary"
                    : "bg-white/5 border-white/5 text-pf-on-surface-variant/40 hover:bg-white/10"
                }`}
              >
                <span className="font-label text-[10px] uppercase tracking-[0.2em] font-bold">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Volume Slider */}
      <div className="space-y-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          {ambientVolume === 0 ? (
            <VolumeX className="w-4 h-4 text-pf-on-surface-variant/40" />
          ) : (
            <Volume2 className="w-4 h-4 text-pf-on-surface-variant/40" />
          )}
          <Slider
            value={[ambientVolume]}
            onValueChange={(vals) => {
              const val = Array.isArray(vals) ? vals[0] : vals;
              setAmbientVolume(val ?? 0);
            }}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
