import { clauses } from "@lexguard/db";
import { inArray } from "drizzle-orm";
import { db } from "../lib/db";

const KEY_TERMS = [
  "liability_cap",
  "termination",
  "data_sharing",
  "ip_assignment",
  "arbitration",
] as const;

export async function compareContracts(contractIds: string[]) {
  const rows = await db.select().from(clauses).where(inArray(clauses.contractId, contractIds));
  return {
    contractIds,
    matrix: KEY_TERMS.map((term) => ({
      term,
      contracts: contractIds.map((contractId) => ({
        contractId,
        clauses: rows
          .filter((clause) => clause.contractId === contractId && clause.category === term)
          .map((clause) => ({
            clauseId: clause.id,
            riskLevel: clause.riskLevel,
            riskScore: clause.riskScore,
            summary: clause.plainExplanation ?? clause.rawText.slice(0, 240),
          })),
      })),
    })),
  };
}
