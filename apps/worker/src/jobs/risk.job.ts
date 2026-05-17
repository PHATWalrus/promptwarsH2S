import { riskScorePrompt } from "@lexguard/ai";
import { analysisJobs, clauses } from "@lexguard/db";
import type { Job } from "bullmq";
import { eq } from "drizzle-orm";
import { env } from "../env";
import { aiClient, db } from "../lib";
import type { AnalysisJobData } from "../pipelines/analysis.pipeline";
import { parseRiskScore } from "./ai-output";

export async function riskJob(job: Job<AnalysisJobData>) {
  await job.updateProgress(60);
  await db
    .update(analysisJobs)
    .set({ status: "scoring", updatedAt: new Date() })
    .where(eq(analysisJobs.id, job.data.analysisJobId));
  const rows = await db
    .select()
    .from(clauses)
    .where(eq(clauses.analysisJobId, job.data.analysisJobId));
  let scoredRows = rows.map(applyDeterministicRisk);
  if (rows.length > 0) {
    const result = await aiClient.complete({
      model: env.DEFAULT_LLM_MODEL,
      systemPrompt: riskScorePrompt,
      userPrompt: JSON.stringify({
        clauses: rows.map((clause) => ({
          category: clause.category,
          rawText: clause.rawText,
          isAmbiguous: clause.isAmbiguous,
          isOnesSided: clause.isOnesSided,
        })),
      }),
      responseFormat: "json",
    });
    const parsed = parseRiskScore(result.content);
    scoredRows = scoredRows.map((row) => {
      const llm = parsed.clauses.find((item) => item.rawText === row.rawText);
      return llm
        ? {
            ...row,
            riskLevel: llm.riskLevel,
            riskScore: Math.max(row.riskScore, llm.riskScore),
            riskRationale: llm.riskRationale,
            deviatesFromStandard: llm.deviatesFromStandard,
            standardComparison: llm.standardComparison ?? null,
          }
        : row;
    });
  }
  for (const clause of scoredRows) {
    await db
      .update(clauses)
      .set({
        riskLevel: clause.riskLevel,
        riskScore: clause.riskScore,
        riskRationale: clause.riskRationale,
        deviatesFromStandard: clause.deviatesFromStandard,
        standardComparison: clause.standardComparison,
      })
      .where(eq(clauses.id, clause.id));
  }
  const maxRisk = Math.max(1, ...scoredRows.map((clause) => clause.riskScore));
  const riskLevel =
    maxRisk >= 85 ? "critical" : maxRisk >= 70 ? "high" : maxRisk >= 40 ? "medium" : "low";
  await db
    .update(analysisJobs)
    .set({ overallRiskScore: maxRisk, riskLevel, updatedAt: new Date() })
    .where(eq(analysisJobs.id, job.data.analysisJobId));
  return { stage: "risk", maxRisk, riskLevel };
}

function applyDeterministicRisk(clause: typeof clauses.$inferSelect) {
  const text = clause.rawText.toLowerCase();
  let riskScore = clause.riskScore;
  let riskLevel = clause.riskLevel;
  const reasons: string[] = [];

  if (clause.category === "non_compete" || text.includes("non-compete")) {
    riskScore = Math.max(riskScore, 82);
    reasons.push("Restrictive covenant may limit future work options.");
  }
  if (clause.category === "indemnity" || text.includes("indemnif")) {
    riskScore = Math.max(riskScore, text.includes("any and all") ? 88 : 72);
    reasons.push("Indemnity wording may shift broad financial exposure.");
  }
  if (clause.category === "auto_renewal" || text.includes("automatically renew")) {
    riskScore = Math.max(riskScore, 64);
    reasons.push("Auto-renewal can create lock-in or surprise renewal obligations.");
  }
  if (clause.category === "arbitration" || text.includes("class action waiver")) {
    riskScore = Math.max(riskScore, 76);
    reasons.push("Dispute clause may reduce court or collective action options.");
  }
  if (clause.category === "ip_assignment" || text.includes("assign all")) {
    riskScore = Math.max(riskScore, 78);
    reasons.push("IP assignment may transfer broad ownership rights.");
  }
  if (clause.category === "payment" && /\b(90|ninety)\b/.test(text)) {
    riskScore = Math.max(riskScore, 58);
    reasons.push("Long payment terms can create cash-flow risk.");
  }
  riskLevel =
    riskScore >= 85 ? "critical" : riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
  return {
    ...clause,
    riskScore,
    riskLevel,
    riskRationale: reasons.join(" ") || clause.riskRationale,
  };
}
