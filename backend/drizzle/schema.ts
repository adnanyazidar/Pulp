import { mysqlTable, mysqlSchema, type AnyMySqlColumn, foreignKey, unique, int, varchar, timestamp, text, mysqlEnum, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const projects = mysqlTable("projects", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id),
	name: varchar({ length: 100 }).notNull(),
	color: varchar({ length: 20 }).default('coral'),
},
(table) => [
	unique("user_project_unique").on(table.userId, table.name),
]);

export const sessions = mysqlTable("sessions", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id),
	taskId: int("task_id").references(() => tasks.id),
	duration: int().notNull(),
	sessionType: varchar("session_type", { length: 50 }).notNull(),
	rating: int(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const settings = mysqlTable("settings", {
	userId: int("user_id").notNull().references(() => users.id),
	focusDuration: int("focus_duration").default(25),
	shortBreakDuration: int("short_break_duration").default(5),
	longBreakDuration: int("long_break_duration").default(15),
	alarmSound: varchar("alarm_sound", { length: 50 }).default('digital'),
	ambientSound: varchar("ambient_sound", { length: 50 }).default('none'),
	accentColor: varchar("accent_color", { length: 20 }).default('coral'),
	autoStartBreaks: tinyint("auto_start_breaks").default(0),
});

export const tasks = mysqlTable("tasks", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id),
	projectId: int("project_id").references(() => projects.id),
	content: text().notNull(),
	priority: mysqlEnum(['low','medium','high']).default('low'),
	actPomos: int("act_pomos").default(0),
	estPomos: int("est_pomos").default(1),
	isCompleted: tinyint("is_completed").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	username: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	unique("users_email_unique").on(table.email),
]);

export const userPlaylists = mysqlTable("user_playlists", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id),
	platform: mysqlEnum(['youtube','spotify','soundcloud']),
	url: text().notNull(),
	title: varchar({ length: 150 }).notNull(),
});

export const userStats = mysqlTable("user_stats", {
	userId: int("user_id").notNull().references(() => users.id),
	xp: int().default(0),
	level: int().default(1),
	totalFocusTime: int("total_focus_time").default(0),
	currentStreak: int("current_streak").default(0),
	bestStreak: int("best_streak").default(0),
	lastActiveAt: timestamp("last_active_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});
