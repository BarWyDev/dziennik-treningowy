import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { mediaAttachments } from '@/lib/db/schema';
import { storage } from '@/lib/storage';
import { eq, and } from 'drizzle-orm';
import {
  createUnauthorizedError,
  createErrorResponse,
  handleDatabaseError,
  handleUnexpectedError,
  ErrorCode,
} from '@/lib/error-handler';

/**
 * DELETE /api/media/[id]
 * Usuwa załącznik multimedialny
 *
 * Sprawdza czy użytkownik jest właścicielem
 * Usuwa plik fizyczny i wpis w bazie
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Sprawdź autentykację
    const user = locals.user;
    if (!user?.id) {
      return createUnauthorizedError();
    }

    const { id } = params;
    if (!id) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Brak ID załącznika'
      );
    }

    // Pobierz załącznik (sprawdź ownership)
    const [media] = await db
      .select()
      .from(mediaAttachments)
      .where(and(eq(mediaAttachments.id, id), eq(mediaAttachments.userId, user.id)))
      .limit(1);

    if (!media) {
      return createErrorResponse(
        ErrorCode.MEDIA_NOT_FOUND,
        'Załącznik nie znaleziony'
      );
    }

    // Usuń plik fizyczny
    try {
      await storage.deleteFile(media.fileUrl);
    } catch (error) {
      console.error('Error deleting physical file:', error);
      // Kontynuuj mimo błędu - plik może być już usunięty
    }

    // Usuń wpis z bazy
    await db.delete(mediaAttachments).where(eq(mediaAttachments.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('query')) {
        return handleDatabaseError(error, 'deleting media');
      }
    }
    return handleUnexpectedError(error, 'media/[id] DELETE');
  }
};
