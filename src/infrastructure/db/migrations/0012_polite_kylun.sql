CREATE TABLE "podcast_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"podcast_id" uuid NOT NULL,
	"question_number" integer NOT NULL,
	"type" varchar(30) NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"explanation_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "podcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"cefr_level" varchar(5) NOT NULL,
	"audio_url" varchar(1000) NOT NULL,
	"transcript" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"vocabulary_highlights" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_podcast_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"podcast_id" uuid NOT NULL,
	"listened_percentage" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"exercise_score" integer,
	"exercise_completed_at" timestamp,
	"exercise_answers" jsonb,
	"exercise_feedback" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "podcast_exercises" ADD CONSTRAINT "podcast_exercises_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcasts" ADD CONSTRAINT "podcasts_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_podcast_progress" ADD CONSTRAINT "student_podcast_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_podcast_progress" ADD CONSTRAINT "student_podcast_progress_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "podcasts_lang_level_idx" ON "podcasts" USING btree ("language_id","cefr_level");--> statement-breakpoint
CREATE INDEX "spp_user_podcast_idx" ON "student_podcast_progress" USING btree ("user_id","podcast_id");--> statement-breakpoint
CREATE INDEX "spp_user_idx" ON "student_podcast_progress" USING btree ("user_id");