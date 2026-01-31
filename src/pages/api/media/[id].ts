import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { mediaAttachments } from '@/lib/db/schema';
import { storage } from '@/lib/storage';
import { eq, and } from 'drizzle-orm';

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Brak ID załącznika' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pobierz załącznik (sprawdź ownership)
    const [media] = await db
      .select()
      .from(mediaAttachments)
      .where(and(eq(mediaAttachments.id, id), eq(mediaAttachments.userId, user.id)))
      .limit(1);

    if (!media) {
      return new Response(JSON.stringify({ error: 'Załącznik nie znaleziony' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
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
    console.error('Delete media error:', error);
    return new Response(JSON.stringify({ error: 'Błąd podczas usuwania załącznika' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
