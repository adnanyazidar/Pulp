import { db } from "../db";
import { userStats } from "../schema";
import { eq } from "drizzle-orm";

const XP_PER_MINUTE = 10;
const XP_FOR_LEVEL_UP_BASE = 100;

export const calculateLevel = (currentXp: number): number => {
  // Simple formula: Level = floor(sqrt(XP / BASE)) + 1
  // E.g. at 0 XP -> Level 1. At 100 XP -> Level 2. At 400 XP -> Level 3.
  return Math.floor(Math.sqrt(currentXp / XP_FOR_LEVEL_UP_BASE)) + 1;
};

export const addFocusSessionStats = async (userId: number, durationSeconds: number) => {
  const durationMinutes = Math.round(durationSeconds / 60);
  const xpGained = durationMinutes * XP_PER_MINUTE;

  const currentStats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  
  if (currentStats.length === 0) {
    // Should not happen if created on reg, but just in case
    const newXp = xpGained;
    const newLevel = calculateLevel(newXp);
    await db.insert(userStats).values({
      userId,
      xp: newXp,
      level: newLevel,
      totalFocusTime: durationMinutes,
    });
    return { xpGained, newLevel, newXp };
  }

  const stats = currentStats[0];
  const newXp = (stats.xp || 0) + xpGained;
  const newLevel = calculateLevel(newXp);
  const newTotalFocusTime = (stats.totalFocusTime || 0) + durationMinutes;

  await db.update(userStats)
    .set({ xp: newXp, level: newLevel, totalFocusTime: newTotalFocusTime })
    .where(eq(userStats.userId, userId));

  return { xpGained, newLevel, newXp };
};
