import { beforeEach, describe, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { applyHighlights, clearHighlights } from "./highlighter";

describe("risk highlighter", () => {
  beforeEach(() => {
    const window = new Window({ url: "https://example.com/terms" });
    globalThis.window = window as unknown as Window & typeof globalThis;
    globalThis.document = window.document as unknown as Document;
    globalThis.NodeFilter = window.NodeFilter as unknown as typeof NodeFilter;
    globalThis.Node = window.Node as unknown as typeof Node;
  });

  test("wraps a multi-node text match without using HTML replacement", () => {
    document.body.innerHTML = `
      <main>
        <p>You agree to <strong>binding arbitration</strong> and waive class action rights.</p>
      </main>
    `;

    applyHighlights([
      {
        id: "clause-1",
        contractId: "contract-1",
        category: "arbitration",
        rawText: "binding arbitration and waive class action rights",
        riskLevel: "high",
        riskScore: 82,
        plainExplanation: "This limits how disputes can be handled.",
        negotiationTips: ["Ask for a court option."],
        isAmbiguous: false,
        isOnesSided: true,
        deviatesFromStandard: true,
      },
    ]);

    const marks = document.querySelectorAll("mark[data-lexguard-clause-id='clause-1']");
    expect(marks.length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain("binding arbitration and waive class action rights");

    clearHighlights();

    expect(document.querySelector("mark[data-lexguard-clause-id]")).toBeNull();
    expect(document.body.textContent).toContain("binding arbitration and waive class action rights");
  });
});
