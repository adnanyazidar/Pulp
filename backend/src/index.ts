import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { users, sessions, tasks, userStats, settings, projects } from "./schema";
import { eq } from "drizzle-orm";
import { addFocusSessionStats } from "./services/gamification";

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'super-secret-pulp',
    })
  )
  .post('/auth/register', async ({ body, jwt, set }) => {
    const { username, email, password } = body;

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      set.status = 400;
      return { error: 'Email already exists' };
    }

    const [result] = await db.insert(users).values({ username, email, password });
    const userId = result.insertId;
    
    // Initialize related tables
    await db.insert(userStats).values({ userId });
    await db.insert(settings).values({ userId });

    const token = await jwt.sign({ userId });
    return { token, user: { id: userId, username, email } };
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post('/auth/login', async ({ body, jwt, set }) => {
    const { email, password } = body;
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];

    if (!user || user.password !== password) {
      set.status = 401;
      return { error: 'Invalid credentials' };
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
        const user = await db.select({ id: users.id, username: users.username, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
        const stats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
        const userSettings = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
        return { user: user[0], stats: stats[0], settings: userSettings[0] };
      })
      .get('/projects', async ({ userId }) => {
        return await db.select().from(projects).where(eq(projects.userId, userId));
      })
      .post('/projects', async ({ userId, body }) => {
        return await db.insert(projects).values({ ...body, userId });
      }, {
        body: t.Object({
          name: t.String(),
          color: t.Optional(t.String())
        })
      })
      .get('/settings', async ({ userId }) => {
        const res = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
        return res[0];
      })
      .patch('/settings', async ({ userId, body }) => {
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
      .post('/sessions', async ({ userId, body }) => {
        const { duration, sessionType, taskId, rating } = body;
        
        await db.insert(sessions).values({
          userId,
          duration,
          sessionType,
          taskId,
          rating
        });
        
        let gamificationResult = null;
        if (sessionType === 'focus') {
          gamificationResult = await addFocusSessionStats(userId, duration);
          
          if (taskId) {
            const taskQuery = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
            if (taskQuery.length > 0) {
               await db.update(tasks).set({ actPomos: (taskQuery[0].actPomos || 0) + 1 }).where(eq(tasks.id, taskId));
            }
          }
        }
        
        return { success: true, gamification: gamificationResult };
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
