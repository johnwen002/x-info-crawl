PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_github_trendings` (
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
INSERT INTO `__new_github_trendings`("id", "name", "url", "description", "language", "stars", "forks", "starsToday", "created_at") SELECT "id", "name", "url", "description", "language", "stars", "forks", "starsToday", "created_at" FROM `github_trendings`;--> statement-breakpoint
DROP TABLE `github_trendings`;--> statement-breakpoint
ALTER TABLE `__new_github_trendings` RENAME TO `github_trendings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `github_trendings_url_unique` ON `github_trendings` (`url`);--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`sha` text,
	`created_at` text
);
--> statement-breakpoint
INSERT INTO `__new_articles`("id", "content", "sha", "created_at") SELECT "id", "content", "sha", "created_at" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_sha_unique` ON `articles` (`sha`);