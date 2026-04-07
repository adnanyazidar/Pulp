import { db } from "./db";
import { userBadges, userStats, sessions, tasks, settings, projects, userPlaylists } from "./schema";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: "Time Traveler" | "Consistency" | "Deep Work" | "Task Execution" | "Explorer";
  xpReward: number;
}

export const BADGES: Badge[] = [
  // Time Traveler
  { id: "early_bird", name: "Early Bird", description: "Complete a focus session between 04:00 - 07:00 AM.", category: "Time Traveler", xpReward: 50 },
  { id: "night_owl", name: "Night Owl", description: "Complete a focus session between 11:00 PM - 02:00 AM.", category: "Time Traveler", xpReward: 50 },
  { id: "afternoon_perk", name: "Afternoon Perk", description: "Complete 3 sessions between 13:00 - 16:00.", category: "Time Traveler", xpReward: 100 },
  { id: "morning_glory", name: "Morning Glory", description: "Focus for a total of 2 hours before 10:00 AM.", category: "Time Traveler", xpReward: 150 },
  
  // Consistency
  { id: "first_spark", name: "First Spark", description: "Complete your first focus session.", category: "Consistency", xpReward: 25 },
  { id: "week_warrior", name: "Week Warrior", description: "Maintain a 7-day focus streak.", category: "Consistency", xpReward: 200 },
  { id: "the_habitual", name: "The Habitual", description: "Maintain a 30-day focus streak.", category: "Consistency", xpReward: 500 },
  { id: "unstoppable", name: "Unstoppable", description: "Maintain a 100-day focus streak.", category: "Consistency", xpReward: 1000 },
  
  // Deep Work
  { id: "deep_diver", name: "Deep Diver", description: "Complete a full cycle of 4 sessions without skipping or canceling.", category: "Deep Work", xpReward: 150 },
  { id: "hyper_focus", name: "Hyper Focus", description: "Focus for a total of 5 hours in a single day.", category: "Deep Work", xpReward: 300 },
  { id: "zen_master", name: "Zen Master", description: "Complete a session without ever pressing 'Pause'.", category: "Deep Work", xpReward: 100 },
  { id: "the_peak", name: "The Peak", description: "Complete 12 focus sessions in a single day.", category: "Deep Work", xpReward: 500 },
  
  // Task Execution
  { id: "the_closer", name: "The Closer", description: "Complete 10 different tasks in one week.", category: "Task Execution", xpReward: 200 },
  { id: "the_organizer", name: "The Organizer", description: "Complete tasks in 3 different project categories.", category: "Task Execution", xpReward: 100 },
  { id: "precise_planner", name: "Precise Planner", description: "Complete a task where Actual Pomos match Estimated Pomos.", category: "Task Execution", xpReward: 150 },
  { id: "clean_sweep", name: "Clean Sweep", description: "Complete all tasks on your list for today.", category: "Task Execution", xpReward: 250 },
  
  // Explorer
  { id: "rain_lover", name: "Rain Lover", description: "Focus for 1 hour with 'Rain' ambient sound.", category: "Explorer", xpReward: 100 },
  { id: "melomaniac", name: "Melomaniac", description: "Add 3 different playlists to your Media Hub.", category: "Explorer", xpReward: 50 },
  { id: "the_stylist", name: "The Stylist", description: "Change your accent color in the Settings menu.", category: "Explorer", xpReward: 25 },
  { id: "first_feedback", name: "First Feedback", description: "Provide feedback or report a bug.", category: "Explorer", xpReward: 50 },
];

/**
 * Main function to check and unlock badges
 */
