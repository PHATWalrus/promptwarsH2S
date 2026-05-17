import { describe, expect, test } from "bun:test";
import { assessExtractionQuality } from "./ingest.job";

describe("document ingestion quality assessment", () => {
  test("flags scanned PDFs for OCR fallback when extracted text is empty", () => {
    expect(assessExtractionQuality({ mimeType: "application/pdf", extractedText: "" })).toEqual({
      ocrNeeded: true,
      ocrUsed: false,
      textDensity: "empty",
    });
  });

  test("does not request OCR for text-bearing documents", () => {
    expect(
      assessExtractionQuality({
        mimeType: "application/pdf",
        extractedText: "This agreement contains a liability clause.",
      }),
    ).toMatchObject({ ocrNeeded: false, textDensity: "readable" });
  });
});
