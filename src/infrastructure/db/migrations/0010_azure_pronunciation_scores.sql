ALTER TABLE "reading_sessions" ADD COLUMN IF NOT EXISTS "azure_pronunciation_score" real;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD COLUMN IF NOT EXISTS "azure_accuracy_score" real;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD COLUMN IF NOT EXISTS "azure_fluency_score" real;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD COLUMN IF NOT EXISTS "azure_completeness_score" real;
