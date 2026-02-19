CREATE TABLE "certification_exam_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_index" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certification_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"cefr_level" varchar(5) NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"score" numeric(5, 2),
	"total_questions" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"cefr_level" varchar(5) NOT NULL,
	"lessons_total" integer DEFAULT 0 NOT NULL,
	"lessons_completed" integer DEFAULT 0 NOT NULL,
	"podcasts_total" integer DEFAULT 0 NOT NULL,
	"podcasts_completed" integer DEFAULT 0 NOT NULL,
	"readings_total" integer DEFAULT 0 NOT NULL,
	"readings_completed" integer DEFAULT 0 NOT NULL,
	"conversations_total" integer DEFAULT 0 NOT NULL,
	"conversations_completed" integer DEFAULT 0 NOT NULL,
	"completion_percentage" numeric(5, 2) DEFAULT '0',
	"certification_unlocked" boolean DEFAULT false NOT NULL,
	"certified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement_test_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_index" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"cefr_level" varchar(5) NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement_test_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"recommended_level" varchar(5),
	"selected_level" varchar(5),
	"total_questions" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "placement_test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" varchar(10) NOT NULL,
	"cefr_level" varchar(5) NOT NULL,
	"question_type" varchar(30) NOT NULL,
	"question_text" text NOT NULL,
	"audio_url" text,
	"options" jsonb NOT NULL,
	"correct_option_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_language_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"primary_language" varchar(10) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_language_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_language_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"current_level" varchar(5) NOT NULL,
	"placement_test_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_language_streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"current_streak_days" integer DEFAULT 0 NOT NULL,
	"longest_streak_days" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_language_study_time" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"date" date NOT NULL,
	"minutes_studied" integer DEFAULT 0 NOT NULL,
	"activities_completed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "certification_exam_answers" ADD CONSTRAINT "certification_exam_answers_exam_id_certification_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."certification_exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_exam_answers" ADD CONSTRAINT "certification_exam_answers_question_id_placement_test_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."placement_test_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification_exams" ADD CONSTRAINT "certification_exams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_test_answers" ADD CONSTRAINT "placement_test_answers_attempt_id_placement_test_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."placement_test_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_test_answers" ADD CONSTRAINT "placement_test_answers_question_id_placement_test_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."placement_test_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "placement_test_attempts" ADD CONSTRAINT "placement_test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_preferences" ADD CONSTRAINT "user_language_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_progress" ADD CONSTRAINT "user_language_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_progress" ADD CONSTRAINT "user_language_progress_placement_test_id_placement_test_attempts_id_fk" FOREIGN KEY ("placement_test_id") REFERENCES "public"."placement_test_attempts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_streaks" ADD CONSTRAINT "user_language_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_language_study_time" ADD CONSTRAINT "user_language_study_time_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cea_exam_idx" ON "certification_exam_answers" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX "ce_user_lang_level_idx" ON "certification_exams" USING btree ("user_id","language","cefr_level");--> statement-breakpoint
CREATE INDEX "ce_user_status_idx" ON "certification_exams" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "lp_user_lang_level_idx" ON "level_progress" USING btree ("user_id","language","cefr_level");--> statement-breakpoint
CREATE INDEX "ptans_attempt_idx" ON "placement_test_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "ptans_attempt_question_idx" ON "placement_test_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "pta_user_language_idx" ON "placement_test_attempts" USING btree ("user_id","language");--> statement-breakpoint
CREATE INDEX "pta_user_status_idx" ON "placement_test_attempts" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "ptq_language_level_idx" ON "placement_test_questions" USING btree ("language","cefr_level");--> statement-breakpoint
CREATE INDEX "ptq_language_level_type_idx" ON "placement_test_questions" USING btree ("language","cefr_level","question_type");--> statement-breakpoint
CREATE INDEX "ulp_user_language_idx" ON "user_language_progress" USING btree ("user_id","language");--> statement-breakpoint
CREATE INDEX "ulp_user_active_idx" ON "user_language_progress" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "uls_user_lang_unique" ON "user_language_streaks" USING btree ("user_id","language");--> statement-breakpoint
CREATE INDEX "uls_user_language_idx" ON "user_language_streaks" USING btree ("user_id","language");--> statement-breakpoint
CREATE UNIQUE INDEX "ulst_user_lang_date_unique" ON "user_language_study_time" USING btree ("user_id","language","date");--> statement-breakpoint
CREATE INDEX "ulst_user_lang_date_idx" ON "user_language_study_time" USING btree ("user_id","language","date");