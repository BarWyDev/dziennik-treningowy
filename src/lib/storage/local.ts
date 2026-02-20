import type { StorageService } from './types';
import { mkdir, writeFile, access, unlink, readdir, rmdir } from 'node:fs/promises';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Local File System Storage Implementation
 * Zapisuje pliki do public/uploads/
 * Struktura: public/uploads/{userId}/{entityType}/{entityId}/{uniqueFileName}
 */
export class LocalStorageService implements StorageService {
  private readonly baseDir = 'public/uploads';
  private readonly baseUrl = '/api/files';

  async uploadFile(file: File, filePath: string): Promise<string> {
    // Konwersja File (web API) na buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Pełna ścieżka do zapisu
    const fullPath = path.join(this.baseDir, filePath);

    // Upewnij się, że folder istnieje (recursive: true nie rzuca błędu jeśli istnieje)
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });

    // Zapisz plik asynchronicznie (nie blokuje event loop)
    await writeFile(fullPath, buffer);

    // Zwróć publiczny URL
    return this.getFileUrl(filePath);
  }

  async deleteFile(url: string): Promise<void> {
    try {
      // Konwertuj URL na ścieżkę systemową
      const relativePath = url.replace(this.baseUrl, '');
      const fullPath = path.join(this.baseDir, relativePath);

      // Sprawdź czy plik istnieje (access rzuca błąd jeśli nie istnieje)
      try {
        await access(fullPath);
      } catch {
        return; // Plik już nie istnieje
      }

      await unlink(fullPath);

      // Opcjonalnie usuń puste foldery
      await this.cleanupEmptyDirs(path.dirname(fullPath));
    } catch (error) {
      console.error('Error deleting file:', error);
      // Nie rzucaj błędu - plik może już być usunięty
    }
  }

  getFileUrl(filePath: string): string {
    // Zamień backslashe na forward slashe dla URL
    const urlPath = filePath.replace(/\\/g, '/');
    return `${this.baseUrl}/${urlPath}`;
  }

  /**
   * Generuje bezpieczną i unikalną nazwę pliku
   */
  generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const uuid = randomUUID();
    // Sanityzuj oryginalną nazwę (usuń znaki specjalne)
    const safeName = path.basename(originalName, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .substring(0, 50); // Ogranicz długość

    return `${uuid}-${safeName}${ext}`;
  }

  /**
   * Generuje ścieżkę do pliku
   * Format: {userId}/{entityType}/{entityId}/{fileName}
   */
  generateFilePath(
    userId: string,
    entityType: 'training' | 'personal-record',
    entityId: string,
    fileName: string
  ): string {
    return path.join(userId, entityType, entityId, fileName);
  }

  /**
   * Usuwa puste foldery rekursywnie (do max 5 poziomów w górę)
   */
  private async cleanupEmptyDirs(dirPath: string, depth = 0): Promise<void> {
    if (depth >= 5) return;

    try {
      // Zatrzymaj się na baseDir
      if (dirPath === this.baseDir || !dirPath.startsWith(this.baseDir)) {
        return;
      }

      let files: string[];
      try {
        files = await readdir(dirPath);
      } catch {
        return; // Katalog nie istnieje lub brak dostępu
      }

      if (files.length === 0) {
        await rmdir(dirPath);
        // Rekursywnie sprawdź folder rodzica
        await this.cleanupEmptyDirs(path.dirname(dirPath), depth + 1);
      }
    } catch (error) {
      // Ignoruj błędy cleanup
      console.error('Error cleaning up directories:', error);
    }
  }
}
