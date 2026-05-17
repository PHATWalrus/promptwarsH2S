import { describe, expect, test } from "bun:test";
import { buildRiskReportPdf, formatRiskReportText } from "./report.service";

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

  test("renders long reports as wrapped, paginated PDF content", () => {
    const longReport = [
      "LEXGUARD Risk Report",
      "",
      "This is legal information, not legal advice.",
      "",
      "Overall risk: critical (95/100)",
      "",
      "Clause findings",
      ...Array.from({ length: 16 }, (_, index) =>
        [
          "",
          `- clause ${index + 1}: critical (90/100)`,
          `  Text: ${"This clause contains a long risk explanation that must wrap within the PDF page instead of running off the right edge. ".repeat(3)}`,
          `  Explanation: ${"The report should remain readable when exported as PDF. ".repeat(3)}`,
        ].join("\n"),
      ),
    ].join("\n");

    const pdf = buildRiskReportPdf(longReport);

    expect(pdf).toStartWith("%PDF-1.4");
    expect(pdf).toContain("xref");
    expect(pdf).toContain("startxref");
    expect(pdf).not.toContain("\\n\\nThis is legal information");
    expect(pdf.match(/\/Type \/Page\b/g)?.length ?? 0).toBeGreaterThan(1);
    expect(pdf.match(/\) Tj/g)?.length ?? 0).toBeGreaterThan(30);
  });
});
