import { Elysia, t } from 'elysia';
import { db } from '../db';
import { tasks, projects, userPlaylists } from '../schema';
import { eq, and } from 'drizzle-orm';

export const taskController = new Elysia({ prefix: '/tasks' })
  .get('/', async ({ userId }: any) => {
    return await db
      .select({
        id: tasks.id,
        content: tasks.content,
        priority: tasks.priority,
        estPomos: tasks.estPomos,
        actPomos: tasks.actPomos,
        isCompleted: tasks.isCompleted,
        projectId: tasks.projectId,
        projectName: projects.name,
        projectColor: projects.color,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(tasks.userId, userId));
  })
  .post('/', async ({ body, userId }: any) => {
    const [result] = await db.insert(tasks).values({
      userId,
      content: body.content,
      projectId: body.projectId,
      priority: body.priority,
      estPomos: body.estPomos,
    });
    return { success: true, taskId: result.insertId };
  }, {
    body: t.Object({
      content: t.String(),
      projectId: t.Optional(t.Number()),
      priority: t.Enum({ low: 'low', medium: 'medium', high: 'high' }),
      estPomos: t.Number()
    })
  })
  .patch('/:id', async ({ params, body, userId, set }: any) => {
    const taskId = parseInt(params.id);
    
    const [result] = await db.update(tasks)
      .set(body)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    if (result.affectedRows === 0) {
      set.status = 404;
      return { error: 'Task not found or unauthorized' };
    }
    
    return { success: true };
  }, {
    body: t.Partial(t.Object({
      content: t.String(),
      isCompleted: t.Boolean(),
      actPomos: t.Number(),
      projectId: t.Number(),
      priority: t.Enum({ low: 'low', medium: 'medium', high: 'high' })
    }))
  })
  .delete('/:id', async ({ params, userId, set }: any) => {
    const taskId = parseInt(params.id);
    
    const [result] = await db.delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

    if (result.affectedRows === 0) {
      set.status = 404;
      return { error: 'Task not found' };
    }

    return { success: true };
  })
  .group('/projects', (group) =>
    group
      .get('/', async ({ userId }: any) => {
        return await db.select().from(projects).where(eq(projects.userId, userId));
      })
      .post('/', async ({ body, userId }: any) => {
        const [result] = await db.insert(projects).values({ ...body, userId });
        return { success: true, projectId: result.insertId };
      }, {
        body: t.Object({
          name: t.String(),
          color: t.Optional(t.String())
        })
      })
  )
  .group('/media', (group) =>
    group
      .get('/', async ({ userId }: any) => {
        return await db.select().from(userPlaylists).where(eq(userPlaylists.userId, userId));
      })
      .post('/', async ({ body, userId }: any) => {
        const [result] = await db.insert(userPlaylists).values({ ...body, userId });
        return { success: true, id: result.insertId };
      }, {
        body: t.Object({
          title: t.String(),
          url: t.String(),
          platform: t.String()
        })
      })
      .delete('/:id', async ({ params, userId, set }: any) => {
        const [result] = await db.delete(userPlaylists)
          .where(and(eq(userPlaylists.id, parseInt(params.id)), eq(userPlaylists.userId, userId)));
        if (result.affectedRows === 0) {
          set.status = 404;
          return { error: 'Playlist not found' };
        }
        return { success: true };
      })
  );
