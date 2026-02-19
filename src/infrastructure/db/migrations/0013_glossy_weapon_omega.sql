CREATE TABLE "speaking_exercise_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"answer" jsonb,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" uuid NOT NULL,
	"question_number" integer NOT NULL,
	"type" varchar(30) NOT NULL,
	"question_text" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"explanation_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"duration_seconds" integer NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"feedback" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speaking_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"cefr_level" varchar(5) NOT NULL,
	"context_prompt" text NOT NULL,
	"key_vocabulary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"native_expressions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "speaking_exercise_attempts" ADD CONSTRAINT "speaking_exercise_attempts_session_id_speaking_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."speaking_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_exercise_attempts" ADD CONSTRAINT "speaking_exercise_attempts_exercise_id_speaking_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."speaking_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_exercise_attempts" ADD CONSTRAINT "speaking_exercise_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_exercises" ADD CONSTRAINT "speaking_exercises_topic_id_speaking_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."speaking_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_sessions" ADD CONSTRAINT "speaking_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_sessions" ADD CONSTRAINT "speaking_sessions_topic_id_speaking_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."speaking_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_topics" ADD CONSTRAINT "speaking_topics_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sea_session_idx" ON "speaking_exercise_attempts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "sea_session_exercise_idx" ON "speaking_exercise_attempts" USING btree ("session_id","exercise_id");--> statement-breakpoint
CREATE INDEX "ss_user_idx" ON "speaking_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ss_user_created_idx" ON "speaking_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ss_topic_idx" ON "speaking_sessions" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "st_lang_level_idx" ON "speaking_topics" USING btree ("language_id","cefr_level");--> statement-breakpoint
CREATE INDEX "st_slug_lang_idx" ON "speaking_topics" USING btree ("slug","language_id");