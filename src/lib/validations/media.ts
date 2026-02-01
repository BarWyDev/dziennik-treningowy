import { z } from 'zod';

// Dozwolone typy MIME
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
] as const;

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'] as const;

// Limity
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB w bajtach
export const MAX_IMAGES_PER_ENTITY = 5;
export const MAX_VIDEOS_PER_ENTITY = 1;
export const MAX_FILES_PER_UPLOAD = 10; // Maksymalna liczba plików jednocześnie

// Walidacja pojedynczego pliku na poziomie serwera
export const fileUploadSchema = z.object({
  file: z.any(),
  entityType: z.enum(['training', 'personal-record']),
  entityId: z.string().uuid().optional(), // Optional dla nowych encji
});

// Walidacja metadanych uploadowanego pliku
export const uploadedFileSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.enum(['image', 'video']),
  mimeType: z.string(),
  fileSize: z.number(),
});

// Walidacja mediów w requestach (dla POST/PUT treningów i rekordów)
export const mediaIdsSchema = z
  .array(z.string().uuid())
  .max(
    MAX_IMAGES_PER_ENTITY + MAX_VIDEOS_PER_ENTITY,
    `Maksymalnie ${MAX_IMAGES_PER_ENTITY + MAX_VIDEOS_PER_ENTITY} plików`
  )
  .optional();

// Helper do walidacji typu pliku
export function validateFileType(file: File): 'image' | 'video' | null {
  if (ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return 'image';
  }
  if (ALLOWED_VIDEO_TYPES.includes(file.type as any)) {
    return 'video';
  }
  return null;
}

// Helper do walidacji rozmiaru
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

// Helper do walidacji liczby plików
export function validateFileCount(
  existingFiles: Array<{ fileType: 'image' | 'video' }>,
  newFileType: 'image' | 'video'
): boolean {
  const imageCount = existingFiles.filter((f) => f.fileType === 'image').length;
  const videoCount = existingFiles.filter((f) => f.fileType === 'video').length;

  if (newFileType === 'image' && imageCount >= MAX_IMAGES_PER_ENTITY) {
    return false;
  }
  if (newFileType === 'video' && videoCount >= MAX_VIDEOS_PER_ENTITY) {
    return false;
  }

  return true;
}

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type UploadedFile = z.infer<typeof uploadedFileSchema>;
