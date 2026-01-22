import { d as defineMiddleware, s as sequence } from './chunks/index_DwZlaAAj.mjs';
import { a as auth } from './chunks/auth_C5u617DK.mjs';
import './chunks/astro-designed-error-pages_BvL3Hvss.mjs';
import './chunks/astro/server_C-0B9Fh3.mjs';

const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/api/auth"
];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (pathname.startsWith("/api/auth")) {
    return next();
  }
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  if (isPublicPath) {
    return next();
  }
  const session = await auth.api.getSession({
    headers: context.request.headers
  });
  if (!session) {
    return context.redirect("/auth/login");
  }
  context.locals.user = session.user;
  context.locals.session = session.session;
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
