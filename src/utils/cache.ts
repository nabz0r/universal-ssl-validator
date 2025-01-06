interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class Cache {
  private store: Map<string, CacheEntry<any>>;
  private ttl: number;

  constructor(ttl: number) {
    this.store = new Map();
    this.ttl = ttl;
  }

  set(key: string, value: any): void {
    this.store.set(key, {
      value,
      expiry: Date.now() + this.ttl * 1000
    });
  }

  get(key: string): any {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(): void {
    this.store.clear();
  }
}
