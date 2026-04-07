"use client";

import { useEffect } from "react";
import { useTimerStore, formatTime } from "@/store/timer-store";
import { useTaskStore } from "@/store/task-store";

export function TabTitleManager() {
  const { timeRemaining, isRunning } = useTimerStore();
  const { tasks, activeTaskId } = useTaskStore();

  useEffect(() => {
    if (!isRunning) {
      document.title = "PomoPulse — Master your rhythm";
      return;
    }

    const activeTask = tasks.find((t) => t.id === activeTaskId);
    const timeStr = formatTime(timeRemaining);
    const taskPart = activeTask ? ` ${activeTask.content}` : "";

    document.title = `(${timeStr})${taskPart} | PomoPulse`;
  }, [timeRemaining, isRunning, activeTaskId, tasks]);

  return null;
}
