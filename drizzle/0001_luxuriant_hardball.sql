CREATE TABLE `media_jobs` (
	`id` varchar(32) NOT NULL,
	`user_id` int NOT NULL,
	`source` enum('youtube') NOT NULL DEFAULT 'youtube',
	`url` text NOT NULL,
	`mode` enum('video','audio') NOT NULL,
	`scope` enum('video','playlist','channel') NOT NULL,
	`quality` varchar(16) NOT NULL,
	`output_template` text NOT NULL,
	`workers` int NOT NULL,
	`retries` int NOT NULL,
	`status` enum('queued','assigned','running','succeeded','failed','cancelled') NOT NULL DEFAULT 'queued',
	`output_url` text,
	`failure_reason` text,
	`worker_reference` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`started_at` timestamp,
	`completed_at` timestamp,
	CONSTRAINT `media_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `media_jobs_user_created_idx` ON `media_jobs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `media_jobs_status_created_idx` ON `media_jobs` (`status`,`created_at`);