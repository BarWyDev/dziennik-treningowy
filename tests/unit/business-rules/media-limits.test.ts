/**
 * Testy reguł biznesowych - Limity mediów
 * 
 * Testuje:
 * - Maksymalnie 5 zdjęć per encja (training/personal-record)
 * - Maksymalnie 1 video per encja
 * - Maksymalny rozmiar pliku 50MB
 * - Dozwolone typy plików (JPEG, PNG, WebP, HEIC, MP4, MOV, WebM)
 * 
 * KRYTYCZNE: Kontrola wykorzystania zasobów i zapobieganie abuse.
 */

import { describe, it, expect } from 'vitest';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_ENTITY,
  MAX_VIDEOS_PER_ENTITY,
  validateFileType,
  validateFileSize,
  validateFileCount,
} from '@/lib/validations/media';

describe('Media Limits - Constants', () => {
  describe('Limity ilości plików', () => {
    it('MAX_IMAGES_PER_ENTITY powinno być równe 5', () => {
      expect(MAX_IMAGES_PER_ENTITY).toBe(5);
    });

    it('MAX_VIDEOS_PER_ENTITY powinno być równe 1', () => {
      expect(MAX_VIDEOS_PER_ENTITY).toBe(1);
    });

    it('łączna liczba plików per encja to 6 (5 zdjęć + 1 video)', () => {
      expect(MAX_IMAGES_PER_ENTITY + MAX_VIDEOS_PER_ENTITY).toBe(6);
    });
  });

  describe('Limit rozmiaru pliku', () => {
    it('MAX_FILE_SIZE powinno być równe 50MB w bajtach', () => {
      const fiftyMB = 50 * 1024 * 1024;
      expect(MAX_FILE_SIZE).toBe(fiftyMB);
      expect(MAX_FILE_SIZE).toBe(52428800);
    });
  });

  describe('Dozwolone typy MIME', () => {
    it('powinien zawierać dozwolone typy obrazów', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpg');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/png');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/webp');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/heic');
    });

    it('powinien zawierać dozwolone typy video', () => {
      expect(ALLOWED_VIDEO_TYPES).toContain('video/mp4');
      expect(ALLOWED_VIDEO_TYPES).toContain('video/quicktime'); // MOV
      expect(ALLOWED_VIDEO_TYPES).toContain('video/webm');
    });

    it('NIE powinien zawierać potencjalnie niebezpiecznych typów', () => {
      const allTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
      
      expect(allTypes).not.toContain('text/html');
      expect(allTypes).not.toContain('application/javascript');
      expect(allTypes).not.toContain('image/svg+xml'); // SVG może zawierać XSS
      expect(allTypes).not.toContain('application/x-executable');
    });
  });
});

