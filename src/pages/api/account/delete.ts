import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { users, mediaAttachments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { storage } from '@/lib/storage';
import { auth } from '@/lib/auth';
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

const deleteBodySchema = z.object({
  password: z.string().min(1, 'Hasło jest wymagane'),
});

/**
 * DELETE /api/account/delete
 * Usuwa konto użytkownika wraz ze wszystkimi danymi (Art. 17 RODO)
 */
export const DELETE: APIRoute = async ({ locals, request }) => {
  try {
    const user = locals.user;
    if (!user?.id || !user?.email) {
      return createUnauthorizedError();
    }

    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request, user.id),
      RateLimitPresets.PASSWORD_RESET
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

    const result = deleteBodySchema.safeParse(body);
    if (!result.success) {
      return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Hasło jest wymagane');
    }

    const { password } = result.data;

    // Weryfikacja hasła przez próbę logowania
    const signInResponse = await auth.api.signInEmail({
      body: { email: user.email, password },
      headers: request.headers,
      asResponse: true,
    });

    if (!signInResponse.ok) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, 'Nieprawidłowe hasło');
    }

    // Pobierz wszystkie media i usuń pliki fizyczne
    const userMedia = await db
      .select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.userId, user.id));

    await Promise.allSettled(
      userMedia.map((media) => storage.deleteFile(media.fileUrl))
    );

    // Usuń użytkownika (kaskada usuwa wszystkie powiązane dane)
    await db.delete(users).where(eq(users.id, user.id));

    // Wyloguj (ignoruj błąd jeśli sesja już usunięta przez kaskadę)
    try {
      await auth.api.signOut({ headers: request.headers });
    } catch {
      // Ignoruj — sesja mogła zostać usunięta przez kaskadę
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'account/delete DELETE');
  }
};
