"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useTaskStore } from "@/store/task-store";
import { useSettingsStore } from "@/store/settings-store";
import { useStatsStore } from "@/store/stats-store";
import { useMediaStore } from "@/store/media-store";

export function CloudSyncManager() {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchTasks, fetchProjects } = useTaskStore();
  const { fetchSettings } = useSettingsStore();
  const { fetchStats } = useStatsStore();
  const { fetchPlaylists } = useMediaStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initial Hydration
      const initializeCloudData = async () => {
        await Promise.all([
          fetchSettings(),
          fetchProjects().then(() => fetchTasks()), // Projects first for mapping
          fetchStats(),
          fetchPlaylists(),
        ]);
      };

      initializeCloudData();
    }
  }, [isAuthenticated, user, fetchTasks, fetchProjects, fetchSettings, fetchStats, fetchPlaylists]);

  return null; // This component handles side effects only
}
