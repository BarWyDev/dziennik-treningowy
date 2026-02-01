import type { APIRoute } from 'astro';
import { db, personalRecords, mediaAttachments } from '@/lib/db';
import { updatePersonalRecordSchema } from '@/lib/validations/personal-record';
import { eq, and, inArray } from 'drizzle-orm';
import { storage } from '@/lib/storage';
import { requireAuthWithRateLimit, requireAuthWithCSRF, RateLimitPresets } from '@/lib/api-helpers';
import {
  handleUnexpectedError,
  handleDatabaseError,
  handleValidationError,
  createNotFoundError,
} from '@/lib/error-handler';

export const GET: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Record ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [record] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, id), eq(personalRecords.userId, authResult.user.id)));

    if (!record) {
      return createNotFoundError('personal-record', id);
    }

    // Pobierz media załączniki
    const media = await db
      .select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.personalRecordId, id));

    const data = {
      ...record,
      media,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching personal record');
    }
    return handleUnexpectedError(error, 'personal-records/[id] GET');
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Record ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validation = updatePersonalRecordSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    const [existing] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, id), eq(personalRecords.userId, authResult.user.id)));

    if (!existing) {
      return createNotFoundError('personal-record', id);
    }

    const { mediaIds, ...recordData } = validation.data;

    const [updated] = await db
      .update(personalRecords)
      .set({
        ...recordData,
        updatedAt: new Date(),
      })
      .where(eq(personalRecords.id, id))
      .returning();

    // Aktualizuj powiązania z media
    if (mediaIds !== undefined) {
      if (mediaIds && mediaIds.length > 0) {
        // Powiąż nowe media
        await db
          .update(mediaAttachments)
          .set({ personalRecordId: id })
          .where(
            and(
              inArray(mediaAttachments.id, mediaIds),
              eq(mediaAttachments.userId, authResult.user.id)
            )
          );
      }
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'updating personal record');
    }
    return handleUnexpectedError(error, 'personal-records/[id] PUT');
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Record ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [existing] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, id), eq(personalRecords.userId, authResult.user.id)));

    if (!existing) {
      return createNotFoundError('personal-record', id);
    }

    // Pobierz wszystkie media załączniki przed usunięciem
    const media = await db
      .select()
      .from(mediaAttachments)
      .where(eq(mediaAttachments.personalRecordId, id));

    // Usuń fizyczne pliki
    for (const m of media) {
      try {
        await storage.deleteFile(m.fileUrl);
      } catch (error) {
        console.error(`Error deleting file ${m.fileUrl}:`, error);
        // Kontynuuj mimo błędu
      }
    }

    // Usuń rekord (ON DELETE CASCADE usunie wpisy z media_attachments)
    await db.delete(personalRecords).where(eq(personalRecords.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'deleting personal record');
    }
    return handleUnexpectedError(error, 'personal-records/[id] DELETE');
  }
};
