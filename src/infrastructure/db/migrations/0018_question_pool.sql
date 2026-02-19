-- Add question_pool to separate placement test and certification question pools
ALTER TABLE "placement_test_questions" ADD COLUMN IF NOT EXISTS "question_pool" varchar(20) DEFAULT 'placement' NOT NULL;
CREATE INDEX IF NOT EXISTS "ptq_pool_lang_level_idx" ON "placement_test_questions" USING btree ("question_pool","language","cefr_level");
