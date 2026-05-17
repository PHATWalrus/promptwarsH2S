import { describe, expect, test } from "bun:test";
import { createMemoryRateLimitStore } from "./rateLimitStore";

describe("rate limit fallback store", () => {
  test("enforces limits when Redis is unavailable", () => {
    const store = createMemoryRateLimitStore();

    expect(store.increment("ip:1", 60)).toBe(1);
    expect(store.increment("ip:1", 60)).toBe(2);
  });

  test("evicts expired buckets", () => {
    const store = createMemoryRateLimitStore(() => 10_000);

    expect(store.increment("ip:1", 1)).toBe(1);
    store.sweep(12_000);

    expect(store.size()).toBe(0);
  });
});
