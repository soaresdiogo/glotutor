-- Enable pg_trgm for fast ILIKE search on titles
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "native_lessons_title_trgm_idx" ON "native_lessons" USING gin ("title" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "speaking_topics_title_trgm_idx" ON "speaking_topics" USING gin ("title" gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "texts_title_trgm_idx" ON "texts" USING gin ("title" gin_trgm_ops);
