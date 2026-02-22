import { MemoryCache, type CacheEntry } from "@/lib/http/cache";

export const pokedexCache = new MemoryCache();

export const setPokedexCache = <T>(
  key: string,
  data: T,
  cacheTtlMs: number,
  staleTtlMs: number,
) => {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    fetchedAt: now,
    expiresAt: now + cacheTtlMs,
    staleAt: now + cacheTtlMs + staleTtlMs,
  };
  pokedexCache.set(key, entry);
};
