import { MemoryCache, type CacheEntry } from "@/lib/http/cache";
import type { Limiter } from "@/lib/http/limiter";
import { sleep } from "@/lib/utils/sleep";
import { toQueryString } from "@/lib/utils/query";

export class HttpError extends Error {
  status?: number;

  constructor(message: string, status?: number, cause?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    if (cause) {
      this.cause = cause;
    }
  }
}

export type RequestOptions<T> = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  headers?: HeadersInit;
  body?: BodyInit | null;
  signal?: AbortSignal;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  cacheKey?: string;
  cacheTtlMs?: number;
  staleTtlMs?: number;
  dedupe?: boolean;
  swr?: boolean;
  parser?: (json: unknown) => T;
};

export type HttpClientOptions = {
  baseUrl?: string;
  cache?: MemoryCache;
  limiter?: Limiter;
  defaultOptions?: Partial<RequestOptions<unknown>>;
};

export const createHttpClient = ({
  baseUrl = "",
  cache = new MemoryCache(),
  limiter,
  defaultOptions = {},
}: HttpClientOptions) => {
  const inflight = new Map<string, Promise<unknown>>();

  const getCacheKey = (method: string, url: string, query?: RequestOptions<unknown>["query"]) =>
    `${method}:${url}${toQueryString(query ?? {})}`;

  const fetchWithRetry = async <T>(
    url: string,
    options: RequestOptions<T>,
  ): Promise<T> => {
    const {
      retries = 2,
      retryDelayMs = 350,
      timeoutMs = 8000,
      signal,
      parser,
    } = options;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const onAbort = () => controller.abort();
      if (signal) {
        if (signal.aborted) {
          controller.abort();
        } else {
          signal.addEventListener("abort", onAbort, { once: true });
        }
      }

      try {
        const response = await fetch(url, {
          method: options.method ?? "GET",
          headers: options.headers,
          body: options.body ?? null,
          signal: controller.signal,
        });

        if (!response.ok) {
          if (shouldRetry(response, undefined, attempt, retries, signal)) {
            await backoff(attempt, retryDelayMs);
            continue;
          }
          throw new HttpError(`Request failed with status ${response.status}`, response.status);
        }

        const json = await response.json();
        return (parser ? parser(json) : (json as T));
      } catch (error) {
        if (shouldRetry(undefined, error, attempt, retries, signal)) {
          await backoff(attempt, retryDelayMs);
          continue;
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }
      }
    }

    throw new HttpError("Request failed after retries");
  };

  const request = async <T>(options: RequestOptions<T>): Promise<T> => {
    const merged = { ...defaultOptions, ...options } as RequestOptions<T>;
    const method = merged.method ?? "GET";
    const resourceUrl = merged.url;
    const url = `${baseUrl}${resourceUrl}${toQueryString(merged.query ?? {})}`;
    const key = merged.cacheKey ?? getCacheKey(method, merged.url, merged.query);
    const useCache = method === "GET";
    const now = Date.now();
    const cacheEntry = useCache ? cache.get<T>(key) : undefined;
    const cacheTtlMs = merged.cacheTtlMs ?? 0;
    const staleTtlMs = merged.staleTtlMs ?? 0;
    const swr = merged.swr ?? false;
    const dedupe = merged.dedupe ?? true;

    if (cacheEntry) {
      const isFresh = now < cacheEntry.expiresAt;
      const isStaleButUsable = now >= cacheEntry.expiresAt && now < cacheEntry.staleAt;
      if (isFresh) {
        return cacheEntry.data;
      }
      if (isStaleButUsable && swr) {
        void revalidate(key, resourceUrl, merged);
        return cacheEntry.data;
      }
    }

    if (dedupe && inflight.has(key)) {
      return inflight.get(key) as Promise<T>;
    }

    const execute = async () => {
      const data = await fetchWithRetry<T>(url, merged);
      if (useCache && cacheTtlMs > 0) {
        const fetchedAt = Date.now();
        const entry: CacheEntry<T> = {
          data,
          fetchedAt,
          expiresAt: fetchedAt + cacheTtlMs,
          staleAt: fetchedAt + cacheTtlMs + staleTtlMs,
        };
        cache.set(key, entry);
      }
      return data;
    };

    const promise = limiter ? limiter.run(execute) : execute();
    inflight.set(key, promise);
    return promise.finally(() => {
      inflight.delete(key);
    });
  };

  const revalidate = async <T>(
    key: string,
    resourceUrl: string,
    options: RequestOptions<T>,
  ) => {
    if (inflight.has(key)) return;
    await request({
      ...options,
      url: resourceUrl,
      swr: false,
      dedupe: true,
      cacheKey: key,
    });
  };

  return {
    request,
    get: <T>(options: Omit<RequestOptions<T>, "method">) =>
      request<T>({ ...options, method: "GET" }),
    cache,
  };
};

const shouldRetry = (
  response: Response | undefined,
  error: unknown,
  attempt: number,
  retries: number,
  signal?: AbortSignal,
) => {
  if (attempt >= retries) return false;
  if (signal?.aborted) return false;
  if (response) {
    return response.status >= 500 || response.status === 429;
  }
  if (error instanceof HttpError) {
    return false;
  }
  const name = (error as { name?: string })?.name;
  if (name === "AbortError") return false;
  return true;
};

const backoff = async (attempt: number, baseDelayMs: number) => {
  const jitter = 0.8 + Math.random() * 0.4;
  const delay = Math.min(baseDelayMs * 2 ** attempt * jitter, 8000);
  await sleep(delay);
};
