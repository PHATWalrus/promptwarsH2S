import { describe, expect, test } from "bun:test";
import { applyDeterministicRisk } from "./risk.job";

const baseClause = {
  id: "00000000-0000-4000-8000-000000000001",
  contractId: "00000000-0000-4000-8000-000000000002",
  analysisJobId: "00000000-0000-4000-8000-000000000003",
  category: "other",
  rawText: "",
  pageNumber: null,
  spanStart: null,
  spanEnd: null,
  riskLevel: "medium",
  riskScore: 50,
  riskRationale: null,
  plainExplanation: null,
  scenarioIllustration: null,
  negotiationTips: null,
  isAmbiguous: false,
  isOnesSided: false,
  deviatesFromStandard: false,
  standardComparison: null,
  embedding: null,
  confidenceScore: 0.8,
  createdAt: new Date(),
} as const;

describe("deterministic contract risk scoring", () => {
  test("covers privacy, compliance, financial, employment, IP, arbitration, and ambiguity risks", () => {
    const scored = applyDeterministicRisk({
      ...baseClause,
      category: "data_sharing",
      rawText:
        "Provider may share personal data with affiliates for any business purpose, retain it indefinitely, assign all future IP, require class action waiver arbitration, impose auto renewal fees, and restrict post-employment work.",
      isAmbiguous: true,
      isOnesSided: true,
    });

    expect(scored.riskLevel).toBe("critical");
    expect(scored.riskScore).toBeGreaterThanOrEqual(85);
    expect(scored.riskRationale).toContain("privacy");
    expect(scored.riskRationale).toContain("employment");
    expect(scored.riskRationale).toContain("IP");
    expect(scored.riskRationale).toContain("ambiguous");
  });
});
