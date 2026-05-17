import { analysisJobs, clauses, contracts, tenantContractFilter } from "@lexguard/db";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { getAnalysisQueue } from "../lib/queue";
import type { AuthUser } from "../middleware/auth";

export class AnalysisService {
  async trigger(contractId: string, user: AuthUser) {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(
        tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role }, contractId),
      )
      .limit(1);
    if (!contract) return null;
    const [analysis] = await db
      .insert(analysisJobs)
      .values({ contractId, status: "queued" })
      .returning();
    if (!analysis) {
      throw new Error("Unable to create analysis job");
    }
    const job = await getAnalysisQueue().add("ingest", { contractId, analysisJobId: analysis.id });
    await db
      .update(analysisJobs)
      .set({ bullJobId: job.id })
      .where(eq(analysisJobs.id, analysis.id));
    await db
      .update(contracts)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(contracts.id, contractId));
    return { analysisJobId: analysis.id, status: "queued" };
  }

  async status(contractId: string, user: AuthUser) {
    const [analysis] = await db
      .select()
      .from(analysisJobs)
      .innerJoin(contracts, eq(analysisJobs.contractId, contracts.id))
      .where(
        and(
          eq(analysisJobs.contractId, contractId),
          tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role }, contractId),
        ),
      )
      .orderBy(desc(analysisJobs.createdAt))
      .limit(1);
    const status = analysis?.analysis_jobs.status ?? "queued";
    const progressByStatus: Record<string, number> = {
      queued: 5,
      extracting: 30,
      scoring: 55,
      explaining: 80,
      done: 100,
      failed: 100,
    };
    return { status, progress: progressByStatus[status] ?? 0, currentStage: status };
  }

  async result(contractId: string, user: AuthUser) {
    const [analysis] = await db
      .select()
      .from(analysisJobs)
      .innerJoin(contracts, eq(analysisJobs.contractId, contracts.id))
      .where(
        and(
          eq(analysisJobs.contractId, contractId),
          tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role }, contractId),
        ),
      )
      .limit(1);
    const rows = await db
      .select({ clause: clauses })
      .from(clauses)
      .innerJoin(contracts, eq(clauses.contractId, contracts.id))
      .where(
        and(
          eq(clauses.contractId, contractId),
          tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role }, contractId),
        ),
      );
    return {
      overallRisk: {
        score: analysis?.analysis_jobs.overallRiskScore ?? 0,
        level: analysis?.analysis_jobs.riskLevel ?? "low",
        summary: analysis?.analysis_jobs.summary ?? "Analysis has not completed yet.",
      },
      clauses: rows.map((row) => row.clause),
      privacyFlags: analysis?.analysis_jobs.privacyFlags
        ? JSON.parse(analysis.analysis_jobs.privacyFlags)
        : [],
      summary: analysis?.analysis_jobs.summary ?? "",
    };
  }
}

export const analysisService = new AnalysisService();
