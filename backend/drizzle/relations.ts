import { relations } from "drizzle-orm/relations";
import { users, projects, tasks, sessions, settings, userPlaylists, userStats } from "./schema";

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.userId],
		references: [users.id]
	}),
	tasks: many(tasks),
}));

export const usersRelations = relations(users, ({many}) => ({
	projects: many(projects),
	sessions: many(sessions),
	settings: many(settings),
	tasks: many(tasks),
	userPlaylists: many(userPlaylists),
	userStats: many(userStats),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	task: one(tasks, {
		fields: [sessions.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	sessions: many(sessions),
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [tasks.userId],
		references: [users.id]
	}),
}));

export const settingsRelations = relations(settings, ({one}) => ({
	user: one(users, {
		fields: [settings.userId],
		references: [users.id]
	}),
}));

export const userPlaylistsRelations = relations(userPlaylists, ({one}) => ({
	user: one(users, {
		fields: [userPlaylists.userId],
		references: [users.id]
	}),
}));

export const userStatsRelations = relations(userStats, ({one}) => ({
	user: one(users, {
		fields: [userStats.userId],
		references: [users.id]
	}),
}));