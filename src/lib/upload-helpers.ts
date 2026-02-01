import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import {
  validateFileType as getFileType,
  validateFileSize,
} from '@/lib/validations/media';
import { validateFileSignature } from '@/lib/utils/file-signatures';

/**
 * Waliduje plik przed uploadem
 * @returns null jeśli walidacja przeszła, Response z błędem jeśli nie
 */
export async function validateUploadFile(file: File | null): Promise<Response | null> {
  if (!file) {
    return new Response(JSON.stringify({ error: 'File is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Walidacja typu pliku (MIME type)
  const fileType = getFileType(file);
  if (!fileType) {
    return new Response(
      JSON.stringify({
        error: 'Invalid file type. Allowed: JPG, PNG, WebP, HEIC, MP4, MOV, WebM',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Walidacja magic bytes (ochrona przed MIME type spoofing)
  const signatureValid = await validateFileSignature(file);
  if (!signatureValid) {
    return new Response(
      JSON.stringify({
        error: 'File signature does not match declared MIME type. File may be corrupted or malicious.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Walidacja rozmiaru
  if (!validateFileSize(file)) {
    return new Response(JSON.stringify({ error: 'File exceeds 50MB limit' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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
    return new Response(JSON.stringify({ error: 'Invalid entity type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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
      return new Response(JSON.stringify({ error: 'Training not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    const { personalRecords } = await import('@/lib/db/schema');

    const [record] = await db
      .select()
      .from(personalRecords)
      .where(and(eq(personalRecords.id, entityId), eq(personalRecords.userId, userId)))
      .limit(1);

    if (!record) {
      return new Response(JSON.stringify({ error: 'Personal record not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return null;
}
