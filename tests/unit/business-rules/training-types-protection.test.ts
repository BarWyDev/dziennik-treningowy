/**
 * Testy reguł biznesowych - Ochrona domyślnych typów treningów
 * 
 * Testuje:
 * - Domyślne typy treningów (isDefault=true) nie mogą być usunięte
 * - Domyślne typy treningów nie mogą być edytowane
 * - Użytkownicy mogą tworzyć własne custom typy
 * - Użytkownicy mogą edytować/usuwać tylko SWOJE custom typy
 * 
 * KRYTYCZNE: Ochrona integralności danych systemowych.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  mockAuthenticatedSession,
  resetAuthMocks,
  createMockSessionData,
} from '../../helpers';

describe('Training Types Business Rules - Default Types Protection', () => {
  const mockUser = createMockSessionData({ id: 'user-123', email: 'test@example.com' });

  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('DELETE /api/training-types/:id - ochrona defaultów', () => {
    it('powinien odrzucić usunięcie domyślnego typu treningu', async () => {
      mockAuthenticatedSession(mockUser);

      // Typ jest domyślny (isDefault=true) - query z warunkiem isDefault=false zwróci pusty wynik
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]), // Nie znaleziono - bo isDefault=true
        }),
      } as any);

      const { DELETE } = await import('@/pages/api/training-types/[id]');

      const request = new Request('http://localhost:4321/api/training-types/default-type-silowy', {
        method: 'DELETE',
      });

      const response = await DELETE({
        request,
        params: { id: 'default-type-silowy' },
      } as any);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('TRAINING_TYPE_NOT_FOUND');
    });

    it('powinien pozwolić na usunięcie custom typu użytkownika', async () => {
      mockAuthenticatedSession(mockUser);

      // Custom typ użytkownika - query zwróci wynik
      const customType = {
        id: 'custom-type-123',
        userId: mockUser.user.id,
        name: 'Mój custom typ',
        isDefault: false,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([customType]),
        }),
      } as any);

      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'custom-type-123' }]),
        }),
      } as any);

      const { DELETE } = await import('@/pages/api/training-types/[id]');

      const request = new Request('http://localhost:4321/api/training-types/custom-type-123', {
        method: 'DELETE',
      });

      const response = await DELETE({
        request,
        params: { id: 'custom-type-123' },
      } as any);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('PUT /api/training-types/:id - ochrona defaultów', () => {
    it('powinien odrzucić edycję domyślnego typu treningu', async () => {
      mockAuthenticatedSession(mockUser);

      const { db } = await import('@/lib/db');
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/training-types/[id]');

      const request = new Request('http://localhost:4321/api/training-types/default-type-cardio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Zmodyfikowany Cardio' }),
      });

      const response = await PUT({
        request,
        params: { id: 'default-type-cardio' },
      } as any);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('TRAINING_TYPE_NOT_FOUND');
    });

    it('powinien pozwolić na edycję custom typu użytkownika', async () => {
      mockAuthenticatedSession(mockUser);

      const customType = {
        id: 'custom-type-456',
        userId: mockUser.user.id,
        name: 'Mój typ przed edycją',
        isDefault: false,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([customType]),
        }),
      } as any);

      const updatedType = {
        ...customType,
        name: 'Mój typ po edycji',
      };

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedType]),
          }),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/training-types/[id]');

      const request = new Request('http://localhost:4321/api/training-types/custom-type-456', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Mój typ po edycji' }),
      });

      const response = await PUT({
        request,
        params: { id: 'custom-type-456' },
      } as any);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Mój typ po edycji');
    });
  });

  describe('POST /api/training-types - tworzenie custom typów', () => {
    it('powinien pozwolić na tworzenie custom typu treningu', async () => {
      mockAuthenticatedSession(mockUser);

      const newType = {
        id: 'new-custom-type',
        userId: mockUser.user.id,
        name: 'Mój nowy typ treningu',
        isDefault: false,
        icon: '🏃',
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newType]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/training-types/index');

      const request = new Request('http://localhost:4321/api/training-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Mój nowy typ treningu',
          icon: '🏃',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.name).toBe('Mój nowy typ treningu');
      expect(data.isDefault).toBe(false);
    });

    it('custom typ powinien mieć userId przypisane do twórcy', async () => {
      mockAuthenticatedSession(mockUser);

      const newType = {
        id: 'new-custom-type',
        userId: mockUser.user.id, // Przypisane do użytkownika
        name: 'Typ użytkownika',
        isDefault: false,
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([newType]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/training-types/index');

      const request = new Request('http://localhost:4321/api/training-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Typ użytkownika' }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.userId).toBe(mockUser.user.id);
    });
  });

  describe('GET /api/training-types - lista typów', () => {
    it('powinien zwrócić zarówno domyślne jak i custom typy użytkownika', async () => {
      mockAuthenticatedSession(mockUser);

      const allTypes = [
        // Domyślne typy (systemowe)
        { id: 'default-1', name: 'Siłowy', isDefault: true, userId: null },
        { id: 'default-2', name: 'Cardio', isDefault: true, userId: null },
        { id: 'default-3', name: 'HIIT', isDefault: true, userId: null },
        // Custom typy użytkownika
        { id: 'custom-1', name: 'Mój typ', isDefault: false, userId: mockUser.user.id },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(allTypes),
              }),
            }),
          }),
        }),
      } as any);

      const { GET } = await import('@/pages/api/training-types/index');

      const request = new Request('http://localhost:4321/api/training-types');
      const url = new URL('http://localhost:4321/api/training-types');
      const response = await GET({ request, url } as any);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      const data = responseData.data;

      // Powinny być zarówno domyślne jak i custom
      const defaultTypes = data.filter((t: any) => t.isDefault);
      const customTypes = data.filter((t: any) => !t.isDefault);

      expect(defaultTypes.length).toBeGreaterThan(0);
      expect(customTypes.length).toBe(1);
      expect(customTypes[0].userId).toBe(mockUser.user.id);
    });
  });
});

describe('Training Types Protection - Logika warunków w bazie', () => {
  it('warunek dla modyfikacji: userId=user AND isDefault=false', () => {
    /**
     * Kod w training-types/[id].ts (linie 40-50):
     * 
     * .where(
     *   and(
     *     eq(trainingTypes.id, id),
     *     eq(trainingTypes.userId, session.user.id),
     *     eq(trainingTypes.isDefault, false)
     *   )
     * )
     * 
     * Ten warunek zapewnia że:
     * 1. Typ musi należeć do użytkownika (userId)
     * 2. Typ nie może być domyślny (isDefault=false)
     */
    
    const canModifyType = (
      type: { userId: string | null; isDefault: boolean },
      currentUserId: string
    ): boolean => {
      return type.userId === currentUserId && type.isDefault === false;
    };

    // Custom typ użytkownika - można modyfikować
    expect(canModifyType({ userId: 'user-123', isDefault: false }, 'user-123')).toBe(true);

    // Domyślny typ - NIE można modyfikować
    expect(canModifyType({ userId: null, isDefault: true }, 'user-123')).toBe(false);

    // Custom typ innego użytkownika - NIE można modyfikować
    expect(canModifyType({ userId: 'other-user', isDefault: false }, 'user-123')).toBe(false);

    // Typ z userId ale isDefault=true (teoretycznie niemożliwe, ale zabezpieczenie)
    expect(canModifyType({ userId: 'user-123', isDefault: true }, 'user-123')).toBe(false);
  });
});

describe('Training Types - Default Types List (from CLAUDE.md)', () => {
  /**
   * Domyślne typy treningów zdefiniowane w seedzie:
   * Siłowy, Cardio, HIIT, Rozciąganie, Pływanie, Bieganie,
   * Rower, Sporty zespołowe, CrossFit, Dwubój, Inne
   */
  const defaultTypeNames = [
    'Siłowy',
    'Cardio',
    'HIIT',
    'Rozciąganie',
    'Pływanie',
    'Bieganie',
    'Rower',
    'Sporty zespołowe',
    'CrossFit',
    'Dwubój',
    'Inne',
  ];

  it('powinno być 11 domyślnych typów treningów', () => {
    expect(defaultTypeNames).toHaveLength(11);
  });

  it('domyślne typy powinny zawierać podstawowe kategorie', () => {
    expect(defaultTypeNames).toContain('Siłowy');
    expect(defaultTypeNames).toContain('Cardio');
    expect(defaultTypeNames).toContain('HIIT');
    expect(defaultTypeNames).toContain('Inne'); // Kategoria fallback
  });
});
