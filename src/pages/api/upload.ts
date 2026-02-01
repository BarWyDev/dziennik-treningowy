import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { mediaAttachments } from '@/lib/db/schema';
import { storage } from '@/lib/storage';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE,
  validateFileType as getFileType,
  validateFileSize,
} from '@/lib/validations/media';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from '@/lib/rate-limit';
import {
  handleUnexpectedError,
  handleDatabaseError,
  createErrorResponse,
  ErrorCode,
  createUnauthorizedError,
} from '@/lib/error-handler';

/**
 * POST /api/upload
 * Upload pliku (zdjęcie lub film) do storage
 *
 * Przyjmuje multipart/form-data z polami:
 * - file: plik do uploadu
 * - entityType: 'training' | 'personal-record'
 * - entityId: UUID encji (opcjonalne dla nowych)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdź autentykację
    const user = locals.user;
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting - 10 uploadów na minutę na użytkownika
    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request, user.id),
      RateLimitPresets.UPLOAD
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parsuj multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as 'training' | 'personal-record';
    const entityId = formData.get('entityId') as string | null;

    // Walidacja podstawowa
    if (!file) {
      return new Response(JSON.stringify({ error: 'Brak pliku' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!entityType || !['training', 'personal-record'].includes(entityType)) {
      return new Response(JSON.stringify({ error: 'Nieprawidłowy typ encji' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Walidacja typu pliku
    const fileType = getFileType(file);
    if (!fileType) {
      return new Response(
        JSON.stringify({
          error: 'Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, WebP, HEIC, MP4, MOV, WebM',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Walidacja rozmiaru
    if (!validateFileSize(file)) {
      return new Response(JSON.stringify({ error: 'Plik przekracza limit 50MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Jeśli entityId podane, sprawdź czy istnieje i należy do użytkownika
    if (entityId) {
      if (entityType === 'training') {
        const { trainings } = await import('@/lib/db/schema');
        const { eq, and } = await import('drizzle-orm');

        const [training] = await db
          .select()
          .from(trainings)
          .where(and(eq(trainings.id, entityId), eq(trainings.userId, user.id)))
          .limit(1);

        if (!training) {
          return new Response(JSON.stringify({ error: 'Trening nie znaleziony' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        const { personalRecords } = await import('@/lib/db/schema');
        const { eq, and } = await import('drizzle-orm');

        const [record] = await db
          .select()
          .from(personalRecords)
          .where(and(eq(personalRecords.id, entityId), eq(personalRecords.userId, user.id)))
          .limit(1);

        if (!record) {
          return new Response(JSON.stringify({ error: 'Rekord nie znaleziony' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Generuj ścieżkę do pliku
    // Użyj tymczasowego ID jeśli entityId nie podane (dla nowych encji)
    const targetEntityId = entityId || 'temp-' + crypto.randomUUID();
    const fileName = storage.generateFileName(file.name);
    const filePath = storage.generateFilePath(user.id, entityType, targetEntityId, fileName);

    // Upload pliku
    const fileUrl = await storage.uploadFile(file, filePath);

    // Zapisz metadane do bazy
    const [mediaRecord] = await db
      .insert(mediaAttachments)
      .values({
        userId: user.id,
        trainingId: entityType === 'training' && entityId ? entityId : null,
        personalRecordId: entityType === 'personal-record' && entityId ? entityId : null,
        fileName: file.name,
        fileUrl,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
      })
      .returning();

    return new Response(
      JSON.stringify({
        id: mediaRecord.id,
        fileName: mediaRecord.fileName,
        fileUrl: mediaRecord.fileUrl,
        fileType: mediaRecord.fileType,
        mimeType: mediaRecord.mimeType,
        fileSize: mediaRecord.fileSize,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Sprawdź typ błędu
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('query')) {
        return handleDatabaseError(error, 'uploading file');
      }
      if (error.message.includes('storage') || error.message.includes('upload')) {
        return createErrorResponse(
          ErrorCode.UPLOAD_FAILED,
          'Błąd podczas uploadu pliku',
          import.meta.env.PROD ? undefined : { error: error.message }
        );
      }
    }
    return handleUnexpectedError(error, 'upload POST');
  }
};
