import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { users, settings, userStats, projects, tasks, sessions, userPlaylists } from "./schema";
import { eq, sql, and } from 'drizzle-orm';

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'super-secret-pulp',
    })
  )
  .get('/api/health', async () => {
    try {
      const result = await db.execute(sql`SHOW TABLES`);
      return { status: 'ok', database: 'pulp_ultra', tables: result[0] };
    } catch (err: any) {
      console.error('Health Check Error:', err);
      return { status: 'error', error: err.message, code: err.code };
    }
  })
  .onError(({ error, code }) => {
    console.error('🦊 Elysia Error:', code);
    console.error(error);
    return { error: (error as any).message || 'Unknown error' };
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

      const passwordHash = await Bun.password.hash(password);

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

    const isMatch = await Bun.password.verify(password, user.passwordHash);
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

        return { 
          user: user ? { id: user.id, username: user.username, email: user.email } : null,
          stats: stats ? stats : null,
          settings: sett ? sett : null,
        };
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
                return { id: insertResult.insertId, ...body };
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
            return { success: true, id: params.id, ...body };
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
        return { success: true };
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

              // Streak logic (basic)
              const today = new Date();
              const lastActive = stats.lastActiveAt ? new Date(stats.lastActiveAt) : null;
              let newStreak = stats.currentStreak || 0;

              if (!lastActive || lastActive.toDateString() !== today.toDateString()) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastActive && lastActive.toDateString() === yesterday.toDateString()) {
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
                  lastActiveAt: today
                })
                .where(eq(userStats.userId, userId));

              return {
                success: true,
                gamification: {
                  xp: newXp,
                  level: newLevel,
                  currentStreak: newStreak,
                  xpGained
                }
              };
            }
          }

          return { success: true };
        });
      }, {
        body: t.Object({
          duration: t.Number(),
          sessionType: t.String(),
          taskId: t.Optional(t.Number()),
          rating: t.Optional(t.Number())
        })
      })
      .get('/analytics/summary', async ({ userId }) => {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const dateStr = ninetyDaysAgo.toISOString().split('T')[0];

        // 1. Daily Aggregates (90 days)
        const history = await db.select({
          date: sql<string>`DATE(${sessions.createdAt})`,
          minutes: sql<number>`CAST(SUM(ROUND(${sessions.duration} / 60)) AS SIGNED)`
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            sql`${sessions.createdAt} >= ${dateStr}`,
            eq(sessions.sessionType, 'focus')
          )
        )
        .groupBy(sql`DATE(${sessions.createdAt})`);

        // 2. Fetch current stats for the rest of the summary
        const statsRecords = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
        const stats = statsRecords[0];

        const todayKey = new Date().toISOString().split('T')[0];
        const todayFocus = history.find(h => h.date === todayKey)?.minutes || 0;

        return {
          todayFocusMinutes: todayFocus,
          currentStreak: stats?.currentStreak || 0,
          level: stats?.level || 1,
          xp: stats?.xp || 0,
          history
        };
      })
  )
  .listen(3001);

export type App = typeof app;
