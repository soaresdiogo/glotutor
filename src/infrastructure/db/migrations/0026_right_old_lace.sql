CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"cefr_level" varchar(5) NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"language_name" varchar(100) NOT NULL,
	"level_name" varchar(100) NOT NULL,
	"total_study_minutes" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp NOT NULL,
	"verification_code" varchar(32) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;