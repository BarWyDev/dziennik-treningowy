import { defineMiddleware } from 'astro:middleware';
import { auth } from '@/lib/auth';

const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/api/auth',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Allow API auth routes
  if (pathname.startsWith('/api/auth')) {
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

  return next();
});
