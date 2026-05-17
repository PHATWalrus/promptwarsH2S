import type { AuthUser } from "../middleware/auth";
import { analysisService } from "./analysis.service";

export class ReportService {
  async json(contractId: string, user: AuthUser) {
    return analysisService.result(contractId, user);
  }

  async pdf(contractId: string, user: AuthUser) {
    const report = await this.json(contractId, user);
    return minimalPdf(
      `LEXGUARD Risk Report\n\n${report.summary}\n\nOverall risk: ${report.overallRisk.level}`,
    );
  }
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
