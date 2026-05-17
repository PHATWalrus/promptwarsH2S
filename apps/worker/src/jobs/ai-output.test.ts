import { describe, expect, test } from "bun:test";
import { parseClauseExtraction, parseRiskScore } from "./ai-output";

describe("worker AI output parsing", () => {
  test("parses strict extracted clause JSON", () => {
    const result = parseClauseExtraction(
      JSON.stringify({
        clauses: [
          {
            category: "indemnity",
            rawText: "Provider indemnifies Client for all claims.",
            spanStart: 4,
            spanEnd: 48,
            confidenceScore: 0.91,
          },
        ],
      }),
    );

    expect(result.clauses[0]?.category).toBe("indemnity");
  });

  test("rejects unknown risk levels", () => {
    expect(() =>
      parseRiskScore(
        JSON.stringify({
          clauses: [
            {
              rawText: "Bad clause",
              riskLevel: "severe",
              riskScore: 99,
              riskRationale: "Invalid level should fail",
            },
          ],
          overallRiskScore: 99,
          riskLevel: "critical",
        }),
      ),
    ).toThrow();
  });
});
