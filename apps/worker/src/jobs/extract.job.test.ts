import { describe, expect, test } from "bun:test";
import { resolveExtractionSource } from "./extract.job";

describe("contract text extraction gate", () => {
  test("returns extracted text when document parsing found content", () => {
    const source = resolveExtractionSource({
      text: "  This agreement has usable text.  ",
      ocrNeeded: false,
      ocrUsed: false,
      textDensity: "readable",
    });

    expect(source).toEqual({ kind: "text", text: "This agreement has usable text." });
  });

  test("uses direct PDF extraction when parsed text is empty", () => {
    const pdf = new Uint8Array([37, 80, 68, 70]);
    const source = resolveExtractionSource({
      text: "",
      ocrNeeded: true,
      ocrUsed: false,
      textDensity: "empty",
      file: { data: pdf, mimeType: "application/pdf" },
    });

    expect(source).toEqual({ kind: "file", file: { data: pdf, mimeType: "application/pdf" } });
  });
});
