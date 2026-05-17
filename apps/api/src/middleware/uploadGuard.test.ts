import { describe, expect, test } from "bun:test";
import { detectFileSignature, resolveUploadScanner } from "./uploadGuard";

describe("upload guard magic-byte detection", () => {
  test("detects PDFs by bytes instead of trusting MIME", () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
    expect(detectFileSignature(bytes)).toBe("application/pdf");
  });

  test("rejects spoofed executable bytes", () => {
    const bytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
    expect(detectFileSignature(bytes)).toBeNull();
  });

  test("accepts valid UTF-8 legal text while rejecting binary controls", () => {
    const legalText = new TextEncoder().encode("Résumé terms shall govern indemnité.");
    expect(detectFileSignature(legalText)).toBe("text/plain");

    const binary = new Uint8Array([0x48, 0x00, 0x49, 0x1f]);
    expect(detectFileSignature(binary)).toBeNull();
  });

  test("does not allow the disabled scanner in production", () => {
    expect(() =>
      resolveUploadScanner({
        NODE_ENV: "production",
        UPLOAD_SCANNER_MODE: "disabled",
      }),
    ).toThrow(/UPLOAD_SCANNER_MODE/);
  });
});
