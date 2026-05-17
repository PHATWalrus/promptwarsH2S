import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { contracts } from "./contracts";
import { analysisStatusEnum, riskLevelEnum } from "./enums";
import { organizations } from "./organizations";
import { users } from "./users";

export const analysisJobs = pgTable(
  "analysis_jobs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    status: analysisStatusEnum("status").notNull().default("queued"),
    bullJobId: text("bull_job_id"),
    overallRiskScore: integer("overall_risk_score"),
    riskLevel: riskLevelEnum("risk_level"),
    errorMessage: text("error_message"),
    privacyFlags: text("privacy_flags"),
    summary: text("summary"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("analysis_jobs_contract_created_idx").on(table.contractId, table.createdAt),
    index("analysis_jobs_status_created_idx").on(table.status, table.createdAt),
  ],
);

export const aiUsageLog = pgTable("ai_usage_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "set null" }),
  jobType: text("job_type").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  costUsdCents: integer("cost_usd_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
