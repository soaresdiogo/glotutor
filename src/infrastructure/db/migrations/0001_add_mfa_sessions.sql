CREATE TABLE IF NOT EXISTS "mfa_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "mfa_code_hash" varchar(255) NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mfa_sessions" ADD CONSTRAINT "mfa_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mfa_sessions_user_idx" ON "mfa_sessions" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "mfa_sessions_expires_idx" ON "mfa_sessions" USING btree ("expires_at");
