import { GeminiLLMClient } from "@lexguard/ai";
import { createDatabase } from "@lexguard/db";
import { env } from "./env";

export const db = createDatabase(env.DATABASE_URL);
export const aiClient = new GeminiLLMClient(env.GEMINI_API_KEY, env.GEMINI_EMBEDDING_MODEL);
