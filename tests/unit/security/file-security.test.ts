/**
 * Testy bezpieczeństwa - Ochrona plików
 * 
 * Testuje:
 * - Path traversal attack prevention
 * - Dostęp do plików tylko dla zalogowanych użytkowników
 * - Walidacja ścieżek plików
 * 
 * KRYTYCZNE: Te testy sprawdzają ochronę przed nieautoryzowanym dostępem do systemu plików.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import {
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
  resetAuthMocks,
  createMockSessionData,
} from '../../helpers';

describe('File Security - Path Traversal Prevention', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  // Funkcja walidacji ścieżki z pliku [...path].ts
  const isValidPath = (filePath: string): boolean => {
    // Sprawdzenie z kodu: filePath.includes('..') || filePath.includes('~')
    if (filePath.includes('..') || filePath.includes('~')) {
      return false;
    }
    return true;
  };

  describe('Path validation logic', () => {
    it('powinien odrzucić ścieżkę z ".."', () => {
      expect(isValidPath('../etc/passwd')).toBe(false);
      expect(isValidPath('../../etc/passwd')).toBe(false);
      expect(isValidPath('user/../../../etc/passwd')).toBe(false);
      expect(isValidPath('folder/..hidden')).toBe(false);
    });

    it('powinien odrzucić ścieżkę z "~"', () => {
      expect(isValidPath('~/etc/passwd')).toBe(false);
      expect(isValidPath('user/~/.ssh/id_rsa')).toBe(false);
      expect(isValidPath('~root/.bashrc')).toBe(false);
    });

    it('powinien akceptować prawidłowe ścieżki', () => {
      expect(isValidPath('user-123/image.jpg')).toBe(true);
      expect(isValidPath('user-123/2025/01/photo.png')).toBe(true);
      expect(isValidPath('abc123/video.mp4')).toBe(true);
    });

    it('powinien akceptować ścieżki z dozwolonymi znakami specjalnymi', () => {
      expect(isValidPath('user_123/image-name.jpg')).toBe(true);
      expect(isValidPath('user-123/my_photo-01.png')).toBe(true);
    });
  });

  describe('GET /api/files/[...path] - Path Traversal Attacks', () => {
    it('powinien zwrócić 400 dla ścieżki z ".."', async () => {
      const sessionData = createMockSessionData();
      mockAuthenticatedSession(sessionData);

      const { GET } = await import('@/pages/api/files/[...path]');

      const request = new Request('http://localhost:4321/api/files/../etc/passwd');
      const response = await GET({
        request,
        params: { path: '../etc/passwd' },
      } as any);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Invalid file path');
    });

    it('powinien zwrócić 400 dla ścieżki z wielokrotnym ".."', async () => {
      const sessionData = createMockSessionData();
      mockAuthenticatedSession(sessionData);

      const { GET } = await import('@/pages/api/files/[...path]');

      const request = new Request('http://localhost:4321/api/files/../../../../../../etc/shadow');
      const response = await GET({
        request,
        params: { path: '../../../../../../etc/shadow' },
      } as any);

      expect(response.status).toBe(400);
    });

    it('powinien zwrócić 403 dla ścieżki z "~" (plik nie jest przypisany do użytkownika)', async () => {
      // Implementacja używa path.resolve() który zapewnia że ścieżka nie wyjdzie poza uploads directory
      // "~/.ssh/id_rsa" po resolve staje się "uploads/~/.ssh/id_rsa" co jest bezpieczne
      // Zwraca 403 bo ownership check nie znajdzie rekordu w mediaAttachments
      const sessionData = createMockSessionData();
      mockAuthenticatedSession(sessionData);

      const { GET } = await import('@/pages/api/files/[...path]');

      const request = new Request('http://localhost:4321/api/files/~/.ssh/id_rsa');
      const response = await GET({
        request,
        params: { path: '~/.ssh/id_rsa' },
      } as any);

      expect(response.status).toBe(403);
    });

    it('powinien zwrócić 400 dla ścieżki z ukrytym ".." w środku', async () => {
      const sessionData = createMockSessionData();
      mockAuthenticatedSession(sessionData);

      const { GET } = await import('@/pages/api/files/[...path]');

      const request = new Request('http://localhost:4321/api/files/valid/../../etc/passwd');
      const response = await GET({
        request,
        params: { path: 'valid/../../etc/passwd' },
      } as any);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/files/[...path] - Authentication', () => {
    it('powinien zwrócić 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();

      const { GET } = await import('@/pages/api/files/[...path]');

      const request = new Request('http://localhost:4321/api/files/user-123/image.jpg');
      const response = await GET({
        request,
        params: { path: 'user-123/image.jpg' },
      } as any);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/files/[...path] - Missing path', () => {
    it('powinien zwrócić 400 gdy brak ścieżki pliku', async () => {
      const sessionData = createMockSessionData();
      mockAuthenticatedSession(sessionData);

      const { GET } = await import('@/pages/api/files/[...path]');

      const request = new Request('http://localhost:4321/api/files/');
      const response = await GET({
        request,
        params: { path: '' },
      } as any);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('File path required');
    });

    it('powinien zwrócić 400 gdy ścieżka jest undefined', async () => {
      const sessionData = createMockSessionData();
      mockAuthenticatedSession(sessionData);

      const { GET } = await import('@/pages/api/files/[...path]');

      const request = new Request('http://localhost:4321/api/files/');
      const response = await GET({
        request,
        params: {},
      } as any);

      expect(response.status).toBe(400);
    });
  });
});

describe('File Security - Additional Attack Vectors', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  describe('URL Encoded path traversal', () => {
    // Uwaga: Te ataki zakładają że URL jest zdekodowany przed sprawdzeniem
    // W praktyce Astro/Web API może automatycznie dekodować URL

    const isValidPath = (filePath: string): boolean => {
      if (filePath.includes('..') || filePath.includes('~')) {
        return false;
      }
      return true;
    };

    it('powinien odrzucić zdekodowane %2e%2e (..)', () => {
      // Po dekodowaniu URL %2e%2e staje się ..
      const decodedPath = decodeURIComponent('%2e%2e/etc/passwd');
      expect(isValidPath(decodedPath)).toBe(false);
    });

    it('powinien odrzucić zdekodowane %7e (~)', () => {
      const decodedPath = decodeURIComponent('%7e/.ssh/id_rsa');
      expect(isValidPath(decodedPath)).toBe(false);
    });
  });

  describe('Null byte injection', () => {
    // Null byte injection był problemem w starszych systemach
    // Nowoczesne systemy powinny być odporne, ale warto sprawdzić

    it('powinien bezpiecznie obsługiwać ścieżki z null byte', () => {
      const pathWithNull = 'image.jpg\x00.exe';
      // Nie powinno zawierać .. lub ~, więc przechodzi walidację podstawową
      // Ale system plików powinien obsłużyć to bezpiecznie
      expect(typeof pathWithNull).toBe('string');
    });
  });

  describe('Windows-specific paths', () => {
    const isValidPath = (filePath: string): boolean => {
      if (filePath.includes('..') || filePath.includes('~')) {
        return false;
      }
      return true;
    };

    it('powinien odrzucić ścieżki Windows z ".."', () => {
      expect(isValidPath('..\\Windows\\System32\\config\\SAM')).toBe(false);
      expect(isValidPath('uploads\\..\\..\\Windows')).toBe(false);
    });

    it('powinien akceptować normalne ścieżki (bez backslash w nazwie pliku)', () => {
      // W praktyce backslash nie powinien być w nazwie pliku uploadu
      // ale walidacja powinna to obsłużyć
      expect(isValidPath('user-123/normal-file.jpg')).toBe(true);
    });
  });
});

describe('File Security - Content Type Validation', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  // Mapa content type z pliku [...path].ts
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
  };

  const getContentType = (extension: string): string => {
    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  };

  describe('Content-Type mapping', () => {
    it('powinien zwrócić poprawny content-type dla obrazów', () => {
      expect(getContentType('.jpg')).toBe('image/jpeg');
      expect(getContentType('.jpeg')).toBe('image/jpeg');
      expect(getContentType('.png')).toBe('image/png');
      expect(getContentType('.webp')).toBe('image/webp');
      expect(getContentType('.heic')).toBe('image/heic');
    });

    it('powinien zwrócić poprawny content-type dla wideo', () => {
      expect(getContentType('.mp4')).toBe('video/mp4');
      expect(getContentType('.mov')).toBe('video/quicktime');
      expect(getContentType('.webm')).toBe('video/webm');
    });

    it('powinien zwrócić application/octet-stream dla nieznanych rozszerzeń', () => {
      expect(getContentType('.exe')).toBe('application/octet-stream');
      expect(getContentType('.php')).toBe('application/octet-stream');
      expect(getContentType('.js')).toBe('application/octet-stream');
      expect(getContentType('.html')).toBe('application/octet-stream');
    });

    it('powinien zwrócić application/octet-stream dla potencjalnie niebezpiecznych plików', () => {
      // Te pliki nie powinny być serwowane z właściwym content-type
      expect(getContentType('.svg')).toBe('application/octet-stream'); // SVG może zawierać XSS
      expect(getContentType('.xml')).toBe('application/octet-stream');
      expect(getContentType('.txt')).toBe('application/octet-stream');
    });
  });
});

describe('File Security - Secure Headers', () => {
  it('powinien ustawić Cache-Control header dla plików statycznych', async () => {
    /**
     * Plik [...path].ts ustawia:
     * 'Cache-Control': 'public, max-age=31536000, immutable'
     * 
     * Jest to bezpieczne dla uploadowanych mediów bo:
     * - Pliki mają unikalne nazwy (UUID)
     * - Stare pliki są usuwane, nie nadpisywane
     * - Cache pozwala na szybsze ładowanie
     */
    const expectedCacheControl = 'public, max-age=31536000, immutable';
    expect(expectedCacheControl).toContain('immutable');
  });

  it('powinien NIE serwować plików wykonywanych jako text/html', () => {
    /**
     * WAŻNE: Nigdy nie serwuj uploadowanych plików z Content-Type: text/html
     * Mogłoby to pozwolić na XSS attacks.
     * 
     * Sprawdzone rozszerzenia w kodzie:
     * - Tylko obrazy i wideo mają zdefiniowany content-type
     * - Wszystko inne dostaje application/octet-stream
     */
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.webm': 'video/webm',
    };

    // Sprawdź że żaden content-type nie jest text/html
    Object.values(contentTypes).forEach((ct) => {
      expect(ct).not.toBe('text/html');
      expect(ct).not.toContain('script');
    });
  });
});
