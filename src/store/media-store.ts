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

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      activeUrl: null,
      isPlaying: false,
      playlists: PRESET_PLAYLISTS,
      isLoading: false,

      fetchPlaylists: async () => {
        set({ isLoading: true });
        try {
          const raw = localStorage.getItem("pulp-auth");
          if (!raw) return;
          const token = JSON.parse(raw)?.state?.token;
          if (!token) return; // Guest mode will just use persisted offline items.

          const { getAuthedApi } = await import("@/lib/api");
          const { data, error } = await getAuthedApi().api.tasks.media.get();
          if (error) throw new Error("Failed to fetch playlists");
          if (data) {
            // Keep local custom playlists alongside the fetched ones
            const currentLocal = get().playlists.filter((p: Playlist) => !p.id.toString().startsWith("preset-") && Number(p.id) < 0);
            set({ playlists: [...PRESET_PLAYLISTS, ...currentLocal, ...(data as any[])] });
          }
        } catch (err) {
          console.error(err);
        } finally {
          set({ isLoading: false });
        }
      },

      playMedia: (url: string) => set({ activeUrl: url, isPlaying: true }),
      stopMedia: () => set({ isPlaying: false, activeUrl: null }),
      
      savePlaylist: async (title: string, url: string, platform: Playlist['platform']) => {
        try {
          const raw = localStorage.getItem("pulp-auth");
          const token = raw ? JSON.parse(raw)?.state?.token : null;

          if (!token) {
            // Guest mode offline saving
            const newOffline = { 
              id: (Math.floor(Math.random() * -1000) - 100).toString(), 
              title, 
              url, 
              platform 
            };
            set({ playlists: [...get().playlists, newOffline] });
            return;
          }

          const { getAuthedApi } = await import("@/lib/api");
          const { error } = await getAuthedApi().api.tasks.media.post({ title, url, platform: platform as string });
          if (error) throw new Error("Failed to save playlist");
          await get().fetchPlaylists();
        } catch (err) {
          console.error(err);
        }
      },
      
      removePlaylist: async (id: string | number) => {
        if (typeof id === 'string' && id.startsWith('preset-')) return;

        try {
          const raw = localStorage.getItem("pulp-auth");
          const token = raw ? JSON.parse(raw)?.state?.token : null;

          if (!token || Number(id) < 0) {
            set({ playlists: get().playlists.filter((p: Playlist) => p.id !== id) });
            if (Number(id) < 0) return;
          }

          const { getAuthedApi } = await import("@/lib/api");
          const { error } = await (getAuthedApi().api.tasks.media as any)[id.toString()].delete();
          if (error) throw new Error("Failed to remove playlist");
          await get().fetchPlaylists();
        } catch (err) {
          console.error(err);
        }
      }
    }),
    {
      name: "pulp-media",
      merge: (persistedState: any, currentState: any) => {
         const merged = { ...currentState, ...persistedState };
         // Merge custom playlists, ignoring any stale presets stored locally
         const customPlaylists = (persistedState.playlists || []).filter((p: Playlist) => !p.id.toString().startsWith("preset-"));
         merged.playlists = [...currentState.playlists, ...customPlaylists];
         return merged;
      }
    }
  )
);
