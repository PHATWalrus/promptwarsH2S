import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { analysisJobs } from "./analysis";
import { contracts } from "./contracts";
import { clauseCategoryEnum, riskLevelEnum } from "./enums";

export const clauses = pgTable(
  "clauses",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    analysisJobId: uuid("analysis_job_id").references(() => analysisJobs.id, {
      onDelete: "set null",
    }),
    category: clauseCategoryEnum("category").notNull().default("other"),
    rawText: text("raw_text").notNull(),
    pageNumber: integer("page_number"),
    spanStart: integer("span_start"),
    spanEnd: integer("span_end"),
    riskLevel: riskLevelEnum("risk_level").notNull().default("medium"),
    riskScore: integer("risk_score").notNull().default(50),
    riskRationale: text("risk_rationale"),
    plainExplanation: text("plain_explanation"),
    scenarioIllustration: text("scenario_illustration"),
    negotiationTips: text("negotiation_tips").array(),
    isAmbiguous: boolean("is_ambiguous").notNull().default(false),
    isOnesSided: boolean("is_ones_sided").notNull().default(false),
    deviatesFromStandard: boolean("deviates_from_standard").notNull().default(false),
    standardComparison: text("standard_comparison"),
    embedding: vector("embedding", { dimensions: 1536 }),
    confidenceScore: doublePrecision("confidence_score"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("clauses_contract_risk_idx").on(table.contractId, table.riskLevel, table.riskScore),
    index("clauses_contract_category_idx").on(table.contractId, table.category),
  ],
);
