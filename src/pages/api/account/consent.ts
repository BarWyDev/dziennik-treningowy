import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { userConsents } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';
import {
  createUnauthorizedError,
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from '@/lib/error-handler';

const patchBodySchema = z.object({
  consentType: z.enum(['health_data']),
});

/**
 * GET /api/account/consent
 * Zwraca listę aktywnych zgód użytkownika
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user?.id) {
      return createUnauthorizedError();
    }

    const consents = await db
      .select()
      .from(userConsents)
      .where(and(eq(userConsents.userId, user.id), isNull(userConsents.withdrawnAt)));

    return new Response(JSON.stringify(consents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'account/consent GET');
  }
};

/**
 * PATCH /api/account/consent
 * Wycofuje zgodę użytkownika
 */
export const PATCH: APIRoute = async ({ locals, request }) => {
  try {
    const user = locals.user;
    if (!user?.id) {
      return createUnauthorizedError();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Nieprawidłowe ciało żądania');
    }

    const result = patchBodySchema.safeParse(body);
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
