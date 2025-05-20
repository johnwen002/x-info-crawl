CREATE TABLE `github_trendings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`url` text,
	`description` text,
	`language` text,
	`stars` integer,
	`forks` integer,
	`starsToday` integer,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `github_trendings_url_unique` ON `github_trendings` (`url`);--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`sha` text,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_sha_unique` ON `articles` (`sha`);