"use client";

import { useMediaStore } from "@/store/media-store";
import { Play, Plus, BookAudio, Library, Trash2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TOOLTIPS } from "@/constants/copy";
import { useState } from "react";
import { motion } from "framer-motion";
import { detectPlatform, fetchYouTubeTitle } from "@/lib/media-utils";
import { Loader2 } from "lucide-react";

export function MediaHub() {
  const { playlists, playMedia, savePlaylist, removePlaylist } = useMediaStore();
  const [inputUrl, setInputUrl] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handlePlayNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;
    playMedia(inputUrl);
    setInputUrl("");
  };

  const handleSaveCustom = async () => {
    if (!inputUrl) return;
    setIsFetching(true);
    const platform = detectPlatform(inputUrl);
    
    let title = "";
    if (platform === 'youtube') {
      const fetchedTitle = await fetchYouTubeTitle(inputUrl);
      title = fetchedTitle || `My YouTube Track`;
    } else {
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
      title = `My ${platformName} Track`;
    }
    
    await savePlaylist(title, inputUrl, platform);
    setInputUrl("");
    setIsFetching(false);
    setShowSaved(true); // Switch to saved tab to show feedback
  };

  const currentList = showSaved 
    ? playlists.filter((p) => !p.id.toString().startsWith("preset-"))
    : playlists.filter((p) => p.id.toString().startsWith("preset-"));

  return (
    <div className="bg-pf-surface-container-low/60 backdrop-blur-md rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border border-white/5 h-full flex flex-col relative overflow-hidden group">
      
      {/* Subtle Background Icon */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000">
        <BookAudio size={160} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tighter text-pf-on-surface flex items-center gap-3">
          <BookAudio className="text-pf-primary" size={24} />
          Focus Media
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-0.5 text-pf-primary/30 hover:text-pf-primary transition-colors cursor-help">
                  <Info size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-pf-surface-container-high border-white/5">
                {TOOLTIPS.mediaHub}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button 
            onClick={() => setShowSaved(false)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              !showSaved ? "bg-pf-surface-bright text-pf-on-surface shadow-md" : "text-white/40 hover:text-white"
            }`}
          >
            Presets
          </button>
          <button 
            onClick={() => setShowSaved(true)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              showSaved ? "bg-pf-surface-bright text-pf-on-surface shadow-md" : "text-white/40 hover:text-white"
            }`}
          >
            <Library size={12} />
            Saved
          </button>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handlePlayNow} className="flex flex-col sm:flex-row gap-2 relative z-10">
        <input 
          type="text" 
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Paste Spotify, YouTube, or SoundCloud link..."
          className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pf-on-surface placeholder:text-white/20 focus:outline-none focus:border-pf-primary transition-colors"
        />
        <div className="flex gap-2">
          <button 
            type="submit"
            className="flex-1 sm:flex-initial bg-pf-primary hover:bg-[#ff5446] text-[#5c0002] px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,107,107,0.3)] hover:shadow-[0_0_25px_rgba(255,107,107,0.5)] active:scale-95 flex items-center justify-center"
            title="Play Now"
          >
            <Play size={18} className="fill-[#5c0002]" />
          </button>
          <button 
            type="button"
            onClick={handleSaveCustom}
            disabled={isFetching}
            className="flex-1 sm:flex-initial bg-pf-surface-bright/20 hover:bg-pf-surface-bright/30 text-pf-on-surface px-6 py-3 rounded-xl font-bold transition-all border border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
            title="Save to Library"
          >
            {isFetching ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          </button>
        </div>
      </form>

      {/* Library Grid - Multi-column for 'Focus Center' Footer vibe */}
      <div className="flex-1 overflow-y-auto pr-2 relative z-10 custom-scrollbar scrollbar-thin">
        {currentList.length === 0 && showSaved && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
            <Library size={32} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">No saved playlists</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentList.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -2 }}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-2xl transition-all cursor-pointer group/item hover:border-pf-primary/30 shadow-lg hover:shadow-pf-primary/5"
              onClick={() => playMedia(item.url)}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:border-pf-primary/40 transition-colors shadow-inner">
                  <Play size={16} className="text-pf-primary opacity-40 group-hover/item:opacity-100 transition-all group-hover/item:scale-110" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-sm text-pf-on-surface truncate pr-2 group-hover/item:text-pf-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-pf-secondary font-bold opacity-60">
                    {item.platform}
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="shrink-0">
                {!showSaved ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); savePlaylist(item.title, item.url, item.platform); }}
                    className="p-2 text-white/20 hover:text-pf-primary hover:bg-pf-primary/10 rounded-xl transition-all"
                    title="Save to Library"
                  >
                    <Plus size={18} />
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removePlaylist(item.id); }}
                    className="p-2 text-white/20 hover:text-pf-error hover:bg-pf-error/10 rounded-xl transition-all"
                    title="Remove from Library"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
