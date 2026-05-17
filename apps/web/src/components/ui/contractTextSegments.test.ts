import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import type { Clause } from "@lexguard/types";
import { buildContractTextSegments } from "./contractTextSegments";

describe("contract text segmentation", () => {
  it("keeps embedded HTML as plain segment text", () => {
    const text = 'Confidentiality <img src=x onerror="alert(1)"> survives termination.';

    const segments = buildContractTextSegments(text, []);

    expect(segments).toEqual([{ kind: "text", key: "text-0", text }]);
    expect(segments[0]?.text).toContain("<img");
  });

  it("keeps highlighted clause spans as plain text slices", () => {
    const text = 'Risky clause <script>alert("xss")</script> tail';
    const clause: Clause = {
      id: "00000000-0000-4000-8000-000000000001",
      contractId: "00000000-0000-4000-8000-000000000002",
      category: "other",
      rawText: '<script>alert("xss")</script>',
      spanStart: 13,
      spanEnd: 42,
      riskLevel: "high",
      riskScore: 80,
      negotiationTips: [],
      isAmbiguous: false,
      isOnesSided: false,
      deviatesFromStandard: false,
    };

    const segments = buildContractTextSegments(text, [clause], clause.id);

    expect(segments).toContainEqual({
      active: true,
      clause,
      key: `clause-${clause.id}`,
      kind: "clause",
      text: '<script>alert("xss")</script>',
    });
  });

  it("does not use raw HTML rendering in the contract viewer", () => {
    const source = readFileSync(new URL("./ContractViewer.tsx", import.meta.url), "utf8");

    expect(source).not.toContain("dangerouslySetInnerHTML");
  });
});
