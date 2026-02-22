export type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
  expiresAt: number;
  staleAt: number;
};

export type CacheListener<T> = (entry: CacheEntry<T>) => void;

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private listeners = new Map<string, Set<CacheListener<unknown>>>();

  get<T>(key: string) {
    return this.store.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(key: string, entry: CacheEntry<T>) {
    this.store.set(key, entry);
    this.notify(key, entry);
  }

  delete(key: string) {
    this.store.delete(key);
    this.listeners.delete(key);
  }

  clear() {
    this.store.clear();
    this.listeners.clear();
  }

  subscribe<T>(key: string, listener: CacheListener<T>) {
    const set = this.listeners.get(key) ?? new Set();
    set.add(listener as CacheListener<unknown>);
    this.listeners.set(key, set);
    return () => {
      const current = this.listeners.get(key);
      if (!current) return;
      current.delete(listener as CacheListener<unknown>);
      if (current.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  private notify<T>(key: string, entry: CacheEntry<T>) {
    const set = this.listeners.get(key);
    if (!set) return;
    for (const listener of set) {
      listener(entry);
    }
  }
}
