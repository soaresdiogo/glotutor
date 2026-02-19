CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"icon_url" varchar(500),
	"category" varchar(30) NOT NULL,
	"criteria" jsonb,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audio_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"tenant_id" uuid,
	"title" varchar(500) NOT NULL,
	"transcript" text NOT NULL,
	"audio_url" varchar(500) NOT NULL,
	"category" varchar(30) NOT NULL,
	"level" varchar(5) NOT NULL,
	"cefr_level" varchar(5),
	"duration_seconds" integer,
	"speech_rate_wpm" real,
	"generation_type" varchar(20) DEFAULT 'manual' NOT NULL,
	"source_text_id" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audio_lesson_id" uuid NOT NULL,
	"segment_index" integer NOT NULL,
	"start_time" real NOT NULL,
	"end_time" real NOT NULL,
	"transcript_segment" text NOT NULL,
	"comprehension_questions" jsonb
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"tenant_id" uuid,
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" varchar(100),
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"consent_type" varchar(30) NOT NULL,
	"version" varchar(20) NOT NULL,
	"granted" boolean NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"granted_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_generation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"type" varchar(30) NOT NULL,
	"language_id" uuid NOT NULL,
	"level" varchar(5),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"input_params" jsonb,
	"output_refs" jsonb,
	"items_generated" integer DEFAULT 0,
	"error_log" text,
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"tenant_id" uuid,
	"title" varchar(500) NOT NULL,
	"description" text,
	"level" varchar(5) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"total_lessons" integer DEFAULT 0,
	"estimated_hours" integer,
	"cover_image_url" varchar(500),
	"metadata" jsonb,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"practice_date" date NOT NULL,
	"reading_minutes" integer DEFAULT 0 NOT NULL,
	"listening_minutes" integer DEFAULT 0 NOT NULL,
	"speaking_minutes" integer DEFAULT 0 NOT NULL,
	"lesson_minutes" integer DEFAULT 0 NOT NULL,
	"words_practiced" integer DEFAULT 0 NOT NULL,
	"words_mastered" integer DEFAULT 0 NOT NULL,
	"avg_pronunciation_score" real,
	"exercises_completed" integer DEFAULT 0 NOT NULL,
	"exercises_correct" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"request_type" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"processed_by" varchar(100),
	"result_url" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"tenant_id" uuid,
	"resend_id" varchar(255),
	"type" varchar(30) NOT NULL,
	"to_email" varchar(255) NOT NULL,
	"subject" varchar(500),
	"status" varchar(20) DEFAULT 'sent' NOT NULL,
	"metadata" jsonb,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"type" varchar(30) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verification_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "interview_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"tenant_id" uuid,
	"title" varchar(255) NOT NULL,
	"industry" varchar(50) NOT NULL,
	"level" varchar(20) NOT NULL,
	"questions" jsonb NOT NULL,
	"evaluation_criteria" jsonb,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwt_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"algorithm" varchar(10) DEFAULT 'RS256' NOT NULL,
	"kid" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"rotated_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jwt_keys_kid_unique" UNIQUE("kid")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"type" varchar(20) DEFAULT 'mixed' NOT NULL,
	"estimated_minutes" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"content" jsonb,
	"exercise_templates" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listening_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"audio_lesson_id" uuid NOT NULL,
	"duration_listened_seconds" integer,
	"completion_percentage" real,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"comprehension_score" real,
	"answers" jsonb,
	"ai_feedback" text,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"country_code" varchar(5),
	"status" varchar(30) NOT NULL,
	"device_info" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mfa_backup_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(255) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"total_lessons" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"unlock_rule" varchar(20) DEFAULT 'sequential' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "payment_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid,
	"user_id" uuid NOT NULL,
	"stripe_invoice_id" varchar(255),
	"stripe_charge_id" varchar(255),
	"amount_cents" integer NOT NULL,
	"currency" varchar(5) NOT NULL,
	"status" varchar(20) NOT NULL,
	"payment_method" varchar(20),
	"receipt_url" text,
	"invoice_pdf_url" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_history_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" varchar(30) NOT NULL,
	"scenario" varchar(100),
	"language_id" uuid NOT NULL,
	"level" varchar(5),
	"target_duration_seconds" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"actual_duration_seconds" integer,
	"overall_score" real,
	"scores_breakdown" jsonb,
	"ai_feedback" text,
	"turn_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"turn_index" integer NOT NULL,
	"speaker" varchar(10) NOT NULL,
	"transcript" text NOT NULL,
	"audio_url" varchar(500),
	"pronunciation_scores" jsonb,
	"grammar_errors" jsonb,
	"suggestions" jsonb,
	"turn_score" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"stripe_price_id" varchar(255),
	"currency" varchar(5) DEFAULT 'usd' NOT NULL,
	"amount_cents" integer NOT NULL,
	"interval" varchar(10) DEFAULT 'month' NOT NULL,
	"interval_count" integer DEFAULT 1 NOT NULL,
	"type" varchar(15) DEFAULT 'recurring' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prices_stripe_price_id_unique" UNIQUE("stripe_price_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"stripe_product_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(30) DEFAULT 'individual' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"features" jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_stripe_product_id_unique" UNIQUE("stripe_product_id")
);
--> statement-breakpoint
CREATE TABLE "pronunciation_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word" varchar(100) NOT NULL,
	"language_code" varchar(10) NOT NULL,
	"audio_url" varchar(500) NOT NULL,
	"phonetic_ipa" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"text_id" uuid NOT NULL,
	"words_per_minute" integer,
	"accuracy" real,
	"duration_seconds" integer,
	"words_read" integer,
	"green_count" integer DEFAULT 0 NOT NULL,
	"yellow_count" integer DEFAULT 0 NOT NULL,
	"red_count" integer DEFAULT 0 NOT NULL,
	"missed_count" integer DEFAULT 0 NOT NULL,
	"word_scores" jsonb,
	"ai_feedback" text,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"device_info" varchar(500),
	"ip_address" varchar(45),
	"country_code" varchar(5),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_refresh_token_hash_unique" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "student_course_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"progress_percentage" real DEFAULT 0 NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'locked' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"best_score" real,
	"last_score" real,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"exercise_results" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_module_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'locked' NOT NULL,
	"progress_percentage" real DEFAULT 0 NOT NULL,
	"unlocked_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"target_language_id" uuid NOT NULL,
	"native_language_code" varchar(10) DEFAULT 'pt-BR' NOT NULL,
	"current_level" varchar(5) DEFAULT 'A1' NOT NULL,
	"learning_goal" varchar(30),
	"streak_days" integer DEFAULT 0 NOT NULL,
	"total_practice_minutes" integer DEFAULT 0 NOT NULL,
	"total_words_learned" integer DEFAULT 0 NOT NULL,
	"last_practice_date" date,
	"preferences" jsonb,
	"onboarding_answers" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tenant_id" uuid,
	"price_id" uuid NOT NULL,
	"stripe_subscription_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"status" varchar(20) DEFAULT 'incomplete' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "supported_languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"native_name" varchar(100),
	"flag_emoji" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "supported_languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "teacher_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255),
	"topic" varchar(30),
	"language_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"corrections" jsonb,
	"audio_url" varchar(500),
	"token_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255),
	"logo_url" text,
	"theme" jsonb,
	"settings" jsonb,
	"status" varchar(20) DEFAULT 'trial' NOT NULL,
	"plan" varchar(30) DEFAULT 'starter' NOT NULL,
	"owner_user_id" uuid,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "text_vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text_id" uuid NOT NULL,
	"word" varchar(100) NOT NULL,
	"phonetic_ipa" varchar(200),
	"definition" text,
	"example_sentence" text,
	"part_of_speech" varchar(20),
	"cefr_level" varchar(5),
	"frequency_rank" integer,
	"audio_url" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "texts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language_id" uuid NOT NULL,
	"tenant_id" uuid,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(30) NOT NULL,
	"level" varchar(5) NOT NULL,
	"cefr_level" varchar(5),
	"word_count" integer,
	"estimated_minutes" integer,
	"difficulty_score" real,
	"level_metadata" jsonb,
	"source_url" varchar(1000),
	"generation_type" varchar(20) DEFAULT 'manual' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language_id" uuid NOT NULL,
	"word" varchar(100) NOT NULL,
	"definition" text,
	"context_sentence" text,
	"times_encountered" integer DEFAULT 1 NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"times_incorrect" integer DEFAULT 0 NOT NULL,
	"mastery" real DEFAULT 0 NOT NULL,
	"srs_level" varchar(20) DEFAULT 'new' NOT NULL,
	"next_review_at" timestamp,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255),
	"avatar_url" varchar(500),
	"role" varchar(20) DEFAULT 'student' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_secret" varchar(500),
	"locale" varchar(10) DEFAULT 'en-US',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"last_login_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audio_lessons" ADD CONSTRAINT "audio_lessons_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_lessons" ADD CONSTRAINT "audio_lessons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_lessons" ADD CONSTRAINT "audio_lessons_source_text_id_texts_id_fk" FOREIGN KEY ("source_text_id") REFERENCES "public"."texts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_segments" ADD CONSTRAINT "audio_segments_audio_lesson_id_audio_lessons_id_fk" FOREIGN KEY ("audio_lesson_id") REFERENCES "public"."audio_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_generation_jobs" ADD CONSTRAINT "content_generation_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_generation_jobs" ADD CONSTRAINT "content_generation_jobs_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_templates" ADD CONSTRAINT "interview_templates_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_templates" ADD CONSTRAINT "interview_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_sessions" ADD CONSTRAINT "listening_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_sessions" ADD CONSTRAINT "listening_sessions_audio_lesson_id_audio_lessons_id_fk" FOREIGN KEY ("audio_lesson_id") REFERENCES "public"."audio_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_backup_codes" ADD CONSTRAINT "mfa_backup_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice_turns" ADD CONSTRAINT "practice_turns_session_id_practice_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_text_id_texts_id_fk" FOREIGN KEY ("text_id") REFERENCES "public"."texts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_course_enrollments" ADD CONSTRAINT "student_course_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_course_enrollments" ADD CONSTRAINT "student_course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_lesson_progress" ADD CONSTRAINT "student_lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_lesson_progress" ADD CONSTRAINT "student_lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_target_language_id_supported_languages_id_fk" FOREIGN KEY ("target_language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_price_id_prices_id_fk" FOREIGN KEY ("price_id") REFERENCES "public"."prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_conversations" ADD CONSTRAINT "teacher_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_conversations" ADD CONSTRAINT "teacher_conversations_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_messages" ADD CONSTRAINT "teacher_messages_conversation_id_teacher_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."teacher_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_admins" ADD CONSTRAINT "tenant_admins_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_admins" ADD CONSTRAINT "tenant_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_vocabulary" ADD CONSTRAINT "text_vocabulary_text_id_texts_id_fk" FOREIGN KEY ("text_id") REFERENCES "public"."texts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "texts" ADD CONSTRAINT "texts_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "texts" ADD CONSTRAINT "texts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_language_id_supported_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."supported_languages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audio_lessons_lang_level_idx" ON "audio_lessons" USING btree ("language_id","level");--> statement-breakpoint
CREATE INDEX "audio_lessons_tenant_idx" ON "audio_lessons" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audio_lessons_category_idx" ON "audio_lessons" USING btree ("category");--> statement-breakpoint
CREATE INDEX "as_lesson_idx" ON "audio_segments" USING btree ("audio_lesson_id");--> statement-breakpoint
CREATE INDEX "as_lesson_order_idx" ON "audio_segments" USING btree ("audio_lesson_id","segment_index");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cr_user_idx" ON "consent_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cr_type_idx" ON "consent_records" USING btree ("consent_type");--> statement-breakpoint
CREATE INDEX "cgj_tenant_idx" ON "content_generation_jobs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cgj_status_idx" ON "content_generation_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cgj_scheduled_idx" ON "content_generation_jobs" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "courses_lang_idx" ON "courses" USING btree ("language_id");--> statement-breakpoint
CREATE INDEX "courses_tenant_idx" ON "courses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "courses_level_idx" ON "courses" USING btree ("level");--> statement-breakpoint
CREATE INDEX "courses_sort_idx" ON "courses" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "dp_user_date_unique" ON "daily_progress" USING btree ("user_id","practice_date");--> statement-breakpoint
CREATE INDEX "dp_user_date_idx" ON "daily_progress" USING btree ("user_id","practice_date");--> statement-breakpoint
CREATE INDEX "dr_user_idx" ON "data_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dr_status_idx" ON "data_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "el_user_idx" ON "email_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "el_tenant_idx" ON "email_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "el_type_idx" ON "email_logs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "evt_user_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "it_lang_idx" ON "interview_templates" USING btree ("language_id");--> statement-breakpoint
CREATE INDEX "it_tenant_idx" ON "interview_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "it_industry_idx" ON "interview_templates" USING btree ("industry","level");--> statement-breakpoint
CREATE INDEX "lessons_module_idx" ON "lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "lessons_sort_idx" ON "lessons" USING btree ("module_id","sort_order");--> statement-breakpoint
CREATE INDEX "ls_user_idx" ON "listening_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ls_user_created_idx" ON "listening_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "la_email_idx" ON "login_attempts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "la_ip_idx" ON "login_attempts" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "la_created_idx" ON "login_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mfa_bc_user_idx" ON "mfa_backup_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "modules_course_idx" ON "modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "modules_sort_idx" ON "modules" USING btree ("course_id","sort_order");--> statement-breakpoint
CREATE INDEX "prt_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ph_user_idx" ON "payment_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ph_sub_idx" ON "payment_history" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "ph_stripe_inv_idx" ON "payment_history" USING btree ("stripe_invoice_id");--> statement-breakpoint
CREATE INDEX "ps_user_idx" ON "practice_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ps_user_mode_idx" ON "practice_sessions" USING btree ("user_id","mode");--> statement-breakpoint
CREATE INDEX "pt_session_idx" ON "practice_turns" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "pt_session_order_idx" ON "practice_turns" USING btree ("session_id","turn_index");--> statement-breakpoint
CREATE INDEX "prices_product_idx" ON "prices" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "prices_stripe_idx" ON "prices" USING btree ("stripe_price_id");--> statement-breakpoint
CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "products_stripe_idx" ON "products" USING btree ("stripe_product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pc_word_lang_unique" ON "pronunciation_cache" USING btree ("word","language_code");--> statement-breakpoint
CREATE INDEX "rs_user_idx" ON "reading_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rs_text_idx" ON "reading_sessions" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "rs_user_created_idx" ON "reading_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sce_user_course_unique" ON "student_course_enrollments" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "sce_user_idx" ON "student_course_enrollments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slp_user_lesson_unique" ON "student_lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "slp_user_idx" ON "student_lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "slp_status_idx" ON "student_lesson_progress" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "smp_user_module_unique" ON "student_module_progress" USING btree ("user_id","module_id");--> statement-breakpoint
CREATE INDEX "smp_user_idx" ON "student_module_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "smp_status_idx" ON "student_module_progress" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "sp_user_idx" ON "student_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sp_tenant_idx" ON "student_profiles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sp_language_idx" ON "student_profiles" USING btree ("target_language_id");--> statement-breakpoint
CREATE INDEX "subs_user_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subs_tenant_idx" ON "subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "subs_stripe_idx" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "subs_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tc_user_idx" ON "teacher_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tc_user_status_idx" ON "teacher_conversations" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "tm_conv_idx" ON "teacher_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "tm_conv_created_idx" ON "teacher_messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ta_tenant_user_unique" ON "tenant_admins" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "ta_tenant_idx" ON "tenant_admins" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_domain_idx" ON "tenants" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "tv_text_idx" ON "text_vocabulary" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "texts_lang_level_idx" ON "texts" USING btree ("language_id","level");--> statement-breakpoint
CREATE INDEX "texts_tenant_idx" ON "texts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "texts_category_idx" ON "texts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "texts_published_idx" ON "texts" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "ua_user_ach_unique" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uv_user_word_lang_unique" ON "user_vocabulary" USING btree ("user_id","word","language_id");--> statement-breakpoint
CREATE INDEX "uv_user_srs_idx" ON "user_vocabulary" USING btree ("user_id","srs_level");--> statement-breakpoint
CREATE INDEX "uv_next_review_idx" ON "user_vocabulary" USING btree ("user_id","next_review_at");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");