CREATE TABLE "speaking_session_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"total_turns" integer NOT NULL,
	"total_input_tokens" integer NOT NULL,
	"total_output_tokens" integer NOT NULL,
	"estimated_cost_usd" double precision NOT NULL,
	"duration_seconds" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "speaking_session_usage" ADD CONSTRAINT "speaking_session_usage_session_id_speaking_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."speaking_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaking_session_usage" ADD CONSTRAINT "speaking_session_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;