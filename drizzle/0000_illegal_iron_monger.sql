CREATE TABLE `movies` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`tmdb_id` text NOT NULL,
	`emojis` text NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `upvotes` (
	`id` text PRIMARY KEY NOT NULL,
	`from_user` text,
	`for_movie` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`from_user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`for_movie`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `title_idx` ON `movies` (`title`);--> statement-breakpoint
CREATE INDEX `from_user_idx` ON `upvotes` (`from_user`);--> statement-breakpoint
CREATE INDEX `for_movie_idx` ON `upvotes` (`for_movie`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_movie_unq` ON `upvotes` (`from_user`,`for_movie`);