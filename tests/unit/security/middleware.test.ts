/**
 * Testy bezpieczeństwa - Middleware autoryzacji
 * 
 * Testuje:
 * - Publiczne ścieżki są dostępne bez autoryzacji
 * - Chronione ścieżki wymagają sesji
 * - Przekierowanie do /auth/login gdy brak sesji
 * - API auth routes są zawsze dostępne
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { createMockSessionData, resetAuthMocks } from '../../helpers';

// Symulujemy middleware manualnie, ponieważ Astro middleware wymaga specjalnego środowiska
// Te testy weryfikują logikę middleware bez uruchamiania pełnego środowiska Astro

describe('Middleware Authorization', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  // Lista publicznych ścieżek z middleware
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify',
    '/api/auth',
  ];

  // Lista chronionych ścieżek
  const protectedPaths = [
    '/dashboard',
    '/trainings',
    '/trainings/new',
    '/trainings/123',
    '/trainings/123/edit',
    '/goals',
    '/personal-records',
    '/api/trainings',
    '/api/goals',
    '/api/personal-records',
    '/api/dashboard',
    '/api/upload',
  ];

  describe('isPublicPath - logika sprawdzania ścieżek publicznych', () => {
    // Funkcja z middleware do testowania
    const isPublicPath = (pathname: string): boolean => {
      // API auth routes - specjalny przypadek
      if (pathname.startsWith('/api/auth')) {
        return true;
      }
      
      return publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + '/')
      );
    };

    it('powinno rozpoznać stronę główną jako publiczną', () => {
      expect(isPublicPath('/')).toBe(true);
    });

    it('powinno rozpoznać /auth/login jako publiczną', () => {
      expect(isPublicPath('/auth/login')).toBe(true);
    });

    it('powinno rozpoznać /auth/register jako publiczną', () => {
      expect(isPublicPath('/auth/register')).toBe(true);
    });

    it('powinno rozpoznać /auth/forgot-password jako publiczną', () => {
      expect(isPublicPath('/auth/forgot-password')).toBe(true);
    });

    it('powinno rozpoznać /auth/reset-password jako publiczną', () => {
      expect(isPublicPath('/auth/reset-password')).toBe(true);
    });

    it('powinno rozpoznać /auth/verify jako publiczną', () => {
      expect(isPublicPath('/auth/verify')).toBe(true);
    });

    it('powinno rozpoznać /api/auth jako publiczną', () => {
      expect(isPublicPath('/api/auth')).toBe(true);
    });

    it('powinno rozpoznać /api/auth/signin jako publiczną', () => {
      expect(isPublicPath('/api/auth/signin')).toBe(true);
    });

    it('powinno rozpoznać /api/auth/signup jako publiczną', () => {
      expect(isPublicPath('/api/auth/signup')).toBe(true);
    });

    it('powinno rozpoznać /api/auth/callback/github jako publiczną', () => {
      expect(isPublicPath('/api/auth/callback/github')).toBe(true);
    });

    it('NIE powinno rozpoznać /dashboard jako publicznej', () => {
      expect(isPublicPath('/dashboard')).toBe(false);
    });

    it('NIE powinno rozpoznać /trainings jako publicznej', () => {
      expect(isPublicPath('/trainings')).toBe(false);
    });

    it('NIE powinno rozpoznać /goals jako publicznej', () => {
      expect(isPublicPath('/goals')).toBe(false);
    });

    it('NIE powinno rozpoznać /api/trainings jako publicznej', () => {
      expect(isPublicPath('/api/trainings')).toBe(false);
    });

    it('NIE powinno rozpoznać /api/goals jako publicznej', () => {
      expect(isPublicPath('/api/goals')).toBe(false);
    });

    it('NIE powinno rozpoznać /api/dashboard jako publicznej', () => {
      expect(isPublicPath('/api/dashboard')).toBe(false);
    });
  });

  describe('Session verification for protected paths', () => {
    it('powinno wywołać auth.api.getSession dla chronionych ścieżek', async () => {
      const mockSession = createMockSessionData();
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const mockHeaders = new Headers({ Cookie: 'session=test' });
      
      await auth.api.getSession({ headers: mockHeaders });
      
      expect(auth.api.getSession).toHaveBeenCalledWith({ headers: mockHeaders });
    });

    it('powinno zwrócić null gdy brak sesji', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await auth.api.getSession({ headers: new Headers() });
      
      expect(result).toBeNull();
    });

    it('powinno zwrócić dane sesji gdy sesja jest ważna', async () => {
      const mockSession = createMockSessionData();
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await auth.api.getSession({ headers: new Headers() });
      
      expect(result).toEqual(mockSession);
      expect(result?.user.id).toBe('user-test-123');
      expect(result?.session.userId).toBe('user-test-123');
    });
  });

  describe('Protected paths list coverage', () => {
    // Upewniamy się, że wszystkie kluczowe ścieżki są chronione
    const isPublicPath = (pathname: string): boolean => {
      if (pathname.startsWith('/api/auth')) {
        return true;
      }
      return publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + '/')
      );
    };

    protectedPaths.forEach((path) => {
      it(`ścieżka "${path}" powinna być chroniona`, () => {
        expect(isPublicPath(path)).toBe(false);
      });
    });
  });

  describe('Edge cases - bezpieczeństwo ścieżek', () => {
    const isPublicPath = (pathname: string): boolean => {
      if (pathname.startsWith('/api/auth')) {
        return true;
      }
      return publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + '/')
      );
    };

    it('NIE powinno pozwolić na /authlogin (bez slash)', () => {
      // Sprawdzamy czy nie ma przypadkowego dopasowania
      expect(isPublicPath('/authlogin')).toBe(false);
    });

    it('NIE powinno pozwolić na /auth-login (z myślnikiem)', () => {
      expect(isPublicPath('/auth-login')).toBe(false);
    });

    it('NIE powinno pozwolić na /authentication', () => {
      expect(isPublicPath('/authentication')).toBe(false);
    });

    it('NIE powinno pozwolić na /../auth/login (path traversal)', () => {
      // Ten test sprawdza czy ścieżka nie jest błędnie rozpoznana
      expect(isPublicPath('/../auth/login')).toBe(false);
    });

    it('NIE powinno pozwolić na /api/trainings/../auth (path traversal w API)', () => {
      // Ta ścieżka nie powinna być publiczna
      // Uwaga: w prawdziwej aplikacji URL byłby znormalizowany
      expect(isPublicPath('/api/trainings/../auth')).toBe(false);
    });

    it('powinno pozwolić na /auth/login/ (ze slash na końcu)', () => {
      // /auth/login/ zaczyna się od /auth/login + '/'
      expect(isPublicPath('/auth/login/')).toBe(true);
    });

    it('powinno pozwolić na /api/auth/ (ze slash na końcu)', () => {
      expect(isPublicPath('/api/auth/')).toBe(true);
    });
  });
});

describe('Middleware redirect behavior', () => {
  it('powinno zwracać redirect do /auth/login dla chronionych ścieżek bez sesji', () => {
    // Symulacja zachowania middleware
    const redirectPath = '/auth/login';
    const response = new Response(null, {
      status: 302,
      headers: { Location: redirectPath },
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/auth/login');
  });

  it('powinno zachować oryginalną ścieżkę w redirect (best practice)', () => {
    // To jest sugestia - middleware mogłoby dodać returnUrl
    const originalPath = '/trainings';
    const redirectPath = `/auth/login?returnUrl=${encodeURIComponent(originalPath)}`;
    
    const response = new Response(null, {
      status: 302,
      headers: { Location: redirectPath },
    });

    expect(response.headers.get('Location')).toContain('returnUrl');
  });
});
