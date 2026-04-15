import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { hash, compare } from "bcryptjs";
import { db, validateConnection } from "./db";
import { users, settings, userStats, projects, tasks, sessions, userPlaylists, userBadges } from "./schema";
import { eq, sql, and, desc } from 'drizzle-orm';
import { checkAndUnlockBadges } from "./badges";

export const app = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'super-secret-pulp',
    })
  )
  .get('/api/health', async () => {
    console.log('🩺 Health Check: Checking database connection...');
    const hasDbUrl = !!process.env.DATABASE_URL;
    const result = await validateConnection();
    
    if (result.ok) {
      return { 
        status: 'ok', 
        database: 'pulp_ultra', 
        tablesFound: result.tables,
        hasDbUrl,
        timestamp: new Date().toISOString()
      };
    }
    
    console.error('❌ Health Check Failed:', result.error, result.code);
    return { 
      status: 'error', 
      message: result.error, 
      code: result.code,
      hasDbUrl,
      hint: 'Check DATABASE_URL and TiDB Cloud IP Access List (0.0.0.0/0)'
    };
  })
  .onError(({ error, code, request }) => {
    const url = new URL(request.url);
    const rootCause = (error as any).cause;
    const errorMessage = rootCause?.message || (error as any).message || 'Unknown error';
    const errorCode = rootCause?.code || (error as any).code;
    console.error(`🦊 Elysia Error [${code}] at ${url.pathname}:`, errorMessage, errorCode);
    
    // Provide a cleaner error message for known DB issues
    if (errorMessage.includes('Failed query') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ETIMEDOUT')) {
      return { 
        error: "Database connection failed. Please check production environment variables.",
        code: 500,
        details: errorMessage,
        dbErrorCode: errorCode,
      };
    }

    return { error: errorMessage, code };
  })
  .post('/auth/register', async ({ body, jwt, set }) => {
    const { username, email, password } = body;

    try {
      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        set.status = 400;
        return { error: "Email already in use" };
      }

      const passwordHash = await hash(password, 10);

      const result = await db.transaction(async (tx) => {
        // 1. Insert User
        const [insertUserResult] = await tx.insert(users).values({
          username,
          email,
          passwordHash,
        });
        const userId = insertUserResult.insertId;

        // 2. Insert Default Settings
        await tx.insert(settings).values({
          userId,
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
        });

        // 3. Insert Initial Stats
        await tx.insert(userStats).values({
          userId,
          level: 1,
          xp: 0,
          currentStreak: 0,
        });

        // 4. Insert Default Projects
        const defaultProjects = [
          { name: 'Work', color: '#FF6B6B' },
          { name: 'Study', color: '#66D9CC' },
          { name: 'Personal', color: '#A2C9FF' },
        ];
        
        for (const p of defaultProjects) {
          // Check if it already exists for some weird reason (e.g., partial registration retry)
          const existing = await tx.select().from(projects).where(
            and(
              eq(projects.userId, userId),
              eq(projects.name, p.name)
            )
          ).limit(1);

          if (existing.length === 0) {
            await tx.insert(projects).values({
              userId,
              name: p.name,
              color: p.color,
            });
          }
        }

        return { id: userId, username, email };
      });

      const token = await jwt.sign({ userId: result.id });
      return { token, user: result };
    } catch (err: any) {
      set.status = 500;
      return { error: err.message };
    }
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post('/auth/login', async ({ body, jwt, set }) => {
    const { email, password } = body;
    
    const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userRecords.length === 0) {
      set.status = 400;
      return { error: "Invalid email or password" };
    }
    const user = userRecords[0];
    if (!user) {
      set.status = 400;
      return { error: "Invalid email or password" };
    }

    const isMatch = await compare(password, user.passwordHash);
    if (!isMatch) {
      set.status = 400;
      return { error: "Invalid email or password" };
    }

    const token = await jwt.sign({ userId: user.id });
    return { token, user: { id: user.id, username: user.username, email: user.email } };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })
  .group('/api', (api) => 
    api
      .derive(async ({ jwt, headers, set }) => {
        const authorization = headers['authorization'];
        if (!authorization?.startsWith('Bearer ')) {
          set.status = 401;
          throw new Error('Unauthorized');
        }
        const token = authorization.slice(7);
        const payload = await jwt.verify(token);
        if (!payload) {
          set.status = 401;
          throw new Error('Invalid token');
        }
        return { userId: payload.userId as number };
      })
      .get('/me', async ({ userId }) => {
        const userRecords = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const statsRecords = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
        const settingsRecords = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);

        const user = userRecords[0];
        const stats = statsRecords[0];
        const sett = settingsRecords[0];

        const badgesRecords = await db.select().from(userBadges).where(eq(userBadges.userId, userId));

        return { 
          user: user ? { id: user.id, username: user.username, email: user.email } : null,
          stats: stats ? stats : null,
          settings: sett ? sett : null,
          badges: badgesRecords || [],
        };
      })
      .post('/me/reset', async ({ userId }) => {
        // Delete child records first to satisfy foreign key constraints
        await db.delete(sessions).where(eq(sessions.userId, userId));
        await db.delete(tasks).where(eq(tasks.userId, userId));
        await db.delete(projects).where(eq(projects.userId, userId));
        await db.delete(userPlaylists).where(eq(userPlaylists.userId, userId));
        await db.delete(userBadges).where(eq(userBadges.userId, userId));

        // Reset stats
        await db.update(userStats).set({
          xp: 0,
          level: 1,
          totalFocusTime: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastActiveAt: new Date(),
        }).where(eq(userStats.userId, userId));

        // Reset settings
        await db.update(settings).set({
          focusDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          alarmSound: 'digital',
          ambientSound: 'none',
          accentColor: 'coral',
          autoStartBreaks: false,
        }).where(eq(settings.userId, userId));

        // Recreate default projects
        const defaultProjects = [
          { name: 'Work', color: '#FF6B6B' },
          { name: 'Study', color: '#66D9CC' },
          { name: 'Personal', color: '#A2C9FF' },
        ];
        for (const p of defaultProjects) {
          await db.insert(projects).values({
            userId,
            name: p.name,
            color: p.color,
          });
        }

        return { success: true };
      })
      .get('/badges', async ({ userId }) => {
        return await db.select().from(userBadges).where(eq(userBadges.userId, userId));
      })
      .group('/tasks', (tasksRoute) =>
        tasksRoute
          .get('/', async ({ userId }) => {
            return await db.select().from(tasks).where(eq(tasks.userId, userId));
          })
          .post('/', async ({ body, userId }) => {
            const [insertResult] = await db.insert(tasks).values({
              userId,
              content: body.content,
              projectId: body.projectId,
              priority: (body.priority as any) || 'low',
              estPomos: body.estPomos || 1,
            });
            return { id: insertResult.insertId, success: true, ...body };
          }, {
            body: t.Object({
              content: t.String(),
              projectId: t.Optional(t.Number()),
              priority: t.Optional(t.String()),
              estPomos: t.Optional(t.Number()),
              actPomos: t.Optional(t.Number()),
              isCompleted: t.Optional(t.Boolean()),
            })
          })
          .group('/projects', (projectsRoute) => 
            projectsRoute
              .get('/', async ({ userId }) => {
                return await db.select().from(projects).where(eq(projects.userId, userId));
              })
              .post('/', async ({ body, userId, set }) => {
                // Defensive duplicate check (fallback to DB constraint)
                const existing = await db.select().from(projects).where(
                  and(
                    eq(projects.userId, userId),
                    eq(projects.name, body.name)
                  )
                ).limit(1);

                if (existing.length > 0 && existing[0]) {
                  set.status = 200; // Return existing but don't error
                  return { 
                    id: existing[0].id, 
                    ...body, 
                    alreadyExisted: true,
                    message: "Project already exists" 
                  };
                }

                try {
                  const [insertResult] = await db.insert(projects).values({
                    userId,
                    name: body.name,
                    color: body.color || '#FFFFFF',
                  });
                  return { id: insertResult.insertId, ...body };
                } catch (err: any) {
                  // Catch the unique constraint violation just in case
                  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                    const finalExisting = await db.select().from(projects).where(
                      and(
                        eq(projects.userId, userId),
                        eq(projects.name, body.name)
                      )
                    ).limit(1);
                    return { 
                      id: finalExisting[0]?.id, 
                      ...body, 
                      alreadyExisted: true 
                    };
                  }
                  throw err;
                }
              }, {
                body: t.Object({
                  name: t.String(),
                  color: t.Optional(t.String())
                })
              })
          )
          .group('/media', (mediaRoute) =>
            mediaRoute
              .get('/', async ({ userId }) => {
                return await db.select().from(userPlaylists).where(eq(userPlaylists.userId, userId));
              })
              .post('/', async ({ body, userId }) => {
                const [insertResult] = await db.insert(userPlaylists).values({
                  userId,
                  title: body.title,
                  url: body.url,
                  platform: body.platform as any,
                });
                const newlyUnlocked = await checkAndUnlockBadges(userId, 'media_updated');

                return { id: insertResult.insertId, newlyUnlocked, ...body };
              }, {
                body: t.Object({
                  title: t.String(),
                  url: t.String(),
                  platform: t.String()
                })
              })
              .delete('/:id', async ({ params, userId }) => {
                await db.delete(userPlaylists).where(
                  and(
                    eq(userPlaylists.id, parseInt(params.id)),
                    eq(userPlaylists.userId, userId)
                  )
                );
                return { success: true, id: params.id };
              }, {
                params: t.Object({ id: t.String() })
              })
          )
          .patch('/:id', async ({ params, body, userId }) => {
            await db.update(tasks)
              .set(body as any)
              .where(
                and(
                  eq(tasks.id, parseInt(params.id)),
                  eq(tasks.userId, userId)
                )
              );
            
            const newlyUnlocked = await checkAndUnlockBadges(userId, 'task_completed', body);
            
            return { success: true, id: params.id, newlyUnlocked, ...body };
          }, {
            params: t.Object({ id: t.String() }),
            body: t.Partial(t.Object({
              content: t.String(),
              projectId: t.Number(),
              priority: t.String(),
              estPomos: t.Number(),
              actPomos: t.Number(),
              isCompleted: t.Boolean(),
            }))
          })
          .delete('/:id', async ({ params, userId }) => {
             await db.delete(tasks).where(
               and(
                 eq(tasks.id, parseInt(params.id)),
                 eq(tasks.userId, userId)
               )
             );
             return { success: true, id: params.id };
          }, {
            params: t.Object({ id: t.String() })
          })
      )
      .get('/settings', async ({ userId }) => {
        const userSettings = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
        return userSettings.length > 0 ? userSettings[0] : null;
      })
      .patch('/settings', async ({ body, userId }) => {
        await db.update(settings).set(body).where(eq(settings.userId, userId));
        const newlyUnlocked = await checkAndUnlockBadges(userId, 'settings_updated', body);
        return { success: true, newlyUnlocked };
      }, {
        body: t.Partial(t.Object({
          focusDuration: t.Number(),
          shortBreakDuration: t.Number(),
          longBreakDuration: t.Number(),
          alarmSound: t.String(),
          ambientSound: t.String(),
          accentColor: t.String(),
          autoStartBreaks: t.Boolean()
        }))
      })
      .post('/sessions/complete', async ({ body, userId }) => {
        const { duration, sessionType, taskId, rating } = body;
        
        return await db.transaction(async (tx) => {
          // 1. Insert session record
          await tx.insert(sessions).values({
            userId,
            taskId,
            duration,
            sessionType,
            rating,
            wasPaused: body.wasPaused || false,
            ambientSound: body.ambientSound || 'none',
          });

          // 2. If it's a focus session, update task and stats
          if (sessionType === 'focus') {
            // Increment actPomos
            if (taskId) {
              await tx.update(tasks)
                .set({ actPomos: sql`${tasks.actPomos} + 1` })
                .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
            }

            // Update user stats (XP, level, streak)
            const statsRecords = await tx.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
            const stats = statsRecords[0];

            if (stats) {
              const minutes = Math.round(duration / 60);
              const xpGained = minutes * 10;
              const newXp = (stats.xp || 0) + xpGained;
              const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
              const newTotalFocusTime = (stats.totalFocusTime || 0) + minutes;

              // Streak logic (Timezone-Aware)
              const tzOffset = (body as any).tzOffset || '+00:00';
              const sign = tzOffset.startsWith('-') ? -1 : 1;
              const parts = tzOffset.replace(/[+-]/, '').split(':');
              const offsetHours = (parseInt(parts[0]) || 0) * sign;
              const offsetMinutes = (parseInt(parts[1]) || 0) * sign;
              
              // Get today's date in user's timezone using DATE_ADD
              const [todayResult] = await tx.execute(sql`
                SELECT DATE(DATE_ADD(DATE_ADD(NOW(), INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE)) as local_today
              `);
              const localTodayStr = (todayResult as any)[0].local_today;
              const localToday = new Date(localTodayStr);
              
              // Get last active date in user's timezone using DATE_ADD
              let localLastActive = null;
              if (stats.lastActiveAt) {
                const [lastActiveResult] = await tx.execute(sql`
                  SELECT DATE(DATE_ADD(DATE_ADD(${stats.lastActiveAt}, INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE)) as local_last_active
                `);
                const lastActiveStr = (lastActiveResult as any)[0].local_last_active;
                localLastActive = new Date(lastActiveStr);
              }

              let newStreak = stats.currentStreak || 0;

              if (!localLastActive || localLastActive.getTime() !== localToday.getTime()) {
                const yesterday = new Date(localToday);
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (localLastActive && localLastActive.getTime() === yesterday.getTime()) {
                  newStreak += 1;
                } else {
                  newStreak = 1;
                }
              }

              await tx.update(userStats)
                .set({
                  xp: newXp,
                  level: newLevel,
                  totalFocusTime: newTotalFocusTime,
                  currentStreak: newStreak,
                  lastActiveAt: new Date() // Still store server time, but logic above converts it
                })
                .where(eq(userStats.userId, userId));

              // Trigger badge check after potential stats update
              const sessionBadges = await checkAndUnlockBadges(userId, 'session_complete', {
                ...body,
                timestamp: new Date()
              });
              
              const consistencyBadges = await checkAndUnlockBadges(userId, 'stats_updated');

              return {
                success: true,
                gamification: {
                  xp: newXp,
                  level: newLevel,
                  currentStreak: newStreak,
                  xpGained
                },
                newlyUnlocked: [...sessionBadges, ...consistencyBadges]
              };
            }
          }

          return { success: true, newlyUnlocked: [] };
        });
      }, {
        body: t.Object({
          duration: t.Number(),
          sessionType: t.String(),
          taskId: t.Optional(t.Number()),
          rating: t.Optional(t.Number()),
          wasPaused: t.Optional(t.Boolean()),
          ambientSound: t.Optional(t.String()),
          tzOffset: t.Optional(t.String())
        })
      })
      .get('/analytics/summary', async ({ userId, query }) => {
        const tzOffset = (query as any).tzOffset || '+00:00';
        const sign = tzOffset.startsWith('-') ? -1 : 1;
        const parts = tzOffset.replace(/[+-]/, '').split(':');
        const offsetHours = (parseInt(parts[0]) || 0) * sign;
        const offsetMinutes = (parseInt(parts[1]) || 0) * sign;

        // 1. Daily Aggregates (90 days) - Timezone-Aware using DATE_ADD
        // The date boundary is also computed with DATE_ADD so it matches the user's local date
        let history: Array<{ date: string, minutes: number }> = [];
        try {
          const [rows] = await db.execute(sql`
            SELECT 
              DATE_FORMAT(DATE(DATE_ADD(DATE_ADD(created_at, INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE)), '%Y-%m-%d') as date, 
              CAST(SUM(ROUND(duration / 60)) AS SIGNED) as minutes 
            FROM sessions 
            WHERE user_id = ${userId} 
              AND DATE(DATE_ADD(DATE_ADD(created_at, INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE)) >= DATE_SUB(DATE(DATE_ADD(DATE_ADD(NOW(), INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE)), INTERVAL 90 DAY)
              AND session_type = 'focus'
            GROUP BY DATE(DATE_ADD(DATE_ADD(created_at, INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE))
          `);
          // Convert BigInt from SQL to Number for reliable JS comparison
          history = (rows as unknown as any[]).map((r: any) => ({ date: String(r.date), minutes: Number(r.minutes) }));
        } catch (e: any) {
          console.error("❌ Analytics History Query Error:", e.message);
        }

        let projectDistribution: Array<{ projectId: number, minutes: number }> = [];
        try {
          const [rows] = await db.execute(sql`
            SELECT 
              t.project_id as projectId, 
              CAST(SUM(ROUND(s.duration / 60)) AS SIGNED) as minutes 
            FROM sessions s
            JOIN tasks t ON s.task_id = t.id
            WHERE s.user_id = ${userId} 
              AND s.session_type = 'focus'
            GROUP BY t.project_id
          `);
          projectDistribution = rows as unknown as Array<{ projectId: number, minutes: number }>;
        } catch (e: any) {
          console.error("❌ Analytics Project Query Error:", e.message);
        }

        // 1.7 Hourly Distribution (For Peak Focus) - Timezone-Aware using DATE_ADD
        let hourlyDistribution: Array<{ hour: number, minutes: number }> = [];
        try {
          const [rows] = await db.execute(sql`
            SELECT 
              HOUR(DATE_ADD(DATE_ADD(created_at, INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE)) as hour,
              CAST(SUM(ROUND(duration / 60)) AS SIGNED) as minutes
            FROM sessions
            WHERE user_id = ${userId} 
              AND session_type = 'focus'
              AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY hour
            ORDER BY minutes DESC
          `);
          hourlyDistribution = rows as unknown as Array<{ hour: number, minutes: number }>;
        } catch (e: any) {
          console.error("❌ Analytics Hourly Query Error:", e.message);
        }

        // 2. Fetch current stats for the rest of the summary
        const statsRecords = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
        const stats = statsRecords[0];

        const badgesRecords = await db.select().from(userBadges).where(eq(userBadges.userId, userId));

        // Get local today key to match history bucket using DATE_ADD
        const [todayResult] = await db.execute(sql`
          SELECT DATE_FORMAT(DATE(DATE_ADD(DATE_ADD(NOW(), INTERVAL ${offsetHours} HOUR), INTERVAL ${offsetMinutes} MINUTE)), '%Y-%m-%d') as local_today
        `);
        const todayKey = String((todayResult as any)[0].local_today);
        
        const todayFocus = history.find(h => String(h.date) === todayKey)?.minutes || 0;
        console.log(`📊 Analytics Debug: todayKey=${todayKey}, historyDates=${history.map(h => h.date).join(',')}, todayFocus=${todayFocus}`);

        return {
          todayFocusMinutes: todayFocus,
          currentStreak: stats?.currentStreak || 0,
          level: stats?.level || 1,
          xp: stats?.xp || 0,
          history,
          projectDistribution,
          hourlyDistribution,
          badges: badgesRecords || []
        };
      }, {
        query: t.Object({
          tzOffset: t.Optional(t.String())
        })
      })
      .post('/feedback', async ({ body, userId }) => {
        // In a real app, save to feedback table. 
        // For now, just trigger the badge.
        const newlyUnlocked = await checkAndUnlockBadges(userId, 'feedback_submitted', body);
        return { success: true, newlyUnlocked };
      }, {
        body: t.Object({
          message: t.String(),
          category: t.Optional(t.String())
        })
      })
  );

export type App = typeof app;
