import { describe, expect, test } from "bun:test";
import { createGenerateContentConfig } from "./llm";

describe("Gemini request config", () => {
  test("enables Google Search grounding by default for text generation", () => {
    const config = createGenerateContentConfig(
      {
        model: "gemini-2.5-flash",
        systemPrompt: "You are a legal analysis assistant.",
        userPrompt: "Summarize current FTC non-compete rule status.",
      },
      true,
    );

    expect(config).toMatchObject({
      systemInstruction: "You are a legal analysis assistant.",
      temperature: 0.2,
      maxOutputTokens: 4096,
      responseMimeType: "text/plain",
      tools: [{ googleSearch: {} }],
    });
  });

  test("keeps grounding on for JSON prompts without unsupported JSON MIME tool config", () => {
    const config = createGenerateContentConfig(
      {
        model: "gemini-2.5-flash",
        systemPrompt: "Return valid JSON.",
        userPrompt: "Score this clause.",
        responseFormat: "json",
      },
      true,
    );

    expect(config.tools).toEqual([{ googleSearch: {} }]);
    expect(config.responseMimeType).toBeUndefined();
  });

  test("omits Google Search grounding when explicitly disabled", () => {
    const config = createGenerateContentConfig(
      {
        model: "gemini-2.5-flash",
        systemPrompt: "You are a legal analysis assistant.",
        userPrompt: "Explain the uploaded clause only.",
      },
      false,
    );

    expect(config.tools).toBeUndefined();
  });
});
