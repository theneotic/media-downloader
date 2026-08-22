CREATE TABLE `media_job_files` (
	`id` varchar(32) NOT NULL,
	`job_id` varchar(32) NOT NULL,
	`storage_key` varchar(512) NOT NULL,
	`download_url` text NOT NULL,
	`filename` varchar(512) NOT NULL,
	`mime_type` varchar(128) NOT NULL,
	`bytes` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_job_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `media_job_files_job_created_idx` ON `media_job_files` (`job_id`,`created_at`);