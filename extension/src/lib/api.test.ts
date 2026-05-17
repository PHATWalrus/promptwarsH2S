import { afterEach, describe, expect, test } from "bun:test";
import { LexguardApiClient, parseSseAnswer } from "./api";
import type { AuthSession } from "./types";

describe("extension API client", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("adds bearer authorization and refreshes once on 401", async () => {
    const calls: Request[] = [];
    const sessions: AuthSession[] = [
      {
        accessToken: "old-token",
        refreshToken: "refresh-token",
        user: { id: "u1", email: "u@example.com", name: null, role: "user", orgId: "o1" },
      },
    ];
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      calls.push(request);
      if (request.url.endsWith("/contracts?pageSize=3") && calls.length === 1) {
        return Promise.resolve(new Response("{}", { status: 401 }));
      }
      if (request.url.endsWith("/auth/refresh")) {
        return Promise.resolve(
          Response.json({
            accessToken: "new-token",
            refreshToken: "new-refresh",
            user: sessions[0]?.user,
          }),
        );
      }
      return Promise.resolve(Response.json({ contracts: [] }));
    }) as typeof fetch;

    const client = new LexguardApiClient({
      baseUrl: "https://api.lexguard.test/api/v1",
      getSession: async () => sessions[0] ?? null,
      setSession: async (session) => {
        sessions[0] = session;
      },
      clearSession: async () => {
        sessions.length = 0;
      },
    });

    await client.recentContracts();

    expect(calls[0]?.headers.get("authorization")).toBe("Bearer old-token");
    expect(calls[2]?.headers.get("authorization")).toBe("Bearer new-token");
    expect(sessions[0]?.accessToken).toBe("new-token");
  });

  test("parses streamed chat answer events", () => {
    expect(
      parseSseAnswer('event: message\ndata: {"answer":"Use plain English","relevantClauses":[],"confidence":0.8,"disclaimer":"Info only"}\n\n'),
    ).toEqual({
      answer: "Use plain English",
      relevantClauses: [],
      confidence: 0.8,
      disclaimer: "Info only",
    });
  });
});
