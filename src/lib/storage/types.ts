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
}

export interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  mimeType: string;
  fileSize: number;
}
