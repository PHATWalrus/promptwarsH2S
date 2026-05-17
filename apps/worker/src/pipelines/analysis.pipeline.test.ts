import { describe, expect, test } from "bun:test";
import { ANALYSIS_PIPELINE_STAGES, getNextStage } from "./analysis.pipeline";

describe("analysis pipeline", () => {
  test("orders legal intelligence stages deterministically", () => {
    expect(ANALYSIS_PIPELINE_STAGES).toEqual([
      "ingest",
      "extract",
      "risk",
      "privacy",
      "explain",
      "report",
    ]);
  });

  test("returns the next stage for progress orchestration", () => {
    expect(getNextStage("risk")).toBe("privacy");
    expect(getNextStage("report")).toBeNull();
  });
});
