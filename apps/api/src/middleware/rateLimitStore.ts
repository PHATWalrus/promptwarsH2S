type MemoryBucket = {
  count: number;
  expiresAt: number;
};

export function createMemoryRateLimitStore(now = () => Date.now()) {
  const buckets = new Map<string, MemoryBucket>();

  return {
    increment(key: string, windowSeconds: number) {
      const current = now();
      const existing = buckets.get(key);
      if (!existing || existing.expiresAt <= current) {
        buckets.set(key, { count: 1, expiresAt: current + windowSeconds * 1000 });
        return 1;
      }
      existing.count += 1;
      return existing.count;
    },
    sweep(current = now()) {
      for (const [key, bucket] of buckets) {
        if (bucket.expiresAt <= current) {
          buckets.delete(key);
        }
      }
    },
    size() {
      return buckets.size;
    },
  };
}
