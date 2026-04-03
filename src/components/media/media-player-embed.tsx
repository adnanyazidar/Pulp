"use client";

import { useMediaStore } from "@/store/media-store";
import { getEmbedUrl, detectPlatform } from "@/lib/media-utils";
import { X, Minimize2, Maximize2, Music } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function MediaPlayerEmbed() {
  const { activeUrl, isPlaying, stopMedia } = useMediaStore();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isPlaying || !activeUrl) return null;

  const embedUrl = getEmbedUrl(activeUrl);
  const platform = detectPlatform(activeUrl);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300",
          isMinimized ? "w-[240px]" : "w-[360px]"
        )}
      >
        {/* Header Control Bar */}
        <div className="bg-pf-surface-container-high/90 backdrop-blur-md rounded-t-xl border border-white/10 border-b-0 px-4 py-2 w-full flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 text-pf-primary">
            <Music size={14} className="animate-pulse-slow" />
            <span className="font-label text-[10px] uppercase font-bold tracking-widest text-pf-on-surface-variant">
              Now Playing
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-pf-on-surface-variant hover:text-pf-on-surface transition-colors focus:outline-none"
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button 
              onClick={stopMedia}
              className="text-white/40 hover:text-red-400 transition-colors focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <motion.div 
          animate={{ height: isMinimized ? 0 : platform === 'youtube' ? 200 : 152 }}
          className={cn(
            "w-full bg-[#121416]/90 backdrop-blur-xl border border-white/10 rounded-b-xl shadow-2xl overflow-hidden origin-bottom flex flex-col",
            isMinimized && "border-t"
          )}
        >
          {platform === 'spotify' && (
            <div className="px-3 pt-2 pb-1 bg-black/40 text-center">
              <span className="text-[9px] text-[#1ed760] font-bold uppercase tracking-widest opacity-80">
                Log into Spotify browser for full tracks
              </span>
            </div>
          )}

          <iframe
            src={embedUrl}
            className="w-full flex-1"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
