import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import {
  validateFileType as getFileType,
  validateFileSize,
} from '@/lib/validations/media';
import { validateFileSignature } from '@/lib/utils/file-signatures';
import {
  createErrorResponse,
  createNotFoundError,
  ErrorCode,
} from '@/lib/error-handler';

/**
 * Waliduje plik przed uploadem
 * @returns null jeśli walidacja przeszła, Response z błędem jeśli nie
 */
export async function validateUploadFile(file: File | null): Promise<Response | null> {
  if (!file) {
    return createErrorResponse(
      ErrorCode.MISSING_REQUIRED_FIELD,
      'Plik jest wymagany',
      { field: 'file' }
    );
  }

  // Walidacja typu pliku (MIME type)
  const fileType = getFileType(file);
  if (!fileType) {
    return createErrorResponse(
      ErrorCode.INVALID_FILE_TYPE,
      'Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, WebP, HEIC, MP4, MOV, WebM',
      { allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime', 'video/webm'] }
    );
  }

  // Walidacja magic bytes (ochrona przed MIME type spoofing)
  const signatureValid = await validateFileSignature(file);
  if (!signatureValid) {
    return createErrorResponse(
      ErrorCode.INVALID_FILE_TYPE,
      'Sygnatura pliku nie zgadza się z deklarowanym typem MIME. Plik może być uszkodzony lub złośliwy.',
      { reason: 'signature_mismatch' }
    );
  }

  // Walidacja rozmiaru
  if (!validateFileSize(file)) {
    return createErrorResponse(
      ErrorCode.FILE_TOO_LARGE,
      'Plik przekracza limit 50MB',
      { maxSize: 50 * 1024 * 1024, actualSize: file.size }
    );
  }

  return null;
}

/**
 * Waliduje typ encji
 * @returns null jeśli walidacja przeszła, Response z błędem jeśli nie
 */
export function validateEntityType(
  entityType: string | null
): Response | null {
  if (!entityType || !['training', 'personal-record'].includes(entityType)) {
    return createErrorResponse(
      ErrorCode.INVALID_INPUT,
      'Nieprawidłowy typ encji. Dozwolone: training, personal-record',
      { field: 'entityType', allowedValues: ['training', 'personal-record'] }
    );
  }

  return null;
}

/**
 * Sprawdza czy encja istnieje i należy do użytkownika
 */
export async function verifyEntityOwnership(
  entityType: 'training' | 'personal-record',
  entityId: string,
  userId: string
): Promise<Response | null> {
  if (entityType === 'training') {
    const { trainings } = await import('@/lib/db/schema');

    const [training] = await db
      .select()
      .from(trainings)
      .where(and(eq(trainings.id, entityId), eq(trainings.userId, userId)))
      .limit(1);

    if (!training) {
      return createNotFoundError('training', entityId);
    }
  } else {
    const { personalRecords } = await import('@/lib/db/schema');

    const [record] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, entityId), eq(personalRecords.userId, userId)))
      .limit(1);

    if (!record) {
      return createNotFoundError('personal-record', entityId);
    }
  }

  return null;
}
