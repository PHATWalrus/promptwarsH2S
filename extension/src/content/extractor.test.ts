import { beforeEach, describe, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { extractContent } from "./extractor";

describe("content extractor", () => {
  beforeEach(() => {
    const window = new Window({ url: "https://example.com/privacy" });
    globalThis.window = window as unknown as Window & typeof globalThis;
    globalThis.document = window.document as unknown as Document;
  });

  test("strips layout and unsafe nodes while preserving headings and lists", () => {
    document.body.innerHTML = `
      <header>Navigation should vanish</header>
      <main class="policy">
        <h1>Privacy Policy</h1>
        <p>We collect personal data only as described herein.</p>
        <h2>1. Data Sharing</h2>
        <ul><li>We may share data with processors.</li></ul>
        <script>alert("nope")</script>
      </main>
      <footer>Footer should vanish</footer>
    `;

    const extracted = extractContent("privacy_policy");

    expect(extracted.title).toBe("Privacy Policy");
    expect(extracted.text).toContain("Privacy Policy");
    expect(extracted.text).toContain("We may share data with processors.");
    expect(extracted.text).not.toContain("Navigation should vanish");
    expect(extracted.text).not.toContain("alert");
    expect(extracted.sections).toEqual([
      {
        heading: "Privacy Policy",
        content: "We collect personal data only as described herein.",
        level: 1,
      },
      {
        heading: "1. Data Sharing",
        content: "We may share data with processors.",
        level: 2,
      },
    ]);
  });

  test("truncates long page text with a notice", () => {
    document.body.innerHTML = `<main><h1>Terms</h1><p>${"shall ".repeat(12000)}</p></main>`;

    const extracted = extractContent("tos");

    expect(extracted.text.length).toBeLessThanOrEqual(50120);
    expect(extracted.text).toContain("[LEXGUARD: Page text truncated at 50000 characters.]");
  });
});
