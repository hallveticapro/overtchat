ALTER TABLE `uploads` ADD `category` text NOT NULL;--> statement-breakpoint
ALTER TABLE `uploads` ADD `size` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `uploads` ADD `page_count` integer;--> statement-breakpoint
ALTER TABLE `uploads` ADD `extracted_text` text;--> statement-breakpoint
ALTER TABLE `uploads` ADD `truncated` integer DEFAULT false NOT NULL;