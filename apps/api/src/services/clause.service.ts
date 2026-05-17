import { clauseFeedback, clauses, contracts } from "@lexguard/db";
import type { ClauseFeedbackInput } from "@lexguard/types";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import type { AuthUser } from "../middleware/auth";
import { aiClient } from "./ai.service";

export class ClauseService {
  async list(
    contractId: string,
    user: AuthUser,
    filters: { riskLevel?: string; category?: string; sort?: string },
  ) {
    const base = [eq(clauses.contractId, contractId), eq(contracts.orgId, user.orgId)];
    if (filters.riskLevel) base.push(eq(clauses.riskLevel, filters.riskLevel as never));
    if (filters.category) base.push(eq(clauses.category, filters.category as never));
    return db
      .select({ clause: clauses })
      .from(clauses)
      .innerJoin(contracts, eq(clauses.contractId, contracts.id))
      .where(and(...base))
      .orderBy(desc(filters.sort === "created" ? clauses.createdAt : clauses.riskScore));
  }

  async get(clauseId: string, user: AuthUser) {
    const [row] = await db
      .select({ clause: clauses })
      .from(clauses)
      .innerJoin(contracts, eq(clauses.contractId, contracts.id))
      .where(and(eq(clauses.id, clauseId), eq(contracts.orgId, user.orgId)))
      .limit(1);
    return row?.clause;
  }

  async feedback(clauseId: string, user: AuthUser, input: ClauseFeedbackInput) {
    const clause = await this.get(clauseId, user);
    if (!clause) return null;
    const [feedback] = await db
      .insert(clauseFeedback)
      .values({
        clauseId,
        userId: user.id,
        feedbackType: input.feedbackType,
        comment: input.comment,
      })
      .returning();
    return feedback;
  }

  async search(query: string, user: AuthUser, options: { contractId?: string; limit: number }) {
    const embedding = await aiClient.embed(query);
    const base = [eq(contracts.orgId, user.orgId)];
    if (options.contractId) base.push(eq(clauses.contractId, options.contractId));
    return db
      .select({ clause: clauses })
      .from(clauses)
      .innerJoin(contracts, eq(clauses.contractId, contracts.id))
      .where(and(...base))
      .orderBy(desc(clauses.confidenceScore))
      .limit(options.limit)
      .then((rows) =>
        rows.map((row) => ({ ...row.clause, queryEmbeddingDimensions: embedding.length })),
      );
  }
}

export const clauseService = new ClauseService();
