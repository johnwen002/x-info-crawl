CREATE TABLE IF NOT EXISTS `github_trendings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`url` text,
	`description` text,
	`language` text,
	`stars` integer,
	`forks` integer,
	`starsToday` integer,
	`created_at` integer
);
