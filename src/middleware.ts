import { defineMiddleware } from 'astro:middleware';
import { auth } from '@/lib/auth';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from '@/lib/rate-limit';

const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/api/auth',
  '/polityka-prywatnosci',
  '/regulamin',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Rate limiting dla auth endpoints (brute force protection)
  if (pathname.startsWith('/api/auth')) {
    // Sprawdź rate limit przed przekazaniem do Better Auth
    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(context.request),
      RateLimitPresets.AUTH
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return next();
  }

  // Check if path is public
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (isPublicPath) {
    return next();
  }

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (!session) {
    return context.redirect('/auth/login');
  }

  // Add user to locals for use in pages
  context.locals.user = session.user;
  context.locals.session = session.session;

  // Pobierz response i dodaj security headers
  const response = await next();

  // Clone response aby móc modyfikować headers
  const newResponse = new Response(response.body, response);

  // Security headers - ochrona przed typowymi atakami
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  );

  // HSTS tylko w produkcji (wymaga HTTPS)
  if (import.meta.env.PROD) {
    newResponse.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return newResponse;
});
