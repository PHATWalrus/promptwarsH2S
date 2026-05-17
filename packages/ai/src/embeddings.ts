import type { LLMClient } from "./llm";

export async function embedChunks(client: LLMClient, chunks: string[]) {
  return Promise.all(chunks.map((chunk) => client.embed(chunk)));
}

export function chunkText(text: string, maxChars = 6000) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += maxChars) {
    chunks.push(text.slice(index, index + maxChars));
  }
  return chunks.length > 0 ? chunks : [""];
}
