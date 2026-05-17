import type { AuthUser } from "../middleware/auth";
import { analysisService } from "./analysis.service";

export class ReportService {
  async json(contractId: string, user: AuthUser) {
    return analysisService.result(contractId, user);
  }

  async pdf(contractId: string, user: AuthUser) {
    const report = await this.json(contractId, user);
    return minimalPdf(formatRiskReportText(report));
  }
}

export function formatRiskReportText(report: {
  summary: string;
  overallRisk: { score: number; level: string; summary: string };
  clauses: Array<{
    id?: string;
    contractId?: string;
    category: string;
    rawText: string;
    riskLevel: string;
    riskScore: number;
    riskRationale?: string | null;
    plainExplanation?: string | null;
    scenarioIllustration?: string | null;
    negotiationTips?: string[] | null;
  }>;
  privacyFlags?: string[];
}) {
  const lines = [
    "LEXGUARD Risk Report",
    "",
    "This is legal information, not legal advice.",
    "",
    report.summary || report.overallRisk.summary,
    `Overall risk: ${report.overallRisk.level} (${report.overallRisk.score}/100)`,
    "",
    "Clause findings",
  ];

  for (const clause of report.clauses) {
    lines.push(
      "",
      `- ${clause.category.replaceAll("_", " ")}: ${clause.riskLevel} (${clause.riskScore}/100)`,
      `  Text: ${clause.rawText}`,
    );
    if (clause.riskRationale) lines.push(`  Risk: ${clause.riskRationale}`);
    if (clause.plainExplanation) lines.push(`  Explanation: ${clause.plainExplanation}`);
    if (clause.scenarioIllustration) lines.push(`  Scenario: ${clause.scenarioIllustration}`);
    if (clause.negotiationTips?.length) {
      lines.push(`  Negotiation: ${clause.negotiationTips.join(" ")}`);
    }
  }

  if (report.privacyFlags?.length) {
    lines.push(
      "",
      "Privacy and compliance flags",
      ...report.privacyFlags.map((flag) => `- ${flag}`),
    );
  }

  return lines.join("\n");
}

function minimalPdf(text: string) {
  const escaped = text.replace(/[()\\]/g, "\\$&").replace(/\n/g, "\\n");
  const body = `BT /F1 12 Tf 50 750 Td (${escaped}) Tj ET`;
  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${body.length} >> stream
${body}
endstream endobj
trailer << /Root 1 0 R >>
%%EOF`;
  return new Response(pdf, { headers: { "Content-Type": "application/pdf" } });
}

export const reportService = new ReportService();
