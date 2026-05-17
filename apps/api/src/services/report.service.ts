import type { AuthUser } from "../middleware/auth";
import { analysisService } from "./analysis.service";

export class ReportService {
  async json(contractId: string, user: AuthUser) {
    return analysisService.result(contractId, user);
  }

  async pdf(contractId: string, user: AuthUser) {
    const report = await this.json(contractId, user);
    const pdf = buildRiskReportPdf(formatRiskReportText(report));
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="lexguard-risk-report.pdf"',
        "Content-Length": String(Buffer.byteLength(pdf)),
        "X-Content-Type-Options": "nosniff",
      },
    });
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

type PdfTextStyle = {
  font: "F1" | "F2";
  fontSize: number;
  leading: number;
  indent: number;
  gapAfter: number;
};

const PDF_PAGE = {
  width: 612,
  height: 792,
  marginX: 54,
  marginTop: 54,
  marginBottom: 54,
};

export function buildRiskReportPdf(text: string) {
  const pages: string[][] = [[]];
  let y = PDF_PAGE.height - PDF_PAGE.marginTop;
  const sourceLines =
    text.trim().length > 0 ? text.split(/\r?\n/) : ["No report content was generated."];

  const addPage = () => {
    pages.push([]);
    y = PDF_PAGE.height - PDF_PAGE.marginTop;
  };

  for (const [index, rawLine] of sourceLines.entries()) {
    const style = pdfStyleForLine(rawLine, index);
    const content = normalizePdfText(rawLine.trimStart());

    if (content.length === 0) {
      y -= 8;
      if (y < PDF_PAGE.marginBottom + style.leading) addPage();
      continue;
    }

    const availableWidth = PDF_PAGE.width - PDF_PAGE.marginX * 2 - style.indent;
    const wrappedLines = wrapPdfText(content, availableWidth, style.fontSize, style.font === "F2");

    for (const line of wrappedLines) {
      if (y < PDF_PAGE.marginBottom + style.fontSize) addPage();
      pages[pages.length - 1]?.push(
        `BT /${style.font} ${formatPdfNumber(style.fontSize)} Tf ${formatPdfNumber(
          PDF_PAGE.marginX + style.indent,
        )} ${formatPdfNumber(y)} Td (${escapePdfLiteral(line)}) Tj ET`,
      );
      y -= style.leading;
    }
    y -= style.gapAfter;
  }

  return serializePdf(pages.map((page) => page.join("\n")));
}

function pdfStyleForLine(line: string, index: number): PdfTextStyle {
  const trimmed = line.trim();
  if (index === 0 || trimmed === "LEXGUARD Risk Report") {
    return { font: "F2", fontSize: 18, leading: 24, indent: 0, gapAfter: 8 };
  }
  if (trimmed === "Clause findings" || trimmed === "Privacy and compliance flags") {
    return { font: "F2", fontSize: 14, leading: 20, indent: 0, gapAfter: 4 };
  }
  if (trimmed.startsWith("- ")) {
    return { font: "F2", fontSize: 11.5, leading: 16, indent: 0, gapAfter: 2 };
  }
  if (line.startsWith("  ")) {
    return { font: "F1", fontSize: 10.5, leading: 15, indent: 16, gapAfter: 2 };
  }
  return { font: "F1", fontSize: 11, leading: 16, indent: 0, gapAfter: 2 };
}

function wrapPdfText(text: string, maxWidth: number, fontSize: number, bold = false) {
  const averageGlyphWidth = fontSize * (bold ? 0.56 : 0.52);
  const maxChars = Math.max(12, Math.floor(maxWidth / averageGlyphWidth));
  const output: string[] = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    if (word.length > maxChars) {
      if (current.length > 0) {
        output.push(current);
        current = "";
      }
      for (let start = 0; start < word.length; start += maxChars) {
        output.push(word.slice(start, start + maxChars));
      }
      continue;
    }

    const candidate = current.length > 0 ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current.length > 0) {
      output.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) output.push(current);
  return output.length > 0 ? output : [""];
}

function serializePdf(pageStreams: string[]) {
  const objects: string[] = [];
  const pageObjectNumbers = pageStreams.map((_, index) => 5 + index * 2);

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((objectNumber) => `${objectNumber} 0 R`).join(" ")}] /Count ${pageStreams.length} >>`;
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[3] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  for (const [index, stream] of pageStreams.entries()) {
    const pageObjectNumber = pageObjectNumbers[index];
    if (pageObjectNumber === undefined) {
      throw new Error("Unable to allocate PDF page object");
    }
    const contentObjectNumber = pageObjectNumber + 1;
    objects[pageObjectNumber - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE.width} ${PDF_PAGE.height}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber - 1] =
      `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets[index + 1] = Buffer.byteLength(pdf);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function normalizePdfText(text: string) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfLiteral(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function formatPdfNumber(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export const reportService = new ReportService();
