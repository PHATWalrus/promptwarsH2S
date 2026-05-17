import { describe, expect, test } from "bun:test";
import {
  clauseExtractPrompt,
  explainPrompt,
  privacyAnalysisPrompt,
  riskScorePrompt,
  scenarioQAPrompt,
} from "../index";

const prompts = [
  clauseExtractPrompt,
  explainPrompt,
  privacyAnalysisPrompt,
  riskScorePrompt,
  scenarioQAPrompt,
];

describe("AI prompt contracts", () => {
  test("do not contain placeholder TODO copy", () => {
    for (const prompt of prompts) {
      expect(prompt).not.toContain("TODO");
      expect(prompt.length).toBeGreaterThan(400);
    }
  });

  test("require legal information disclaimer and JSON discipline where relevant", () => {
    expect(scenarioQAPrompt).toContain("not legal advice");
    expect(clauseExtractPrompt).toContain("valid JSON");
    expect(riskScorePrompt).toContain("valid JSON");
    expect(explainPrompt).toContain("valid JSON");
    expect(privacyAnalysisPrompt).toContain("valid JSON");
  });
});
