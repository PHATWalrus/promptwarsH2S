import { describe, expect, test } from "bun:test";
import { isLegalDocument, mapDetectedTypeToContractType } from "./detector";

describe("legal document detector", () => {
  test("scores terms pages above the injection threshold", () => {
    const result = isLegalDocument({
      url: "https://example.com/legal/terms-of-service",
      title: "Example Terms of Service",
      text:
        "These terms govern your use of the service. You shall not misuse the service. " +
        "The agreement includes arbitration, indemnify obligations, termination rights, " +
        "governing law, privacy policy provisions, and numbered sections. 1. Your account. " +
        "2. Limitation of liability. 3. Termination.",
    });

    expect(result.score).toBeGreaterThan(0.4);
    expect(result.type).toBe("tos");
  });

  test("maps privacy and unknown detector types to backend contract types", () => {
    expect(mapDetectedTypeToContractType("privacy_policy")).toBe("privacy_policy");
    expect(mapDetectedTypeToContractType("contract")).toBe("other");
    expect(mapDetectedTypeToContractType("unknown")).toBe("other");
  });
});
