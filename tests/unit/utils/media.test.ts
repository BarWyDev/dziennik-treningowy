/**
 * Testy utility functions dla operacji na mediach
 * Pokrywa: normalizację URL, grupowanie, sortowanie, limity
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeMediaUrl,
  groupMediaByType,
  sortMediaByDate,
  canAddMoreFiles,
  getTotalMediaSize,
  getMediaCount,
} from '@/lib/utils/media';

// Mockowane dane mediów
const mockMedia = [
  {
    id: 'media-1',
    userId: 'user-1',
    trainingId: 'training-1',
    personalRecordId: null,
    fileName: 'photo1.jpg',
    fileUrl: '/uploads/photo1.jpg',
    fileType: 'image' as const,
    mimeType: 'image/jpeg',
    fileSize: 1024000, // ~1 MB
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'media-2',
    userId: 'user-1',
    trainingId: 'training-1',
    personalRecordId: null,
    fileName: 'video1.mp4',
    fileUrl: '/uploads/video1.mp4',
    fileType: 'video' as const,
    mimeType: 'video/mp4',
    fileSize: 5120000, // ~5 MB
    createdAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-01-14'),
  },
  {
    id: 'media-3',
    userId: 'user-1',
    trainingId: 'training-1',
    personalRecordId: null,
    fileName: 'photo2.png',
    fileUrl: '/api/files/photo2.png',
    fileType: 'image' as const,
    mimeType: 'image/png',
    fileSize: 2048000, // ~2 MB
    createdAt: new Date('2026-01-16'),
    updatedAt: new Date('2026-01-16'),
  },
];

describe('normalizeMediaUrl', () => {
  it('konwertuje stary format /uploads/ na /api/files/', () => {
    expect(normalizeMediaUrl('/uploads/photo.jpg')).toBe('/api/files/photo.jpg');
    expect(normalizeMediaUrl('/uploads/video.mp4')).toBe('/api/files/video.mp4');
    expect(normalizeMediaUrl('/uploads/subdir/file.png')).toBe('/api/files/subdir/file.png');
  });

  it('nie zmienia nowego formatu /api/files/', () => {
    expect(normalizeMediaUrl('/api/files/photo.jpg')).toBe('/api/files/photo.jpg');
  });

  it('nie zmienia innych ścieżek', () => {
    expect(normalizeMediaUrl('/other/path/file.jpg')).toBe('/other/path/file.jpg');
    expect(normalizeMediaUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
  });

  it('obsługuje pusty string', () => {
    expect(normalizeMediaUrl('')).toBe('');
  });
});

describe('groupMediaByType', () => {
  it('grupuje media według typu', () => {
    const grouped = groupMediaByType(mockMedia);

    expect(grouped.images).toHaveLength(2);
    expect(grouped.videos).toHaveLength(1);
  });

  it('zwraca puste tablice dla braku mediów', () => {
    const grouped = groupMediaByType([]);

    expect(grouped.images).toHaveLength(0);
    expect(grouped.videos).toHaveLength(0);
  });

  it('zwraca tylko obrazy gdy brak wideo', () => {
    const onlyImages = mockMedia.filter(m => m.fileType === 'image');
    const grouped = groupMediaByType(onlyImages);

    expect(grouped.images).toHaveLength(2);
    expect(grouped.videos).toHaveLength(0);
  });

  it('zwraca tylko wideo gdy brak obrazów', () => {
    const onlyVideos = mockMedia.filter(m => m.fileType === 'video');
    const grouped = groupMediaByType(onlyVideos);

    expect(grouped.images).toHaveLength(0);
    expect(grouped.videos).toHaveLength(1);
  });
});

describe('sortMediaByDate', () => {
  it('sortuje media od najnowszych', () => {
    const sorted = sortMediaByDate(mockMedia);

    expect(sorted[0].id).toBe('media-3'); // 2026-01-16
    expect(sorted[1].id).toBe('media-1'); // 2026-01-15
    expect(sorted[2].id).toBe('media-2'); // 2026-01-14
  });

  it('nie modyfikuje oryginalnej tablicy', () => {
    const original = [...mockMedia];
    sortMediaByDate(mockMedia);

    expect(mockMedia[0].id).toBe(original[0].id);
  });

  it('obsługuje pustą tablicę', () => {
    const sorted = sortMediaByDate([]);
    expect(sorted).toHaveLength(0);
  });

  it('obsługuje pojedynczy element', () => {
    const sorted = sortMediaByDate([mockMedia[0]]);
    expect(sorted).toHaveLength(1);
  });
});

describe('canAddMoreFiles', () => {
  const maxImages = 5;
  const maxVideos = 1;

  it('pozwala dodać obrazy gdy poniżej limitu', () => {
    const existingMedia = mockMedia.filter(m => m.fileType === 'image').slice(0, 2);
    expect(canAddMoreFiles(existingMedia, 'image', maxImages, maxVideos)).toBe(true);
  });

  it('blokuje dodawanie obrazów przy osiągniętym limicie', () => {
    const existingImages = Array(5).fill(null).map((_, i) => ({
      ...mockMedia[0],
      id: `image-${i}`,
      fileType: 'image' as const,
    }));
    expect(canAddMoreFiles(existingImages, 'image', maxImages, maxVideos)).toBe(false);
  });

  it('pozwala dodać wideo gdy poniżej limitu', () => {
    const existingMedia: typeof mockMedia = [];
    expect(canAddMoreFiles(existingMedia, 'video', maxImages, maxVideos)).toBe(true);
  });

  it('blokuje dodawanie wideo przy osiągniętym limicie', () => {
    const existingVideos = [{
      ...mockMedia[1],
      fileType: 'video' as const,
    }];
    expect(canAddMoreFiles(existingVideos, 'video', maxImages, maxVideos)).toBe(false);
  });

  it('rozróżnia limity między obrazami a wideo', () => {
    const existingMedia = [
      { ...mockMedia[0], fileType: 'image' as const },
      { ...mockMedia[1], fileType: 'video' as const },
    ];

    // 1 obraz z 5 - można dodać więcej
    expect(canAddMoreFiles(existingMedia, 'image', maxImages, maxVideos)).toBe(true);
    // 1 wideo z 1 - nie można dodać więcej
    expect(canAddMoreFiles(existingMedia, 'video', maxImages, maxVideos)).toBe(false);
  });
});

describe('getTotalMediaSize', () => {
  it('oblicza całkowity rozmiar mediów', () => {
    const totalSize = getTotalMediaSize(mockMedia);
    // 1024000 + 5120000 + 2048000 = 8192000
    expect(totalSize).toBe(8192000);
  });

  it('zwraca 0 dla pustej tablicy', () => {
    expect(getTotalMediaSize([])).toBe(0);
  });

  it('obsługuje pojedynczy element', () => {
    expect(getTotalMediaSize([mockMedia[0]])).toBe(1024000);
  });
});

describe('getMediaCount', () => {
  it('zwraca poprawną liczbę mediów według typu', () => {
    const count = getMediaCount(mockMedia);

    expect(count.images).toBe(2);
    expect(count.videos).toBe(1);
    expect(count.total).toBe(3);
  });

  it('zwraca 0 dla pustej tablicy', () => {
    const count = getMediaCount([]);

    expect(count.images).toBe(0);
    expect(count.videos).toBe(0);
    expect(count.total).toBe(0);
  });

  it('total równa się sumie images i videos', () => {
    const count = getMediaCount(mockMedia);
    expect(count.total).toBe(count.images + count.videos);
  });
});

describe('Media Utils - Scenariusze biznesowe', () => {
  it('sprawdza czy użytkownik może dodać plik do treningu', () => {
    const maxImages = 5;
    const maxVideos = 1;
    const maxTotalSize = 20 * 1024 * 1024; // 20 MB

    const existingMedia = mockMedia;
    const newFileSize = 3 * 1024 * 1024; // 3 MB
    const newFileType = 'image' as const;

    // Sprawdź limit typu
    const canAddByType = canAddMoreFiles(existingMedia, newFileType, maxImages, maxVideos);
    
    // Sprawdź limit rozmiaru
    const currentSize = getTotalMediaSize(existingMedia);
    const canAddBySize = currentSize + newFileSize <= maxTotalSize;

    // Użytkownik może dodać plik jeśli oba warunki są spełnione
    expect(canAddByType && canAddBySize).toBe(true);
  });

  it('formatuje podsumowanie mediów', () => {
    const count = getMediaCount(mockMedia);
    const totalSize = getTotalMediaSize(mockMedia);

    const summary = `${count.total} plików (${count.images} zdjęć, ${count.videos} filmów)`;
    
    expect(summary).toBe('3 plików (2 zdjęć, 1 filmów)');
    expect(totalSize).toBeGreaterThan(0);
  });
});
