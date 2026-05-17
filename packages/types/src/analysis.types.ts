import { z } from "zod";
import { clauseSchema, riskLevelSchema } from "./contract.types";

export const analysisStatusSchema = z.enum([
  "queued",
  "extracting",
  "scoring",
  "explaining",
  "done",
  "failed",
]);

export const analysisResultSchema = z
  .object({
    overallRisk: z.object({
      score: z.number().int().min(1).max(100),
      level: riskLevelSchema,
      summary: z.string(),
    }),
    clauses: z.array(clauseSchema),
    privacyFlags: z.array(z.string()).default([]),
    summary: z.string(),
  })
  .strict();

export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
