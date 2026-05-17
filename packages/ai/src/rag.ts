import type { Clause } from "@lexguard/types";
import type { LLMClient, LLMModel } from "./llm";
import { scenarioQAPrompt } from "./prompts/scenarioQA.prompt";

export interface RagContext {
  clauses: Clause[];
  question: string;
  model: LLMModel;
}

export async function answerScenarioQuestion(client: LLMClient, context: RagContext) {
  const clauseContext = context.clauses
    .map(
      (clause, index) => `[${index + 1}] ${clause.category} ${clause.riskLevel}: ${clause.rawText}`,
    )
    .join("\n\n");
  return client.complete({
    model: context.model,
    systemPrompt: scenarioQAPrompt,
    userPrompt: `Question:\n${context.question}\n\nRelevant clauses:\n${clauseContext}`,
    responseFormat: "json",
    temperature: 0.1,
  });
}
