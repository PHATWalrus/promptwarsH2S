import { beforeEach, describe, expect, test } from "bun:test";
import { createMemoryChromeStorage, extensionStorage } from "./storage";
import type { AnalysisRecord } from "./types";

describe("extension storage helpers", () => {
  beforeEach(() => {
    globalThis.chrome = {
      storage: createMemoryChromeStorage(),
    } as unknown as typeof chrome;
  });

  test("stores tab analysis records in local storage", async () => {
    const record: AnalysisRecord = {
      tabId: 7,
      url: "https://example.com/terms",
      title: "Terms",
      detectedType: "tos",
      confidence: 0.82,
      status: "complete",
      updatedAt: 123,
      contractId: "contract-1",
      result: {
        overallRisk: { score: 82, level: "high", summary: "Risky renewal terms." },
        clauses: [],
        privacyFlags: [],
        summary: "Risky renewal terms.",
      },
    };

    await extensionStorage.setAnalysisRecord(record);

    expect(await extensionStorage.getAnalysisRecord(7)).toEqual(record);
  });
});
