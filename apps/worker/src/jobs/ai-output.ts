import { clauseCategorySchema, riskLevelSchema } from "@lexguard/types";
import { z } from "zod";

export const extractedClauseSchema = z
  .object({
    category: clauseCategorySchema,
    rawText: z.string().min(1),
    pageNumber: z.number().int().positive().nullable().optional(),
    spanStart: z.number().int().min(0).nullable().optional(),
    spanEnd: z.number().int().min(0).nullable().optional(),
    confidenceScore: z.number().min(0).max(1).default(0.7),
    isAmbiguous: z.boolean().default(false),
    isOnesSided: z.boolean().default(false),
  })
  .strict();

export const clauseExtractionOutputSchema = z
  .object({
    clauses: z.array(extractedClauseSchema).min(1),
  })
  .strict();

export const riskScoreOutputSchema = z
  .object({
    clauses: z.array(
      z
        .object({
          rawText: z.string().min(1),
          riskLevel: riskLevelSchema,
          riskScore: z.number().int().min(1).max(100),
          riskRationale: z.string().min(1),
          deviatesFromStandard: z.boolean().default(false),
          standardComparison: z.string().optional(),
        })
        .strict(),
    ),
    overallRiskScore: z.number().int().min(1).max(100),
    riskLevel: riskLevelSchema,
  })
  .strict();

export const privacyOutputSchema = z
  .object({
    flags: z.array(z.string()).default([]),
  })
  .strict();

export const explanationOutputSchema = z
  .object({
    clauses: z.array(
      z
        .object({
          rawText: z.string().min(1),
          plainExplanation: z.string().min(1),
          scenarioIllustration: z.string().min(1),
          negotiationTips: z.array(z.string()).default([]),
        })
        .strict(),
    ),
  })
  .strict();

export function parseJsonObject(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  return JSON.parse(fenced ?? trimmed) as unknown;
}

export function parseClauseExtraction(text: string) {
  return clauseExtractionOutputSchema.parse(parseJsonObject(text));
}

export function parseRiskScore(text: string) {
  return riskScoreOutputSchema.parse(parseJsonObject(text));
}

export function parsePrivacyAnalysis(text: string) {
  return privacyOutputSchema.parse(parseJsonObject(text));
}

export function parseExplanations(text: string) {
  return explanationOutputSchema.parse(parseJsonObject(text));
}
