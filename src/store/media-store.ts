import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Playlist {
  id: string;
  title: string;
  url: string;
  platform: 'youtube' | 'spotify' | 'soundcloud' | 'custom';
}

export const PRESET_PLAYLISTS: Playlist[] = [
  { id: "preset-1", title: "Lofi Girl (Live)", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", platform: "youtube" },
  { id: "preset-2", title: "Coffee Shop Radio", url: "https://www.youtube.com/watch?v=e3L1PIY1lN8", platform: "youtube" },
  { id: "preset-3", title: "Deep Focus", url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", platform: "spotify" },
  { id: "preset-4", title: "Classical Essentials", url: "https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0", platform: "spotify" },
];

interface MediaState {
  activeUrl: string | null;
  isPlaying: boolean;
  playlists: Playlist[];
  
  // Actions
  playMedia: (url: string) => void;
  stopMedia: () => void;
  savePlaylist: (title: string, url: string, platform: Playlist['platform']) => void;
  removePlaylist: (id: string) => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      activeUrl: null,
      isPlaying: false,
      playlists: PRESET_PLAYLISTS, // Default list
      
      playMedia: (url) => set({ activeUrl: url, isPlaying: true }),
      stopMedia: () => set({ isPlaying: false, activeUrl: null }), // Nullify to fully stop iframe
      
      savePlaylist: (title, url, platform) => {
        const id = `user-${Date.now()}`;
        set((state) => ({
          playlists: [...state.playlists, { id, title, url, platform }]
        }));
      },
      
      removePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== id)
        }));
      }
    }),
    {
      name: "pomofocus-media",
    }
  )
);
