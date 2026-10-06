CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`writing_id` text NOT NULL,
	`key` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`size` integer NOT NULL,
	`alt` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`writing_id`) REFERENCES `writing`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `media_writing` ON `media` (`writing_id`);--> statement-breakpoint
CREATE TABLE `published_media` (
	`media_id` text NOT NULL,
	`writing_id` text NOT NULL,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`writing_id`) REFERENCES `writing`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `published_media_lookup` ON `published_media` (`media_id`);--> statement-breakpoint
CREATE TABLE `writing` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`manuscript` text NOT NULL,
	`publication` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`published_revision` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text,
	`last_published_at` text,
	`archived` integer DEFAULT 0 NOT NULL,
	`deleted_at` text,
	`sample` integer DEFAULT 0 NOT NULL,
	`slug_locked` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `writing_slug_unique` ON `writing` (`slug`);--> statement-breakpoint
CREATE INDEX `writing_public_archive` ON `writing` (`archived`,`deleted_at`,`published_at`);