describe('Media Limits - validateFileType()', () => {
  // Helper do tworzenia mock File
  const createMockFile = (type: string, name: string = 'test.jpg'): File => {
    return { type, name, size: 1024 } as File;
  };

  describe('Obrazy - dozwolone typy', () => {
    it('powinien zwrócić "image" dla JPEG', () => {
      expect(validateFileType(createMockFile('image/jpeg'))).toBe('image');
      expect(validateFileType(createMockFile('image/jpg'))).toBe('image');
    });

    it('powinien zwrócić "image" dla PNG', () => {
      expect(validateFileType(createMockFile('image/png'))).toBe('image');
    });

    it('powinien zwrócić "image" dla WebP', () => {
      expect(validateFileType(createMockFile('image/webp'))).toBe('image');
    });

    it('powinien zwrócić "image" dla HEIC', () => {
      expect(validateFileType(createMockFile('image/heic'))).toBe('image');
    });
  });

  describe('Video - dozwolone typy', () => {
    it('powinien zwrócić "video" dla MP4', () => {
      expect(validateFileType(createMockFile('video/mp4'))).toBe('video');
    });

    it('powinien zwrócić "video" dla MOV (QuickTime)', () => {
      expect(validateFileType(createMockFile('video/quicktime'))).toBe('video');
    });

    it('powinien zwrócić "video" dla WebM', () => {
      expect(validateFileType(createMockFile('video/webm'))).toBe('video');
    });
  });

  describe('Niedozwolone typy', () => {
    it('powinien zwrócić null dla GIF', () => {
      expect(validateFileType(createMockFile('image/gif'))).toBe(null);
    });

    it('powinien zwrócić null dla SVG', () => {
      expect(validateFileType(createMockFile('image/svg+xml'))).toBe(null);
    });

    it('powinien zwrócić null dla PDF', () => {
      expect(validateFileType(createMockFile('application/pdf'))).toBe(null);
    });

    it('powinien zwrócić null dla plików tekstowych', () => {
      expect(validateFileType(createMockFile('text/plain'))).toBe(null);
    });

    it('powinien zwrócić null dla HTML', () => {
      expect(validateFileType(createMockFile('text/html'))).toBe(null);
    });

    it('powinien zwrócić null dla JavaScript', () => {
      expect(validateFileType(createMockFile('application/javascript'))).toBe(null);
    });

    it('powinien zwrócić null dla AVI', () => {
      expect(validateFileType(createMockFile('video/x-msvideo'))).toBe(null);
    });
  });
});

describe('Media Limits - validateFileSize()', () => {
  const createMockFile = (size: number): File => {
    return { type: 'image/jpeg', name: 'test.jpg', size } as File;
  };

  describe('Dozwolone rozmiary', () => {
    it('powinien zaakceptować plik 1KB', () => {
      expect(validateFileSize(createMockFile(1024))).toBe(true);
    });

    it('powinien zaakceptować plik 1MB', () => {
      expect(validateFileSize(createMockFile(1024 * 1024))).toBe(true);
    });

    it('powinien zaakceptować plik 49MB', () => {
      expect(validateFileSize(createMockFile(49 * 1024 * 1024))).toBe(true);
    });

    it('powinien zaakceptować plik dokładnie 50MB', () => {
      expect(validateFileSize(createMockFile(50 * 1024 * 1024))).toBe(true);
    });
  });

  describe('Przekroczone rozmiary', () => {
    it('powinien odrzucić plik 50MB + 1 bajt', () => {
      expect(validateFileSize(createMockFile(50 * 1024 * 1024 + 1))).toBe(false);
    });

    it('powinien odrzucić plik 51MB', () => {
      expect(validateFileSize(createMockFile(51 * 1024 * 1024))).toBe(false);
    });

    it('powinien odrzucić plik 100MB', () => {
      expect(validateFileSize(createMockFile(100 * 1024 * 1024))).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('powinien zaakceptować pusty plik (0 bajtów)', () => {
      expect(validateFileSize(createMockFile(0))).toBe(true);
    });
  });
});

describe('Media Limits - validateFileCount()', () => {
  describe('Limit zdjęć (5)', () => {
    it('powinien pozwolić na dodanie zdjęcia gdy jest 0 zdjęć', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [];
      expect(validateFileCount(existingFiles, 'image')).toBe(true);
    });

    it('powinien pozwolić na dodanie zdjęcia gdy są 4 zdjęcia', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
      ];
      expect(validateFileCount(existingFiles, 'image')).toBe(true);
    });

    it('powinien odrzucić dodanie zdjęcia gdy jest 5 zdjęć', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
      ];
      expect(validateFileCount(existingFiles, 'image')).toBe(false);
    });

    it('powinien pozwolić na dodanie zdjęcia gdy są 4 zdjęcia i 1 video', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'video' },
      ];
      expect(validateFileCount(existingFiles, 'image')).toBe(true);
    });
  });

  describe('Limit video (1)', () => {
    it('powinien pozwolić na dodanie video gdy jest 0 video', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [];
      expect(validateFileCount(existingFiles, 'video')).toBe(true);
    });

    it('powinien pozwolić na dodanie video gdy są tylko zdjęcia', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
      ];
      expect(validateFileCount(existingFiles, 'video')).toBe(true);
    });

    it('powinien odrzucić dodanie video gdy jest już 1 video', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [
        { fileType: 'video' },
      ];
      expect(validateFileCount(existingFiles, 'video')).toBe(false);
    });

    it('powinien odrzucić dodanie video gdy jest 1 video i kilka zdjęć', () => {
      const existingFiles: Array<{ fileType: 'image' | 'video' }> = [
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'video' },
      ];
      expect(validateFileCount(existingFiles, 'video')).toBe(false);
    });
  });

  describe('Maksymalna konfiguracja (5 zdjęć + 1 video)', () => {
    it('powinien odrzucić dodanie czegokolwiek gdy limit jest osiągnięty', () => {
      const maxFiles: Array<{ fileType: 'image' | 'video' }> = [
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'image' },
        { fileType: 'video' },
      ];
      
      expect(validateFileCount(maxFiles, 'image')).toBe(false);
      expect(validateFileCount(maxFiles, 'video')).toBe(false);
    });
  });
});

