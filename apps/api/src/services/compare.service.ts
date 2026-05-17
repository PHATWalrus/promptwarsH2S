import { clauses, contracts, tenantContractFilter } from "@lexguard/db";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../lib/db";
import type { AuthUser } from "../middleware/auth";

const KEY_TERMS = [
  "liability_cap",
  "termination",
  "data_sharing",
  "ip_assignment",
  "arbitration",
] as const;

export async function compareContracts(contractIds: string[], user: AuthUser) {
  const visibleContracts = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(
      and(
        inArray(contracts.id, contractIds),
        tenantContractFilter({ userId: user.id, orgId: user.orgId, role: user.role }),
      ),
    );
  const visibleIds = visibleContracts.map((contract) => contract.id);
  const rows =
    visibleIds.length > 0
      ? await db
          .select({ clause: clauses })
          .from(clauses)
          .innerJoin(contracts, eq(clauses.contractId, contracts.id))
          .where(and(inArray(clauses.contractId, visibleIds), eq(contracts.orgId, user.orgId)))
      : [];
  return {
    contractIds: visibleIds,
    matrix: KEY_TERMS.map((term) => ({
      term,
      standardBenchmark: standardBenchmarkFor(term),
      contracts: visibleIds.map((contractId) => ({
        contractId,
        clauses: rows
          .map((row) => row.clause)
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

function standardBenchmarkFor(term: (typeof KEY_TERMS)[number]) {
  const benchmarks: Record<(typeof KEY_TERMS)[number], string> = {
    liability_cap:
      "Balanced clauses cap ordinary damages while preserving remedies for confidentiality, IP misuse, data security, fraud, and willful misconduct.",
    termination:
      "Balanced termination clauses provide clear notice periods, cure rights, and mutual termination rights.",
    data_sharing:
      "Balanced data clauses limit use to defined purposes, name subprocessors or controls, and include retention/deletion rights.",
    ip_assignment:
      "Balanced IP clauses transfer only work created for the engagement and carve out pre-existing or independent work.",
    arbitration:
      "Balanced dispute clauses avoid one-sided venue, preserve urgent equitable relief, and do not hide class-action waivers.",
  };
  return benchmarks[term];
}