export async function checkAndUnlockBadges(userId: number, trigger: string, payload?: any) {
  const newlyUnlocked: Badge[] = [];
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  // Get current badges to avoid re-unlocking
  const existingRecords = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  const existingIds = new Set(existingRecords.map(r => r.badgeId));

  const unlock = async (id: string) => {
    if (existingIds.has(id)) return;
    const badge = BADGES.find(b => b.id === id);
    if (!badge) return;

    try {
      await db.insert(userBadges).values({ userId, badgeId: id });
      
      // Award XP
      await db.update(userStats)
        .set({ xp: sql`${userStats.xp} + ${badge.xpReward}` })
        .where(eq(userStats.userId, userId));
        
      newlyUnlocked.push(badge);
    } catch (e) {
      // Ignore duplicates if race condition
    }
  };

  if (trigger === 'session_complete' && payload.sessionType === 'focus') {
    const hour = triggerTime(payload.timestamp || new Date()).getHours();
    
    // 1. Early Bird
    if (hour >= 4 && hour < 7) await unlock("early_bird");
    
    // 2. Night Owl
    if (hour >= 23 || hour < 2) await unlock("night_owl");

    // 3. Afternoon Perk (3 sessions 13:00-16:00 today)
    if (hour >= 13 && hour < 16) {
      const afternoonSessions = await db.select().from(sessions).where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.sessionType, 'focus'),
          gte(sessions.createdAt, new Date(new Date().setHours(13, 0, 0, 0))),
          lte(sessions.createdAt, new Date(new Date().setHours(16, 0, 0, 0)))
        )
      );
      if (afternoonSessions.length >= 3) await unlock("afternoon_perk");
    }

    // 4. Morning Glory (2h focus before 10:00 AM)
    if (hour < 10) {
      const morningRes = await db.select({ total: sql<number>`SUM(${sessions.duration})` }).from(sessions).where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.sessionType, 'focus'),
          gte(sessions.createdAt, new Date(new Date().setHours(0, 0, 0, 0))),
          lte(sessions.createdAt, new Date(new Date().setHours(10, 0, 0, 0)))
        )
      );
      if ((morningRes[0]?.total || 0) >= 120 * 60) await unlock("morning_glory");
    }

    // 11. Zen Master
    if (!payload.wasPaused) await unlock("zen_master");

    // 12. The Peak (12 sessions today)
    const dailySessions = await db.select().from(sessions).where(
      and(
        eq(sessions.userId, userId),
        gte(sessions.createdAt, todayStart),
        lte(sessions.createdAt, todayEnd)
      )
    );
    if (dailySessions.length >= 12) await unlock("the_peak");

    // 10. Hyper Focus (5h focus today)
    const todayFocus = dailySessions.reduce((acc, s) => acc + (s.sessionType === 'focus' ? s.duration : 0), 0);
    if (todayFocus >= 300 * 60) await unlock("hyper_focus");

    // 17. Rain Lover (1h total with rain sound)
    if (payload.ambientSound === 'rain') {
      const rainRes = await db.select({ total: sql<number>`SUM(${sessions.duration})` }).from(sessions).where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.ambientSound, 'rain')
        )
      );
      if ((rainRes[0]?.total || 0) >= 60 * 60) await unlock("rain_lover");
    }

    // 9. Deep Diver (4 sessions in a row)
    const lastFour = await db.select().from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.sessionType, 'focus')))
      .orderBy(desc(sessions.createdAt))
      .limit(4);
    
    if (lastFour.length === 4) {
      const allNotPaused = lastFour.every(s => !s.wasPaused);
      // Check if they are within a reasonable time (e.g., 4 hours)
      const first = lastFour[0].createdAt;
      const fourth = lastFour[3].createdAt;
      if (first && fourth) {
        const timeDiff = first.getTime() - fourth.getTime();
        if (allNotPaused && timeDiff > 0 && timeDiff < 4 * 60 * 60 * 1000) {
          await unlock("deep_diver");
        }
      }
    }
  }

  // Consistency check (always run after stats update)
  if (trigger === 'stats_updated') {
    const stats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    if (stats[0]) {
      const streak = stats[0].currentStreak || 0;
      await unlock("first_spark");
      if (streak >= 7) await unlock("week_warrior");
      if (streak >= 30) await unlock("the_habitual");
      if (streak >= 100) await unlock("unstoppable");
    }
  }

  if (trigger === 'task_completed') {
    // 15. Precise Planner
    if (payload.actPomos === payload.estPomos) await unlock("precise_planner");

    // 14. The Organizer (Work, Study, Personal)
    const completedTasks = await db.select({
      projectName: projects.name
    }).from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.userId, userId), eq(tasks.isCompleted, true)));
    
    const projectNames = new Set(completedTasks.map(t => t.projectName));
    if (projectNames.has('Work') && projectNames.has('Study') && projectNames.has('Personal')) {
      await unlock("the_organizer");
    }

    // 16. Clean Sweep
    const remainingTasks = await db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.isCompleted, false)));
    if (remainingTasks.length === 0) await unlock("clean_sweep");
  }

  if (trigger === 'settings_updated') {
    await unlock("the_stylist");
  }

  if (trigger === 'media_updated') {
    const playlists = await db.select().from(userPlaylists).where(eq(userPlaylists.userId, userId));
    if (playlists.length >= 3) await unlock("melomaniac");
  }

  if (trigger === 'task_completed') {
    // 13. The Closer (10 tasks in one week)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const countRes = await db.select({ count: sql<number>`COUNT(DISTINCT ${tasks.id})` }).from(tasks).where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.isCompleted, true),
        gte(tasks.createdAt, sevenDaysAgo)
      )
    );
    if ((countRes[0]?.count || 0) >= 10) await unlock("the_closer");
  }

  if (trigger === 'feedback_submitted') {
    await unlock("first_feedback");
  }

  return newlyUnlocked;
}

function triggerTime(d: Date | string) {
  return typeof d === 'string' ? new Date(d) : d;
}
