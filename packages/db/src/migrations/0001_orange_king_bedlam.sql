ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_jobs_contract_created_idx" ON "analysis_jobs" USING btree ("contract_id","created_at");--> statement-breakpoint
CREATE INDEX "analysis_jobs_status_created_idx" ON "analysis_jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_user_created_idx" ON "audit_log" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_resource_idx" ON "audit_log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "chat_messages_contract_created_idx" ON "chat_messages" USING btree ("contract_id","created_at");--> statement-breakpoint
CREATE INDEX "clauses_contract_risk_idx" ON "clauses" USING btree ("contract_id","risk_level","risk_score");--> statement-breakpoint
CREATE INDEX "clauses_contract_category_idx" ON "clauses" USING btree ("contract_id","category");--> statement-breakpoint
CREATE INDEX "contracts_org_status_created_idx" ON "contracts" USING btree ("org_id","status","created_at");--> statement-breakpoint
CREATE INDEX "contracts_user_created_idx" ON "contracts" USING btree ("user_id","created_at");