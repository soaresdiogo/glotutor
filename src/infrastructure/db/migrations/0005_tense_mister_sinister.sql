ALTER TABLE "reading_sessions" ADD COLUMN IF NOT EXISTS "feedback" jsonb;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD COLUMN IF NOT EXISTS "grammar_items" jsonb;