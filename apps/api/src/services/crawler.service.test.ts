import { describe, expect, test } from "bun:test";
import { assertSafeCrawlUrl } from "./crawler.service";

describe("crawler SSRF protection", () => {
  test("allows normal public http and https URLs", async () => {
    await expect(assertSafeCrawlUrl("https://example.com/terms")).resolves.toBeUndefined();
    await expect(assertSafeCrawlUrl("http://example.com/privacy")).resolves.toBeUndefined();
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
