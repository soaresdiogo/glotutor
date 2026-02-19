-- Add rich_content jsonb column to speaking_topics for full scenario data
ALTER TABLE "speaking_topics" ADD COLUMN IF NOT EXISTS "rich_content" jsonb;

-- Add rich_content jsonb column to podcasts for full script + exercises
ALTER TABLE "podcasts" ADD COLUMN IF NOT EXISTS "rich_content" jsonb;

-- Add structured_content jsonb to texts for structured reading formats
ALTER TABLE "texts" ADD COLUMN IF NOT EXISTS "structured_content" jsonb;
