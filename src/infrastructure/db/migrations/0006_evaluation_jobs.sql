CREATE TABLE IF NOT EXISTS "evaluation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"text_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'processing' NOT NULL,
	"result" jsonb,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluation_jobs" ADD CONSTRAINT "evaluation_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluation_jobs" ADD CONSTRAINT "evaluation_jobs_text_id_texts_id_fk" FOREIGN KEY ("text_id") REFERENCES "public"."texts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ej_user_idx" ON "evaluation_jobs" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ej_status_created_idx" ON "evaluation_jobs" USING btree ("status","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ej_created_idx" ON "evaluation_jobs" USING btree ("created_at");
