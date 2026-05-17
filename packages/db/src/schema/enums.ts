import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const orgPlanEnum = pgEnum("org_plan", ["free", "pro", "enterprise"]);
export const contractTypeEnum = pgEnum("contract_type", [
  "employment",
  "nda",
  "saas",
  "msa",
  "dpa",
  "tos",
  "privacy_policy",
  "lease",
  "insurance",
  "other",
]);
export const contractStatusEnum = pgEnum("contract_status", [
  "uploaded",
  "processing",
  "completed",
  "failed",
  "deleted",
]);
export const analysisStatusEnum = pgEnum("analysis_status", [
  "queued",
  "extracting",
  "scoring",
  "explaining",
  "done",
  "failed",
]);
export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high", "critical"]);
export const clauseCategoryEnum = pgEnum("clause_category", [
  "non_compete",
  "ip_assignment",
  "indemnity",
  "liability_cap",
  "termination",
  "auto_renewal",
  "arbitration",
  "governing_law",
  "data_sharing",
  "confidentiality",
  "payment",
  "warranty",
  "force_majeure",
  "other",
]);
export const feedbackTypeEnum = pgEnum("feedback_type", [
  "misclassified",
  "risk_overstated",
  "risk_understated",
  "wrong_explanation",
  "helpful",
  "other",
]);
export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);
export const crawlProviderEnum = pgEnum("crawl_provider", ["cloudflare", "firecrawl", "manual"]);
