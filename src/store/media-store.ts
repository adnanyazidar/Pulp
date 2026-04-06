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
  isLoading: boolean;
  
  // Actions
  fetchPlaylists: () => Promise<void>;
  playMedia: (url: string) => void;
  stopMedia: () => void;
  savePlaylist: (title: string, url: string, platform: Playlist['platform']) => Promise<void>;
  removePlaylist: (id: string | number) => Promise<void>;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  activeUrl: null,
  isPlaying: false,
  playlists: PRESET_PLAYLISTS,
  isLoading: false,

  fetchPlaylists: async () => {
    set({ isLoading: true });
    try {
      const { getAuthedApi } = await import("@/lib/api");
      const { data, error } = await getAuthedApi().api.tasks.media.get();
      if (error) throw new Error("Failed to fetch playlists");
      if (data) {
        set({ playlists: [...PRESET_PLAYLISTS, ...(data as any[])] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  playMedia: (url) => set({ activeUrl: url, isPlaying: true }),
  stopMedia: () => set({ isPlaying: false, activeUrl: null }),
  
  savePlaylist: async (title, url, platform) => {
    try {
      const { getAuthedApi } = await import("@/lib/api");
      const { error } = await getAuthedApi().api.tasks.media.post({ title, url, platform: platform as string });
      if (error) throw new Error("Failed to save playlist");
      await get().fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  },
  
  removePlaylist: async (id) => {
    if (typeof id === 'string' && id.startsWith('preset-')) return;

    try {
      const { getAuthedApi } = await import("@/lib/api");
      const { error } = await (getAuthedApi().api.tasks.media as any)[id.toString()].delete();
      if (error) throw new Error("Failed to remove playlist");
      await get().fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  }
}));
