import { env } from "../env";

export interface CrawlResult {
  provider: "cloudflare" | "firecrawl" | "manual";
  title: string;
  markdown: string;
  metadata: Record<string, unknown>;
}

export class CrawlerService {
  async crawlLegalPage(url: string): Promise<CrawlResult> {
    const providers =
      env.CRAWL_PROVIDER === "cloudflare"
        ? [this.cloudflare.bind(this), this.firecrawl.bind(this), this.manual.bind(this)]
        : env.CRAWL_PROVIDER === "firecrawl"
          ? [this.firecrawl.bind(this), this.cloudflare.bind(this), this.manual.bind(this)]
          : [this.manual.bind(this)];

    let lastError: unknown;
    for (const provider of providers) {
      try {
        return await provider(url);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Unable to crawl URL");
  }

  private async cloudflare(url: string): Promise<CrawlResult> {
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
      throw new Error("Cloudflare Browser Run credentials are not configured");
    }
    const response = await fetchWithTimeout(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/markdown`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      },
    );
    if (!response.ok) {
      throw new Error(`Cloudflare Browser Run failed with ${response.status}`);
    }
    const payload = (await response.json()) as { result?: { markdown?: string; title?: string } };
    return {
      provider: "cloudflare",
      title: payload.result?.title ?? new URL(url).hostname,
      markdown: payload.result?.markdown ?? "",
      metadata: { endpoint: "browser-run-markdown" },
    };
  }

  private async firecrawl(url: string): Promise<CrawlResult> {
    if (!env.FIRECRAWL_API_KEY) {
      throw new Error("Firecrawl API key is not configured");
    }
    const response = await fetchWithTimeout("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, formats: ["markdown"] }),
    });
    if (!response.ok) {
      throw new Error(`Firecrawl failed with ${response.status}`);
    }
    const payload = (await response.json()) as {
      data?: { markdown?: string; metadata?: { title?: string } };
    };
    return {
      provider: "firecrawl",
      title: payload.data?.metadata?.title ?? new URL(url).hostname,
      markdown: payload.data?.markdown ?? "",
      metadata: { endpoint: "firecrawl-v2-scrape" },
    };
  }

  private async manual(url: string): Promise<CrawlResult> {
    const response = await fetchWithTimeout(url, {
      headers: { "User-Agent": "LexguardBot/0.1 legal-document-import" },
    });
    if (!response.ok) {
      throw new Error(`Manual fetch failed with ${response.status}`);
    }
    const html = await response.text();
    const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() ?? new URL(url).hostname;
    const markdown = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { provider: "manual", title, markdown, metadata: { endpoint: "manual-fetch" } };
  }
}

export const crawlerService = new CrawlerService();

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