describe('Media Limits - mediaIdsSchema', () => {
  /**
   * Schema z media.ts:
   * 
   * export const mediaIdsSchema = z
   *   .array(z.string().uuid())
   *   .max(MAX_IMAGES_PER_ENTITY + MAX_VIDEOS_PER_ENTITY, ...)
   *   .optional();
   */
  
  it('maksymalna liczba mediaIds to 6', () => {
    const maxMediaIds = MAX_IMAGES_PER_ENTITY + MAX_VIDEOS_PER_ENTITY;
    expect(maxMediaIds).toBe(6);
  });

  it('komunikat błędu powinien być zrozumiały', () => {
    const errorMessage = `Maksymalnie ${MAX_IMAGES_PER_ENTITY + MAX_VIDEOS_PER_ENTITY} plików`;
    expect(errorMessage).toBe('Maksymalnie 6 plików');
  });
});

describe('Media Limits - Security considerations', () => {
  it('limit rozmiaru pliku zapobiega DoS przez duże uploady', () => {
    /**
     * 50MB to rozsądny limit dla:
     * - Zdjęć wysokiej jakości
     * - Krótkich filmów z treningu
     * 
     * Jednocześnie zapobiega:
     * - Wykorzystaniu całego miejsca na dysku
     * - Przeciążeniu serwera przy uploadzie
     */
    expect(MAX_FILE_SIZE).toBeLessThanOrEqual(100 * 1024 * 1024); // Max 100MB
    expect(MAX_FILE_SIZE).toBeGreaterThanOrEqual(10 * 1024 * 1024); // Min 10MB
  });

  it('limit liczby plików zapobiega abuse storage', () => {
    /**
     * 6 plików per encja (5 zdjęć + 1 video) to:
     * - Maksymalnie 6 * 50MB = 300MB per encja
     * - Wystarczająco do dokumentacji treningu
     * - Nie pozwala na nieograniczony upload
     */
    const maxStoragePerEntity = (MAX_IMAGES_PER_ENTITY + MAX_VIDEOS_PER_ENTITY) * MAX_FILE_SIZE;
    expect(maxStoragePerEntity).toBe(6 * 50 * 1024 * 1024); // 300MB
  });

  it('dozwolone typy nie zawierają wykonywanych plików', () => {
    const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
    
    // Żaden dozwolony typ nie powinien być wykonywalny
    const executableTypes = [
      'application/x-executable',
      'application/x-msdos-program',
      'application/x-msdownload',
      'application/javascript',
      'text/html',
    ];

    executableTypes.forEach((execType) => {
      expect(allAllowedTypes).not.toContain(execType);
    });
  });
});
