import { z } from "zod";
import { analysisStatusSchema } from "./analysis.types";
import {
  clauseCategorySchema,
  clauseSchema,
  contractSchema,
  contractStatusSchema,
  contractTypeSchema,
  riskLevelSchema,
} from "./contract.types";

export const uuidParamSchema = z.object({ id: z.uuid() }).strict();
export const contractIdParamSchema = z.object({ contractId: z.uuid() }).strict();
export const clauseIdParamSchema = z.object({ clauseId: z.uuid() }).strict();

export const registerSchema = z
  .object({
    email: z.email().toLowerCase(),
    password: z.string().min(12).max(256),
    name: z.string().min(1).max(120).optional(),
    orgName: z.string().min(1).max(120).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.email().toLowerCase(),
    password: z.string().min(1).max(256),
  })
  .strict();

export const refreshSchema = z.object({ refreshToken: z.string().min(16) }).strict();
export const optionalRefreshSchema = z
  .object({ refreshToken: z.string().min(16).optional() })
  .strict();

export const userResponseSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    name: z.string().nullable(),
    role: z.enum(["user", "admin"]),
    orgId: z.uuid().nullable(),
  })
  .strict();

export const authResponseSchema = z
  .object({
    user: userResponseSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict();

export const contractsListResponseSchema = z
  .object({ contracts: z.array(contractSchema) })
  .strict();
export const contractDetailResponseSchema = z.object({ contract: contractSchema }).strict();
export const uploadResponseSchema = z
  .object({ contractId: z.uuid(), status: z.literal("processing") })
  .strict();

export const contractUploadSchema = z
  .object({
    title: z.string().min(1).max(240).optional(),
    contractType: contractTypeSchema.optional().default("other"),
    jurisdiction: z.string().min(2).max(32).optional(),
  })
  .strict();

export const importUrlSchema = z
  .object({
    url: z.url(),
    title: z.string().min(1).max(240).optional(),
    contractType: contractTypeSchema.optional().default("tos"),
    jurisdiction: z.string().min(2).max(32).optional(),
  })
  .strict();

export const listContractsQuerySchema = z
  .object({
    type: contractTypeSchema.optional(),
    status: contractStatusSchema.optional(),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const analysisStatusResponseSchema = z
  .object({
    status: analysisStatusSchema,
    progress: z.number().int().min(0).max(100),
    currentStage: z.string(),
  })
  .strict();

export const clausesResponseSchema = z.object({ clauses: z.array(clauseSchema) }).strict();

export const clauseFeedbackSchema = z
  .object({
    feedbackType: z.enum([
      "misclassified",
      "risk_overstated",
      "risk_understated",
      "wrong_explanation",
      "helpful",
      "other",
    ]),
    comment: z.string().max(2000).optional(),
  })
  .strict();

export const clauseSearchQuerySchema = z
  .object({
    query: z.string().min(2).max(1000),
    contractId: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();

export const clauseListQuerySchema = z
  .object({
    riskLevel: riskLevelSchema.optional(),
    category: clauseCategorySchema.optional(),
    sort: z.enum(["score", "created"]).default("score"),
  })
  .strict();

export const chatMessageSchema = z.object({ message: z.string().min(1).max(4000) }).strict();
export const chatResponseSchema = z
  .object({
    answer: z.string(),
    relevantClauses: z.array(clauseSchema),
    confidence: z.number().min(0).max(1),
    disclaimer: z.string(),
  })
  .strict();
export const chatHistoryResponseSchema = z.object({ messages: z.array(z.unknown()) }).strict();
export const compareContractsSchema = z
  .object({ contractIds: z.array(z.uuid()).min(2).max(5) })
  .strict();
export const compareMatrixResponseSchema = z
  .object({
    contractIds: z.array(z.uuid()),
    matrix: z.array(z.unknown()),
  })
  .passthrough();

export const problemDetailsSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string(),
    instance: z.string().optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type OptionalRefreshInput = z.infer<typeof optionalRefreshSchema>;
export type ContractUploadInput = z.infer<typeof contractUploadSchema>;
export type ImportUrlInput = z.infer<typeof importUrlSchema>;
export type ClauseFeedbackInput = z.infer<typeof clauseFeedbackSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type CompareContractsInput = z.infer<typeof compareContractsSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UploadResponse = z.infer<typeof uploadResponseSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
