/**
 * Helper functions dla API endpoints
 * Ułatwiają wspólne operacje jak autentykacja, rate limiting i CSRF protection
 */

import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
  type RateLimitConfig,
} from '@/lib/rate-limit';

// Re-export RateLimitPresets dla wygody
export { RateLimitPresets };
import { createUnauthorizedError, createErrorResponse, ErrorCode } from '@/lib/error-handler';

/**
 * Weryfikuje Origin header dla ochrony przed CSRF
 * Better Auth już to robi, ale dodatkowa weryfikacja dla mutacji
 */
function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  
  // Jeśli brak Origin/Referer, sprawdź czy to simple request (GET/HEAD)
  // Simple requests nie wymagają preflight i mogą być bezpieczne
  if (!origin && !referer) {
    return true; // Better Auth zweryfikuje przez cookies
  }
  
  const baseUrl = import.meta.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:4321';
  const trustedOrigins = [
    baseUrl,
    baseUrl.replace(/\/$/, ''), // Bez trailing slash
    baseUrl + '/', // Z trailing slash
  ];
  
  // Sprawdź Origin
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const originBase = `${originUrl.protocol}//${originUrl.host}`;
      if (trustedOrigins.some((trusted) => originBase === trusted || originBase === trusted.replace(/\/$/, ''))) {
        return true;
      }
    } catch {
      // Nieprawidłowy URL w Origin
    }
  }
  
  // Sprawdź Referer jako fallback
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererBase = `${refererUrl.protocol}//${refererUrl.host}`;
      if (trustedOrigins.some((trusted) => refererBase === trusted || refererBase === trusted.replace(/\/$/, ''))) {
        return true;
      }
    } catch {
      // Nieprawidłowy URL w Referer
    }
  }
  
  return false;
}

interface AuthenticatedContext {
  user: { id: string; email: string; name: string };
  session: unknown;
}

/**
 * Wymaga autentykacji i zwraca kontekst użytkownika lub Response z błędem
 */
export async function requireAuth(request: Request): Promise<
  | { success: true; user: AuthenticatedContext['user']; session: unknown }
  | { success: false; response: Response }
> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return {
        success: false,
        response: createUnauthorizedError(),
      };
    }

    return {
      success: true,
      user: session.user,
      session: session.session,
    };
  } catch (error) {
    // Jeśli getSession rzuca wyjątek, zwróć błąd autoryzacji
    return {
      success: false,
      response: createUnauthorizedError('Błąd podczas weryfikacji sesji'),
    };
  }
}

/**
 * Wymaga autentykacji i rate limiting dla API endpoint
 * Zwraca kontekst użytkownika lub Response z błędem
 */
export async function requireAuthWithRateLimit(
  request: Request,
  rateLimitPreset = RateLimitPresets.API
): Promise<
  | { success: true; user: AuthenticatedContext['user']; session: unknown }
  | { success: false; response: Response }
> {
  // Najpierw sprawdź autentykację
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult;
  }

  // Potem sprawdź rate limit (używamy userId jako identyfikatora)
  const rateLimitResponse = checkRateLimit(
    getRateLimitIdentifier(request, authResult.user.id),
    rateLimitPreset
  );

  if (rateLimitResponse) {
    return {
      success: false,
      response: rateLimitResponse,
    };
  }

  return authResult;
}

/**
 * Wymaga autentykacji, rate limiting i CSRF protection dla mutacji (POST/PUT/DELETE)
 * Zwraca kontekst użytkownika lub Response z błędem
 */
export async function requireAuthWithCSRF(
  request: Request,
  rateLimitPreset = RateLimitPresets.API
): Promise<
  | { success: true; user: AuthenticatedContext['user']; session: unknown }
  | { success: false; response: Response }
> {
  // Sprawdź metodę - tylko mutacje wymagają dodatkowej weryfikacji CSRF
  const method = request.method.toUpperCase();
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  // Najpierw sprawdź autentykację i rate limit
  const authResult = await requireAuthWithRateLimit(request, rateLimitPreset);
  if (!authResult.success) {
    return authResult;
  }
  
  // Dla mutacji, zweryfikuj Origin (dodatkowa ochrona CSRF)
  // Better Auth już weryfikuje przez SameSite cookies i trustedOrigins,
  // ale dodatkowa weryfikacja nie zaszkodzi
  if (isMutation && !verifyOrigin(request)) {
    return {
      success: false,
      response: createErrorResponse(
        ErrorCode.INVALID_ORIGIN,
        'Invalid origin - CSRF protection'
      ),
    };
  }
  
  return authResult;
}

/**
 * Helper do tworzenia API endpoint z autentykacją i rate limiting
 */
export function createAuthenticatedRoute(
  handler: (context: {
    request: Request;
    user: AuthenticatedContext['user'];
    session: unknown;
    url: URL;
    params?: Record<string, string | undefined>;
  }) => Promise<Response>,
  options?: {
    rateLimitPreset?: RateLimitConfig;
    requireCSRF?: boolean; // Domyślnie true dla mutacji
  }
): APIRoute {
  return async (context) => {
    const method = context.request.method.toUpperCase();
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    const requireCSRF = options?.requireCSRF !== false && isMutation;
    
    const authResult = requireCSRF
      ? await requireAuthWithCSRF(
          context.request,
          options?.rateLimitPreset || RateLimitPresets.API
        )
      : await requireAuthWithRateLimit(
          context.request,
          options?.rateLimitPreset || RateLimitPresets.API
        );

    if (!authResult.success) {
      return authResult.response;
    }

    return handler({
      request: context.request,
      user: authResult.user,
      session: authResult.session,
      url: context.url,
      params: context.params,
    });
  };
}
