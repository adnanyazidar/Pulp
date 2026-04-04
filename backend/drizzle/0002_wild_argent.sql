CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20) DEFAULT 'coral',
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`user_id` int NOT NULL,
	`focus_duration` int DEFAULT 25,
	`short_break_duration` int DEFAULT 5,
	`long_break_duration` int DEFAULT 15,
	`alarm_sound` varchar(50) DEFAULT 'digital',
	`ambient_sound` varchar(50) DEFAULT 'none',
	`accent_color` varchar(20) DEFAULT 'coral',
	`auto_start_breaks` boolean DEFAULT false,
	CONSTRAINT `settings_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`platform` enum('youtube','spotify','soundcloud'),
	`url` text NOT NULL,
	`title` varchar(150) NOT NULL,
	CONSTRAINT `user_playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD `task_id` int;--> statement-breakpoint
ALTER TABLE `sessions` ADD `rating` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `project_id` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `priority` enum('low','medium','high') DEFAULT 'low';--> statement-breakpoint
ALTER TABLE `user_stats` ADD `best_streak` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `user_stats` ADD `last_active_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `settings` ADD CONSTRAINT `settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_playlists` ADD CONSTRAINT `user_playlists_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;