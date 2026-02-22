import { describe, expect, it, vi } from "vitest";
import { createHttpClient } from "@/lib/http/client";
import { MemoryCache } from "@/lib/http/cache";
import { createLimiter } from "@/lib/http/limiter";

const createJsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("http client", () => {
  it("dedupes inflight requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const client = createHttpClient({
      baseUrl: "https://example.com",
      cache: new MemoryCache(),
      limiter: createLimiter(2),
    });

    await Promise.all([
      client.get({ url: "/dedupe", cacheTtlMs: 1000 }),
      client.get({ url: "/dedupe", cacheTtlMs: 1000 }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns cached data within TTL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const client = createHttpClient({
      baseUrl: "https://example.com",
      cache: new MemoryCache(),
      limiter: createLimiter(1),
    });

    const first = await client.get({ url: "/cache", cacheTtlMs: 1000 });
    const second = await client.get({ url: "/cache", cacheTtlMs: 1000 });

    expect(first).toEqual(second);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries on server errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({ error: true }, 503))
      .mockResolvedValueOnce(createJsonResponse({ error: true }, 503))
      .mockResolvedValueOnce(createJsonResponse({ ok: true }, 200));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const client = createHttpClient({
      baseUrl: "https://example.com",
      cache: new MemoryCache(),
      limiter: createLimiter(1),
    });

    const data = await client.get({ url: "/retry", retries: 2 });

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
