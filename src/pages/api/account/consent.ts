import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { userConsents } from '@/lib/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { z } from 'zod';
import {
  createUnauthorizedError,
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from '@/lib/error-handler';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from '@/lib/rate-limit';

const consentTypeSchema = z.object({
  consentType: z.enum(['health_data']),
});

/**
 * GET /api/account/consent
 * Zwraca najnowszy stan każdej zgody użytkownika (aktywna lub wycofana).
 */
export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const user = locals.user;
    if (!user?.id) {
      return createUnauthorizedError();
    }

    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request, user.id),
      RateLimitPresets.API
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Pobierz wszystkie rekordy posortowane od najnowszego
    const allConsents = await db
      .select()
      .from(userConsents)
      .where(eq(userConsents.userId, user.id))
      .orderBy(desc(userConsents.createdAt));

    // Zwróć tylko najnowszy rekord per typ (aktualny stan zgody)
    const latestByType = new Map<string, (typeof allConsents)[0]>();
    for (const consent of allConsents) {
      if (!latestByType.has(consent.consentType)) {
        latestByType.set(consent.consentType, consent);
      }
    }

    return new Response(JSON.stringify(Array.from(latestByType.values())), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'account/consent GET');
  }
};

/**
 * POST /api/account/consent
 * Ponownie udziela wycofanej zgody (wstawia nowy rekord).
 */
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const user = locals.user;
    if (!user?.id) {
      return createUnauthorizedError();
    }

    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request, user.id),
      RateLimitPresets.API
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Nieprawidłowe ciało żądania');
    }

    const result = consentTypeSchema.safeParse(body);
    if (!result.success) {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Nieprawidłowe dane');
    }

    const { consentType } = result.data;

    // Sprawdź czy zgoda nie jest już aktywna
    const [existing] = await db
      .select({ id: userConsents.id })
      .from(userConsents)
      .where(
        and(
          eq(userConsents.userId, user.id),
          eq(userConsents.consentType, consentType),
          isNull(userConsents.withdrawnAt)
        )
      )
      .limit(1);

    if (existing) {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Zgoda jest już aktywna');
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    await db.insert(userConsents).values({
      userId: user.id,
      consentType,
      version: '1.0',
      ipAddress,
      userAgent,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'account/consent POST');
  }
};

/**
 * PATCH /api/account/consent
 * Wycofuje zgodę użytkownika.
 */
export const PATCH: APIRoute = async ({ locals, request }) => {
  try {
    const user = locals.user;
    if (!user?.id) {
      return createUnauthorizedError();
    }

    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request, user.id),
      RateLimitPresets.API
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Nieprawidłowe ciało żądania');
    }

    const result = consentTypeSchema.safeParse(body);
    if (!result.success) {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Nieprawidłowe dane');
    }

    const { consentType } = result.data;

    await db
      .update(userConsents)
      .set({ withdrawnAt: new Date() })
      .where(
        and(
          eq(userConsents.userId, user.id),
          eq(userConsents.consentType, consentType),
          isNull(userConsents.withdrawnAt)
        )
      );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'account/consent PATCH');
  }
};
