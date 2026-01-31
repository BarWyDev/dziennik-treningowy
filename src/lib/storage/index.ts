import { LocalStorageService } from './local';
import type { StorageService } from './types';

/**
 * Aktywny storage service
 *
 * Aby przejść na cloud storage (Cloudinary/S3), wystarczy:
 * 1. Utworzyć nową implementację StorageService (np. CloudinaryStorageService)
 * 2. Zmienić poniższy export na nową implementację
 * 3. Opcjonalnie uruchomić skrypt migracji plików
 */
export const storage: StorageService = new LocalStorageService();

// Re-export types
export type { StorageService, UploadedFile } from './types';
