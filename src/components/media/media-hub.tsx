"use client";

import { useMediaStore } from "@/store/media-store";
import { Play, Plus, BookAudio, Library, Trash2 } from "lucide-react";
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

      <div className="flex items-center justify-between relative z-10">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tighter text-pf-on-surface flex items-center gap-3">
          <BookAudio className="text-pf-primary" size={24} />
          Focus Media
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
      <form onSubmit={handlePlayNow} className="flex gap-2 relative z-10">
        <input 
          type="text" 
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Paste Spotify, YouTube, or SoundCloud link..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-pf-on-surface placeholder:text-white/20 focus:outline-none focus:border-pf-primary transition-colors"
        />
        <button 
          type="submit"
          className="bg-pf-primary hover:bg-[#ff5446] text-[#5c0002] px-6 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,107,107,0.3)] hover:shadow-[0_0_25px_rgba(255,107,107,0.5)] active:scale-95"
          title="Play Now"
        >
          <Play size={18} className="fill-[#5c0002]" />
        </button>
        <button 
          type="button"
          onClick={handleSaveCustom}
          disabled={isFetching}
          className="bg-pf-surface-bright/20 hover:bg-pf-surface-bright/30 text-pf-on-surface px-6 rounded-xl font-bold transition-all border border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
          title="Save to Library"
        >
          {isFetching ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        </button>
      </form>

      {/* Library Grid */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 relative z-10 custom-scrollbar">
        {currentList.length === 0 && showSaved && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
            <Library size={32} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">No saved playlists</p>
          </div>
        )}

        {currentList.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 p-3 rounded-xl transition-all cursor-pointer group/item"
            onClick={() => playMedia(item.url)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/5 group-hover/item:border-pf-primary/50 transition-colors">
                <Play size={14} className="text-pf-primary opacity-50 group-hover/item:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm text-pf-on-surface truncate pr-4">
                  {item.title}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#66d9cc] font-bold opacity-70">
                  {item.platform}
                </span>
              </div>
            </div>
            
            {/* Quick Save button for presets */}
            {!showSaved ? (
              <button 
                onClick={(e) => { e.stopPropagation(); savePlaylist(item.title, item.url, item.platform); }}
                className="opacity-0 group-hover/item:opacity-100 p-2 text-white/40 hover:text-pf-primary hover:bg-white/5 rounded-lg transition-all"
                title="Save to Library"
              >
                <Plus size={16} />
              </button>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); removePlaylist(item.id); }}
                className="opacity-0 group-hover/item:opacity-100 p-2 text-white/40 hover:text-pf-error hover:bg-white/5 rounded-lg transition-all"
                title="Remove from Library"
              >
                <Trash2 size={16} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
