import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { mediaAttachments } from '@/lib/db/schema';
import { storage } from '@/lib/storage';
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
} from '@/lib/error-handler';
import {
  validateUploadFile,
  validateEntityType,
  verifyEntityOwnership,
} from '@/lib/upload-helpers';
import { validateFileType as getFileType } from '@/lib/validations/media';

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

    // Walidacja pliku
    const fileValidationError = await validateUploadFile(file);
    if (fileValidationError) {
      return fileValidationError;
    }

    // Walidacja typu encji
    const entityTypeValidationError = validateEntityType(entityType);
    if (entityTypeValidationError) {
      return entityTypeValidationError;
    }

    // Jeśli entityId podane, sprawdź czy istnieje i należy do użytkownika
    if (entityId) {
      const ownershipError = await verifyEntityOwnership(entityType, entityId, user.id);
      if (ownershipError) {
        return ownershipError;
      }
    }

    // Pobierz typ pliku (już zwalidowany w validateUploadFile)
    const fileType = getFileType(file!);

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
