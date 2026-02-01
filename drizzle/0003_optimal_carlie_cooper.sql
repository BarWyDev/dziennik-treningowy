CREATE INDEX "idx_accounts_user_id" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_goals_user_id" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_goals_status" ON "goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_goals_user_status_archived" ON "goals" USING btree ("user_id","status","is_archived");--> statement-breakpoint
CREATE INDEX "idx_media_attachments_user_id" ON "media_attachments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_media_attachments_training_id" ON "media_attachments" USING btree ("training_id");--> statement-breakpoint
CREATE INDEX "idx_media_attachments_personal_record_id" ON "media_attachments" USING btree ("personal_record_id");--> statement-breakpoint
CREATE INDEX "idx_personal_records_user_id" ON "personal_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_personal_records_date" ON "personal_records" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_personal_records_user_date" ON "personal_records" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_training_types_user_id" ON "training_types" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_training_types_is_default" ON "training_types" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_trainings_user_id" ON "trainings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_trainings_date" ON "trainings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_trainings_user_date" ON "trainings" USING btree ("user_id","date");