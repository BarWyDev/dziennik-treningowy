/**
 * Rate Limiting Utility
 * 
 * Prosty memory-based rate limiter dla ochrony przed:
 * - Brute force attacks
 * - DDoS attacks
 * - API spam
 * 
 * Uwaga: W produkcji warto zamienić na Redis-based rozwiązanie (@upstash/ratelimit)
 * dla skalowalności i trwałości między restartami serwera.
 */

export interface RateLimitConfig {
  /** Maksymalna liczba żądań w oknie czasowym */
  maxRequests: number;
  /** Okno czasowe w milisekundach */
  windowMs: number;
  /** Wiadomość błędu gdy limit przekroczony */
  errorMessage?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Ostrzeżenie o ograniczeniach in-memory storage w produkcji
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      console.warn(
        '[SECURITY WARNING] Rate limiting uses in-memory storage. ' +
        'For multi-instance deployments, implement Redis-based rate limiting.'
      );
    }

    // Cleanup starych wpisów co 5 minut
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Sprawdza czy żądanie może być przetworzone
   * @param identifier Unikalny identyfikator (IP, userId, email, etc.)
   * @param config Konfiguracja limitu
   * @returns { success: boolean, remaining: number, resetAt: number }
   */
  check(identifier: string, config: RateLimitConfig): {
    success: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // Jeśli nie ma wpisu lub okno się zresetowało
    if (!entry || now > entry.resetAt) {
      const resetAt = now + config.windowMs;
      this.store.set(identifier, {
        count: 1,
        resetAt,
      });

      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetAt,
      };
    }

    // Jeśli limit przekroczony
    if (entry.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    // Zwiększ licznik
    entry.count++;
    this.store.set(identifier, entry);

    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Resetuje limit dla danego identyfikatora (użyteczne przy sukcesie logowania)
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Usuwa stare wpisy (starsze niż 1 godzina)
   */
  private cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < oneHourAgo) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Zatrzymuje cleanup interval (użyteczne przy shutdown)
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
const rateLimiter = new RateLimiter();

// Cleanup on server shutdown to prevent memory leaks
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    rateLimiter.destroy();
  });

  process.on('SIGINT', () => {
    rateLimiter.destroy();
  });
}

/**
 * Rate limit presets dla różnych typów endpointów
 */
export const RateLimitPresets = {
  /** Auth endpoints - 5 prób na 15 minut (brute force protection) */
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minut
    errorMessage: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.',
  },

  /** Upload endpoints - 10 uploadów na minutę */
  UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minuta
    errorMessage: 'Zbyt wiele uploadów. Spróbuj ponownie za chwilę.',
  },

  /** General API - 60 żądań na minutę */
  API: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minuta
    errorMessage: 'Zbyt wiele żądań. Spróbuj ponownie za chwilę.',
  },

  /** Password reset - 3 próby na godzinę */
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 godzina
    errorMessage: 'Zbyt wiele prób resetowania hasła. Spróbuj ponownie za godzinę.',
  },

  /** File download - 100 pobrań na minutę (DoS protection) */
  FILE_DOWNLOAD: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuta
    errorMessage: 'Zbyt wiele pobrań plików. Spróbuj ponownie za chwilę.',
  },
} as const;

/**
 * Sprawdza rate limit i zwraca Response z błędem jeśli limit przekroczony
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Response | null {
  const result = rateLimiter.check(identifier, config);

  if (!result.success) {
    const resetInSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    const resetInMinutes = Math.ceil(resetInSeconds / 60);

    return new Response(
      JSON.stringify({
        error: config.errorMessage || 'Zbyt wiele żądań',
        retryAfter: resetInSeconds,
        retryAfterMinutes: resetInMinutes,
      }),
      {
        status: 429, // Too Many Requests
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': resetInSeconds.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
        },
      }
    );
  }

  return null;
}

/**
 * Resetuje rate limit (użyteczne po udanym logowaniu)
 */
export function resetRateLimit(identifier: string): void {
  rateLimiter.reset(identifier);
}

/**
 * Pobiera IP adres z request headers
 */
export function getClientIP(request: Request): string {
  // Sprawdź różne nagłówki używane przez proxy/load balancer
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - w produkcji zawsze powinien być jeden z powyższych
  return 'unknown';
}

/**
 * Tworzy unikalny identyfikator dla rate limiting
 * Priorytet: userId > email > IP
 */
export function getRateLimitIdentifier(
  request: Request,
  userId?: string,
  email?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (email) {
    return `email:${email.toLowerCase()}`;
  }
  return `ip:${getClientIP(request)}`;
}
