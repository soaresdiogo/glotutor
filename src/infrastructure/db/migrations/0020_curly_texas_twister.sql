ALTER TABLE "podcasts" ADD COLUMN "rich_content" jsonb;--> statement-breakpoint
ALTER TABLE "speaking_topics" ADD COLUMN "rich_content" jsonb;--> statement-breakpoint
ALTER TABLE "texts" ADD COLUMN "structured_content" jsonb;