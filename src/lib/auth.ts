import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';
import { sendVerificationEmail, sendPasswordResetEmail } from './email';

// Stałe czasu dla sesji (w sekundach)
const SESSION_EXPIRY_DAYS = 7;
const SESSION_UPDATE_AGE_DAYS = 1;
const COOKIE_CACHE_MINUTES = 5;

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

// Konwersja do sekund
const SESSION_EXPIRY_SECONDS = SESSION_EXPIRY_DAYS * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const SESSION_UPDATE_AGE_SECONDS = SESSION_UPDATE_AGE_DAYS * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const COOKIE_CACHE_SECONDS = COOKIE_CACHE_MINUTES * SECONDS_PER_MINUTE;

// Przygotuj trusted origins - dodaj wszystkie możliwe warianty URL
const getTrustedOrigins = (): string[] => {
  const baseUrl = import.meta.env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:4321';
  const origins = [baseUrl];
  
  // Dodaj warianty z/bez trailing slash i http/https
  if (baseUrl.startsWith('http://')) {
    origins.push(baseUrl.replace('http://', 'https://'));
  }
  if (baseUrl.endsWith('/')) {
    origins.push(baseUrl.slice(0, -1));
  } else {
    origins.push(baseUrl + '/');
  }
  
  return [...new Set(origins)]; // Usuń duplikaty
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true,
  },
  session: {
    expiresIn: SESSION_EXPIRY_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: COOKIE_CACHE_SECONDS,
    },
  },
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      '/request-password-reset': {
        window: 60,
        max: 3,
      },
      '/reset-password': {
        window: 60,
        max: 5,
      },
    },
  },
  trustedOrigins: getTrustedOrigins(),
  // CSRF Protection: Better Auth automatycznie używa SameSite=Lax cookies
  // i weryfikuje Origin header przeciwko trustedOrigins
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          // SameSite=Lax jest domyślne - chroni przed większością ataków CSRF
          // Secure cookies będą automatycznie używane w produkcji (HTTPS)
          sameSite: 'lax',
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
