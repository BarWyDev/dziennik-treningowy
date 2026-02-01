/**
 * Storage Service Interface
 * Abstrakcja pozwalająca łatwo przejść z lokalnego storage na cloud (Cloudinary/S3)
 */

export interface StorageService {
  /**
   * Upload pliku do storage
   * @param file - Plik do uploadu
   * @param path - Ścieżka w storage (bez głównego folderu uploads)
   * @returns URL do pliku
   */
  uploadFile(file: File, path: string): Promise<string>;

  /**
   * Usuń plik ze storage
   * @param url - URL pliku do usunięcia
   */
  deleteFile(url: string): Promise<void>;

  /**
   * Pobierz publiczny URL do pliku
   * @param path - Ścieżka do pliku
   * @returns Publiczny URL
   */
  getFileUrl(path: string): string;

  /**
   * Generuje bezpieczną i unikalną nazwę pliku
   * @param originalName - Oryginalna nazwa pliku
   * @returns Wygenerowana nazwa pliku
   */
  generateFileName(originalName: string): string;

  /**
   * Generuje ścieżkę do pliku
   * @param userId - ID użytkownika
   * @param entityType - Typ encji ('training' | 'personal-record')
   * @param entityId - ID encji
   * @param fileName - Nazwa pliku
   * @returns Ścieżka do pliku
   */
  generateFilePath(
    userId: string,
    entityType: 'training' | 'personal-record',
    entityId: string,
    fileName: string
  ): string;
}

export interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  mimeType: string;
  fileSize: number;
}
