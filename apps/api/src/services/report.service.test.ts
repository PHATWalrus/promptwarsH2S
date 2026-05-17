import { describe, expect, test } from "bun:test";
import { formatRiskReportText } from "./report.service";

describe("risk report formatting", () => {
  test("includes risk score, clauses, implications, negotiation tips, privacy flags, and disclaimer", () => {
    const text = formatRiskReportText({
      summary: "Broad IP transfer and auto-renewal risk.",
      overallRisk: { score: 86, level: "critical", summary: "Critical risk" },
      clauses: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          contractId: "00000000-0000-4000-8000-000000000002",
          category: "ip_assignment",
          rawText: "All future work is assigned.",
          riskLevel: "critical",
          riskScore: 86,
          plainExplanation: "This may transfer ownership of future work.",
          scenarioIllustration: "A side project could become disputed.",
          negotiationTips: ["Limit assignment to work created for the project."],
        },
      ],
      privacyFlags: ["No data retention limit."],
    });

    expect(text).toContain("Overall risk: critical (86/100)");
    expect(text).toContain("This may transfer ownership of future work.");
    expect(text).toContain("A side project could become disputed.");
    expect(text).toContain("Limit assignment");
    expect(text).toContain("No data retention limit.");
    expect(text).toContain("legal information, not legal advice");
  });
});
