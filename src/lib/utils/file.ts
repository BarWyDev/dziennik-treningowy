/**
 * Formatuje rozmiar pliku z bajtów na czytelny format
 * @param bytes - Rozmiar w bajtach
 * @returns Sformatowany string (np. "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Waliduje czy plik jest dozwolonego typu
 * @param file - Plik do walidacji
 * @param allowedTypes - Tablica dozwolonych typów MIME
 * @returns true jeśli plik jest dozwolonego typu
 */
export function validateFileType(file: File, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Waliduje rozmiar pliku
 * @param file - Plik do walidacji
 * @param maxSize - Maksymalny rozmiar w bajtach
 * @returns true jeśli plik nie przekracza limitu
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Pobiera rozszerzenie pliku z nazwy
 * @param fileName - Nazwa pliku
 * @returns Rozszerzenie (z kropką) lub pusty string
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.substring(lastDot);
}

/**
 * Sanityzuje nazwę pliku (usuwa niebezpieczne znaki)
 * @param fileName - Oryginalna nazwa pliku
 * @returns Bezpieczna nazwa pliku
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '-') // Zastąp niebezpieczne znaki
    .replace(/\.+/g, '.') // Usuń wielokropki
    .replace(/-+/g, '-') // Usuń wielokrotne myślniki
    .substring(0, 255); // Ogranicz długość
}

/**
 * Sprawdza czy plik jest obrazem
 * @param mimeType - Typ MIME pliku
 * @returns true jeśli to obraz
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Sprawdza czy plik jest filmem
 * @param mimeType - Typ MIME pliku
 * @returns true jeśli to film
 */
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}
