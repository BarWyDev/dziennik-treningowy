import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userConsents } from '@/lib/db/schema';
import { registerSchema } from '@/lib/validations/auth';
import {
  createErrorResponse,
  handleUnexpectedError,
  ErrorCode,
} from '@/lib/error-handler';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from '@/lib/rate-limit';

/**
 * POST /api/register
 * Rejestruje nowego użytkownika i zapisuje zgody RODO do bazy danych.
 * Wrapper nad Better Auth signUpEmail z atomowym zapisem userConsents.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request),
      RateLimitPresets.AUTH
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

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        firstError?.message || 'Nieprawidłowe dane'
      );
    }

    const { name, email, password } = result.data;

    // Rejestracja przez Better Auth
    const authResponse = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: request.headers,
      asResponse: true,
    });

    if (!authResponse.ok) {
      const errorBody = await authResponse.json().catch(() => ({})) as Record<string, unknown>;
      const message = typeof errorBody.message === 'string'
        ? errorBody.message
        : 'Wystąpił błąd podczas rejestracji';
      return new Response(JSON.stringify({ error: message }), {
        status: authResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseData = await authResponse.json().catch(() => ({})) as Record<string, unknown>;
    const userData = responseData.user as Record<string, unknown> | undefined;
    const userId = typeof userData?.id === 'string' ? userData.id : undefined;

    // Zapisz zgody RODO
    if (userId) {
      const ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        null;
      const userAgent = request.headers.get('user-agent') || null;

      try {
        await db.insert(userConsents).values([
          {
            userId,
            consentType: 'terms_privacy',
            version: '1.0',
            ipAddress,
            userAgent,
          },
          {
            userId,
            consentType: 'health_data',
            version: '1.0',
            ipAddress,
            userAgent,
          },
        ]);
      } catch (consentError) {
        console.error('[register] Błąd zapisu zgód dla userId:', userId, consentError);
        // Nie przerywamy — użytkownik został utworzony, e-mail weryfikacyjny wysłany
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'register POST');
  }
};
