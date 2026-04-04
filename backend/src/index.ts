import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'super-secret-pulp',
    })
  )
  .onError(({ error, code }) => {
    console.error('🦊 Elysia Error:', code, error);
    return { error: (error as any).message || 'Unknown error' };
  })
  .post('/auth/register', async ({ body, jwt }) => {
    const { username, email } = body;
    const userId = 101; 
    const token = await jwt.sign({ userId });
    return { token, user: { id: userId, username, email } };
  }, {
    body: t.Object({
      username: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post('/auth/login', async ({ body, jwt }) => {
    const { email } = body;
    const userId = 101;
    const token = await jwt.sign({ userId });
    return { token, user: { id: userId, username: "testuser", email } };
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
        return { 
          user: { id: userId, username: "fixed_v102", email: "final_v102@email.com" }, 
          stats: { userId, totalFocusMinutes: 120, totalSessions: 5, currentStreak: 3 }, 
          settings: { userId, focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 } 
        };
      })
      .group('/tasks', (tasks) =>
        tasks
          .get('/', async () => [])
          .post('/', async ({ body }) => ({ id: Math.floor(Math.random() * 1000), success: true, ...body }), {
            body: t.Object({
              content: t.String(),
              projectId: t.Optional(t.Number()),
              priority: t.Optional(t.String()),
              estPomos: t.Optional(t.Number()),
              actPomos: t.Optional(t.Number()),
              isCompleted: t.Optional(t.Boolean()),
            })
          })
          .group('/projects', (projects) => 
            projects
              .get('/', async () => [
                { id: 1, name: "Work", color: "#FF6B6B" },
                { id: 2, name: "Study", color: "#66D9CC" },
                { id: 3, name: "Personal", color: "#A2C9FF" }
              ])
              .post('/', async ({ body }) => ({ id: Math.floor(Math.random() * 1000), ...body }), {
                body: t.Object({
                  name: t.String(),
                  color: t.Optional(t.String())
                })
              })
          )
          .group('/media', (media) =>
            media
              .get('/', async () => [])
              .post('/', async ({ body }) => ({ id: "custom-" + Math.floor(Math.random() * 1000), ...body }), {
                body: t.Object({
                  title: t.String(),
                  url: t.String(),
                  platform: t.String()
                })
              })
              .delete('/:id', async ({ params }) => ({ success: true, id: params.id }), {
                params: t.Object({ id: t.String() })
              })
          )
          .patch('/:id', async ({ params, body }) => ({ success: true, id: params.id, ...body }), {
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
          .delete('/:id', async ({ params }) => ({ success: true, id: params.id }), {
            params: t.Object({ id: t.String() })
          })
      )
      .get('/settings', async ({ userId }) => {
        return { userId, focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, alarmSound: "bell", ambientSound: "none", accentColor: "#FF6B6B", autoStartBreaks: false };
      })
      .patch('/settings', async () => {
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
      .post('/sessions', async () => {
        return { success: true, gamification: { xpGained: 10, levelUp: false } };
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
  `🦊 Elysia (MOCK MODE) is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
