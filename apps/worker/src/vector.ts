export function normalizeEmbedding(values: number[]) {
  if (values.length !== 1536) {
    throw new Error("Clause embeddings must be 1536 dimensions");
  }
  return values;
}
