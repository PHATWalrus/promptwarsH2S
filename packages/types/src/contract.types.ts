import { z } from "zod";

export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export const contractTypeSchema = z.enum([
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
export const contractStatusSchema = z.enum([
  "uploaded",
  "processing",
  "completed",
  "failed",
  "deleted",
]);
export const clauseCategorySchema = z.enum([
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

export const clauseSchema = z
  .object({
    id: z.uuid(),
    contractId: z.uuid(),
    category: clauseCategorySchema,
    rawText: z.string(),
    pageNumber: z.number().int().nullable().optional(),
    spanStart: z.number().int().nullable().optional(),
    spanEnd: z.number().int().nullable().optional(),
    riskLevel: riskLevelSchema,
    riskScore: z.number().int().min(1).max(100),
    riskRationale: z.string().nullable().optional(),
    plainExplanation: z.string().nullable().optional(),
    scenarioIllustration: z.string().nullable().optional(),
    negotiationTips: z.array(z.string()).default([]),
    isAmbiguous: z.boolean().default(false),
    isOnesSided: z.boolean().default(false),
    deviatesFromStandard: z.boolean().default(false),
    standardComparison: z.string().nullable().optional(),
    confidenceScore: z.number().min(0).max(1).nullable().optional(),
  })
  .strict();

export const contractSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid().optional(),
    orgId: z.uuid().optional(),
    title: z.string(),
    contractType: contractTypeSchema,
    jurisdiction: z.string().nullable().optional(),
    storageKey: z.string().optional(),
    fileSizeBytes: z.number().int().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    checksum: z.string().nullable().optional(),
    status: contractStatusSchema,
    sourceUrl: z.string().nullable().optional(),
    crawlProvider: z.enum(["cloudflare", "firecrawl", "manual"]).nullable().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional(),
  })
  .passthrough();

export type RiskLevel = z.infer<typeof riskLevelSchema>;
export type ContractType = z.infer<typeof contractTypeSchema>;
export type ContractStatus = z.infer<typeof contractStatusSchema>;
export type ClauseCategory = z.infer<typeof clauseCategorySchema>;
export type Clause = z.infer<typeof clauseSchema>;
export type Contract = z.infer<typeof contractSchema>;
