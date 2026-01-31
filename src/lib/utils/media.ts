import type { MediaAttachment } from '@/lib/db/schema';

/**
 * Konwertuje stary URL (/uploads/...) na nowy (/api/files/...)
 * Dla backward compatibility z plikami uploadowanymi przed zmianą
 */
export function normalizeMediaUrl(url: string): string {
  if (url.startsWith('/uploads/')) {
    return url.replace('/uploads/', '/api/files/');
  }
  return url;
}

/**
 * Grupuje załączniki według typu
 */
export function groupMediaByType(media: MediaAttachment[]) {
  return {
    images: media.filter((m) => m.fileType === 'image'),
    videos: media.filter((m) => m.fileType === 'video'),
  };
}

/**
 * Sortuje media według daty utworzenia (od najnowszych)
 */
export function sortMediaByDate(media: MediaAttachment[]): MediaAttachment[] {
  return [...media].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Sprawdza czy można dodać więcej plików danego typu
 */
export function canAddMoreFiles(
  existingMedia: MediaAttachment[],
  fileType: 'image' | 'video',
  maxImages: number,
  maxVideos: number
): boolean {
  const count = existingMedia.filter((m) => m.fileType === fileType).length;

  if (fileType === 'image') {
    return count < maxImages;
  } else {
    return count < maxVideos;
  }
}

/**
 * Oblicza całkowity rozmiar załączników
 */
export function getTotalMediaSize(media: MediaAttachment[]): number {
  return media.reduce((sum, m) => sum + m.fileSize, 0);
}

/**
 * Pobiera liczbę załączników według typu
 */
export function getMediaCount(media: MediaAttachment[]): {
  images: number;
  videos: number;
  total: number;
} {
  const images = media.filter((m) => m.fileType === 'image').length;
  const videos = media.filter((m) => m.fileType === 'video').length;

  return {
    images,
    videos,
    total: images + videos,
  };
}
