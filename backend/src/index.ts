import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { users, settings, userStats, projects, tasks, sessions, userPlaylists } from "./schema";
import { eq, sql } from 'drizzle-orm';

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

        // 4. Insert Default Project
        await tx.insert(projects).values({
          userId,
          name: 'Work',
          color: '#FF6B6B',
        });

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
              .post('/', async ({ body, userId }) => {
                const [insertResult] = await db.insert(projects).values({
                  userId,
                  name: body.name,
                  color: body.color || '#FFFFFF',
                });
                return { id: insertResult.insertId, ...body };
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
                // To do: ensure it belongs to userId
                await db.delete(userPlaylists).where(eq(userPlaylists.id, parseInt(params.id)));
                return { success: true, id: params.id };
              }, {
                params: t.Object({ id: t.String() })
              })
          )
          .patch('/:id', async ({ params, body, userId }) => {
            await db.update(tasks)
              .set(body as any)
              .where(eq(tasks.id, parseInt(params.id)));
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
             // To do: ensure it belongs to userId
             await db.delete(tasks).where(eq(tasks.id, parseInt(params.id)));
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
      .post('/sessions', async ({ body, userId }) => {
         const result = await db.transaction(async (tx) => {
            await tx.insert(sessions).values({
               userId,
               duration: body.duration,
               sessionType: body.sessionType,
               taskId: body.taskId,
               rating: body.rating,
            });

            // Update user stats naive logic
            const userStatRecords = await tx.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
            const current = userStatRecords[0];
            if (current) {
                const xpGained = body.sessionType === 'focus' ? Math.floor(body.duration / 60) * 10 : 0;
                
                let newXp = (current.xp || 0) + xpGained;
                let newLevel = current.level || 1;
                let levelUp = false;

                // 100 XP per level
                if (newXp >= newLevel * 100) {
                    newLevel++;
                    levelUp = true;
                }

                await tx.update(userStats).set({
                   xp: newXp,
                   level: newLevel,
                   totalFocusTime: (current.totalFocusTime || 0) + (body.sessionType === 'focus' ? body.duration : 0)
                }).where(eq(userStats.userId, userId));

                return { xpGained, levelUp };
            }
            return { xpGained: 0, levelUp: false };
         });

        return { success: true, gamification: result };
      }, {
        body: t.Object({
          duration: t.Number(),
          sessionType: t.String(),
          taskId: t.Optional(t.Number()),
          rating: t.Optional(t.Number())
        })
      })
  )
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
