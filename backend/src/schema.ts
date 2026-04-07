import { mysqlTable, varchar, int, boolean, timestamp, text, mysqlEnum, uniqueIndex } from 'drizzle-orm/mysql-core';

// 1. USERS
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'), // Untuk tampilan di Top Navbar & Profile
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. USER STATS (Gamification)
export const userStats = mysqlTable('user_stats', {
  userId: int('user_id').primaryKey().references(() => users.id),
  xp: int('xp').default(0),
  level: int('level').default(1),
  totalFocusTime: int('total_focus_time').default(0), 
  currentStreak: int('current_streak').default(0),
  bestStreak: int('best_streak').default(0), // Untuk Dashboard Profile "Elite"
  lastActiveAt: timestamp('last_active_at').defaultNow(), // CRUCIAL: Untuk hitung streak
});

// 3. SETTINGS (Personalization - Sesuai desain Settings)
export const settings = mysqlTable('settings', {
  userId: int('user_id').primaryKey().references(() => users.id),
  focusDuration: int('focus_duration').default(25),
  shortBreakDuration: int('short_break_duration').default(5),
  longBreakDuration: int('long_break_duration').default(15),
  alarmSound: varchar('alarm_sound', { length: 50 }).default('digital'),
  ambientSound: varchar('ambient_sound', { length: 50 }).default('none'),
  accentColor: varchar('accent_color', { length: 20 }).default('coral'), // Untuk Dynamic Theme
  autoStartBreaks: boolean('auto_start_breaks').default(false),
});

// 4. PROJECTS (Untuk grouping Task: Work, Study, Personal)
export const projects = mysqlTable('projects', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 20 }).default('coral'),
}, (t) => ({
  userProjectUnique: uniqueIndex('user_project_unique').on(t.userId, t.name)
}));

// 5. TASKS
export const tasks = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id).notNull(),
  projectId: int('project_id').references(() => projects.id), // Link ke Project
  content: text('content').notNull(),
  priority: mysqlEnum('priority', ['low', 'medium', 'high']).default('low'), // Sesuai desain Tasks
  actPomos: int('act_pomos').default(0),
  estPomos: int('est_pomos').default(1),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. SESSIONS (Analytics & Heatmap)
export const sessions = mysqlTable('sessions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').references(() => users.id).notNull(),
  taskId: int('task_id').references(() => tasks.id), // Link ke Task yang dikerjakan
  duration: int('duration').notNull(), 
  sessionType: varchar('session_type', { length: 50 }).notNull(), 
  rating: int('rating'), 
  wasPaused: boolean('was_paused').default(false),
  ambientSound: varchar('ambient_sound', { length: 50 }).default('none'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. MEDIA HUB (Playlist YouTube/Spotify)
export const userPlaylists = mysqlTable('user_playlists', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id),
  platform: mysqlEnum('platform', ['youtube', 'spotify', 'soundcloud']),
  url: text('url').notNull(),
  title: varchar('title', { length: 150 }).notNull(),
});

// 8. USER BADGES
export const userBadges = mysqlTable('user_badges', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id),
  badgeId: varchar('badge_id', { length: 50 }).notNull(), // Kedepannya bisa diconnect ke table badges statis
  unlockedAt: timestamp('unlocked_at').defaultNow(),
}, (t) => ({
  userBadgeUnique: uniqueIndex('user_badge_unique').on(t.userId, t.badgeId)
}));
