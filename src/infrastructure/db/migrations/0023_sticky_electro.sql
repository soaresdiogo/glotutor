CREATE TABLE "pending_signups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"plan_type" varchar(30) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pending_signups_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "pending_signups_email_idx" ON "pending_signups" USING btree ("email");--> statement-breakpoint
CREATE INDEX "pending_signups_expires_idx" ON "pending_signups" USING btree ("expires_at");