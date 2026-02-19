CREATE TABLE "native_lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"score" integer,
	"exercise_results" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "native_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"language" varchar(10) NOT NULL,
	"level" varchar(5) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"content" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "native_lesson_progress" ADD CONSTRAINT "native_lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "native_lesson_progress" ADD CONSTRAINT "native_lesson_progress_lesson_id_native_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."native_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "nlp_user_lesson_unique" ON "native_lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "nlp_user_completed_at_idx" ON "native_lesson_progress" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "native_lessons_language_level_order_idx" ON "native_lessons" USING btree ("language","level","sort_order");