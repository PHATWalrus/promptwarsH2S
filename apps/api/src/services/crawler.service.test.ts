import { describe, expect, test } from "bun:test";
import { env } from "../env";
import {
  assertSafeCrawlUrl,
  CrawlerService,
  normalizeCloudflareMarkdownPayload,
} from "./crawler.service";

describe("crawler SSRF protection", () => {
  test("allows normal public http and https URLs", async () => {
    await expect(assertSafeCrawlUrl("https://example.com/terms")).resolves.toBeUndefined();
    await expect(assertSafeCrawlUrl("http://example.com/privacy")).resolves.toBeUndefined();
    await expect(
      assertSafeCrawlUrl("https://www.perplexity.ai/hub/legal/terms-of-service"),
    ).resolves.toBeUndefined();
  });

  test("rejects localhost, private, link-local, metadata, and non-http URLs", async () => {
    const blocked = [
      "http://localhost/terms",
      "http://127.0.0.1:9000/minio",
      "http://2130706433/admin",
      "http://[::ffff:127.0.0.1]/admin",
      "http://10.0.0.1/admin",
      "http://172.16.0.1/admin",
      "http://192.168.1.10/admin",
      "http://100.64.0.1/admin",
      "http://198.18.0.1/admin",
      "http://169.254.169.254/latest/meta-data",
      "file:///etc/passwd",
    ];

    for (const url of blocked) {
      await expect(assertSafeCrawlUrl(url)).rejects.toThrow(/URL is not allowed/);
    }
  });
});

describe("Cloudflare Browser Rendering markdown payloads", () => {
  test("accepts the page markdown response shape from Cloudflare", () => {
    expect(
      normalizeCloudflareMarkdownPayload(
        { result: "# Terms of Service\n\nThese terms apply." },
        "https://www.perplexity.ai/hub/legal/terms-of-service",
      ),
    ).toEqual({
      title: "www.perplexity.ai",
      markdown: "# Terms of Service\n\nThese terms apply.",
    });
  });

  test("falls back when Cloudflare returns no readable markdown", async () => {
    const originalFetch = globalThis.fetch;
    const originalAccountId = env.CLOUDFLARE_ACCOUNT_ID;
    const originalToken = env.CLOUDFLARE_API_TOKEN;
    const originalFirecrawlKey = env.FIRECRAWL_API_KEY;
    const originalProvider = env.CRAWL_PROVIDER;
    const requests: string[] = [];

    env.CLOUDFLARE_ACCOUNT_ID = "account-id";
    env.CLOUDFLARE_API_TOKEN = "token";
    env.FIRECRAWL_API_KEY = undefined;
    env.CRAWL_PROVIDER = "cloudflare";
    globalThis.fetch = (async (url) => {
      requests.push(String(url));
      if (String(url).includes("/browser-rendering/markdown")) {
        return Response.json({ result: "   " });
      }
      return new Response(
        "<html><head><title>Fallback Terms</title></head><body>These fallback terms apply.</body></html>",
        { status: 200, headers: { "content-type": "text/html" } },
      );
    }) as typeof fetch;

    try {
      const result = await new CrawlerService().crawlLegalPage("https://example.com/terms");

      expect(result.provider).toBe("manual");
      expect(result.title).toBe("Fallback Terms");
      expect(result.markdown).toContain("These fallback terms apply.");
      expect(requests).toEqual([
        "https://api.cloudflare.com/client/v4/accounts/account-id/browser-rendering/markdown",
        "https://example.com/terms",
      ]);
    } finally {
      globalThis.fetch = originalFetch;
      env.CLOUDFLARE_ACCOUNT_ID = originalAccountId;
      env.CLOUDFLARE_API_TOKEN = originalToken;
      env.FIRECRAWL_API_KEY = originalFirecrawlKey;
      env.CRAWL_PROVIDER = originalProvider;
    }
  });
});
