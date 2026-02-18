CREATE TABLE "user_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"consent_type" text NOT NULL,
	"version" text NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_consents_user_id" ON "user_consents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_consents_type" ON "user_consents" USING btree ("user_id","consent_type");