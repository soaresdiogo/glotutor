-- Store total exercise count so score can be shown as correct/total (e.g. 7/10)
ALTER TABLE "student_podcast_progress"
  ADD COLUMN IF NOT EXISTS "total_questions" integer;
