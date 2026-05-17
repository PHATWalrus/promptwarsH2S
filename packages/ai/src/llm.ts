import { GoogleGenAI } from "@google/genai";

export type LLMModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.5-flash-lite"
  | "gemini-3-flash-preview"
  | "gemini-3.1-flash-lite";

export interface CompleteParams {
  model: LLMModel;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: "text" | "json";
  maxTokens?: number;
  temperature?: number;
  searchGrounding?: boolean;
}

export interface LLMClient {
  complete(params: CompleteParams): Promise<{ content: string; tokensUsed: number; cost: number }>;
  embed(text: string): Promise<number[]>;
  streamComplete(params: CompleteParams): AsyncIterable<string>;
}

const GEMINI_FLASH_INPUT_PER_MILLION_CENTS = 30;
const GEMINI_FLASH_OUTPUT_PER_MILLION_CENTS = 250;

export class GeminiLLMClient implements LLMClient {
  private readonly ai: GoogleGenAI;

  constructor(
    apiKey: string,
    private readonly embeddingModel = "gemini-embedding-001",
    private readonly searchGrounding = true,
  ) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async complete(params: CompleteParams) {
    const result = await this.ai.models.generateContent({
      model: params.model,
      contents: params.userPrompt,
      config: createGenerateContentConfig(params, params.searchGrounding ?? this.searchGrounding),
    });

    const content = result.text ?? "";
    const inputTokens = result.usageMetadata?.promptTokenCount ?? estimateTokens(params.userPrompt);
    const outputTokens = result.usageMetadata?.candidatesTokenCount ?? estimateTokens(content);
    const tokensUsed = inputTokens + outputTokens;

    return {
      content,
      tokensUsed,
      cost: estimateGeminiCostCents(inputTokens, outputTokens) / 100,
    };
  }

  async embed(text: string) {
    const result = await this.ai.models.embedContent({
      model: this.embeddingModel,
      contents: text,
      config: { outputDimensionality: 1536 },
    });
    const values = result.embeddings?.[0]?.values;
    if (!values || values.length !== 1536) {
      throw new Error("Gemini embedding response did not include a 1536-dimension vector");
    }
    return values;
  }

  async *streamComplete(params: CompleteParams): AsyncIterable<string> {
    const stream = await this.ai.models.generateContentStream({
      model: params.model,
      contents: params.userPrompt,
      config: createGenerateContentConfig(params, params.searchGrounding ?? this.searchGrounding),
    });
    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}

export function createGenerateContentConfig(params: CompleteParams, searchGrounding = true) {
  const responseMimeType =
    searchGrounding && params.responseFormat === "json"
      ? undefined
      : params.responseFormat === "json"
        ? "application/json"
        : "text/plain";

  return {
    systemInstruction: params.systemPrompt,
    temperature: params.temperature ?? 0.2,
    maxOutputTokens: params.maxTokens ?? 4096,
    ...(responseMimeType ? { responseMimeType } : {}),
    ...(searchGrounding ? { tools: [{ googleSearch: {} }] } : {}),
  };
}

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateGeminiCostCents(inputTokens: number, outputTokens: number) {
  return Math.ceil(
    (inputTokens / 1_000_000) * GEMINI_FLASH_INPUT_PER_MILLION_CENTS +
      (outputTokens / 1_000_000) * GEMINI_FLASH_OUTPUT_PER_MILLION_CENTS,
  );
}
