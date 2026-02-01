/**
 * Simple in-memory cache with TTL (Time To Live)
 * 
 * Używa Map do przechowywania danych w pamięci.
 * Dla produkcji można łatwo zamienić na Redis.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Cleanup wygasłych wpisów co 5 minut
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Pobiera wartość z cache
   * @param key Klucz cache
   * @returns Wartość lub null jeśli nie istnieje lub wygasła
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    // Sprawdź czy wpis wygasł
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Zapisuje wartość do cache z TTL
   * @param key Klucz cache
   * @param value Wartość do zapisania
   * @param ttlMs Czas życia w milisekundach
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      data: value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Usuwa wartość z cache
   * @param key Klucz cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Usuwa wszystkie wpisy pasujące do wzorca
   * @param patternPrefix Prefix klucza (np. 'user:123:' usuwa wszystkie klucze zaczynające się od tego)
   */
  deleteByPattern(patternPrefix: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.store.keys()) {
      if (key.startsWith(patternPrefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Czyści wygasłe wpisy z cache
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Czyści cały cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Zwraca liczbę wpisów w cache
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Zatrzymuje cleanup interval i czyści cache (użyteczne przy shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.store.clear();
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cleanup on server shutdown to prevent memory leaks
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    cache.destroy();
  });

  process.on('SIGINT', () => {
    cache.destroy();
  });
}

/**
 * Helper do tworzenia kluczy cache
 */
export const cacheKeys = {
  /**
   * Klucz cache dla training types użytkownika
   * @param userId ID użytkownika
   * @param page Numer strony
   * @param limit Limit wyników
   */
  trainingTypes: (userId: string, page: number, limit: number) => 
    `training-types:user:${userId}:page:${page}:limit:${limit}`,

  /**
   * Klucz cache dla dashboard użytkownika
   * @param userId ID użytkownika
   */
  dashboard: (userId: string) => `dashboard:user:${userId}`,

  /**
   * Prefix do invalidation wszystkich training types użytkownika
   * @param userId ID użytkownika
   */
  trainingTypesPrefix: (userId: string) => `training-types:user:${userId}:`,
};

/**
 * TTL constants (w milisekundach)
 */
export const CACHE_TTL = {
  TRAINING_TYPES: 60 * 60 * 1000, // 1 godzina (rzadko się zmieniają)
  DASHBOARD: 5 * 60 * 1000, // 5 minut (dane mogą się szybko zmieniać)
} as const;
