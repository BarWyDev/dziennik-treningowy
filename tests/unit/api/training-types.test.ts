/**
 * Testy API dla endpointów /api/training-types
 * Pokrywa CRUD operacje na typach treningów
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockAPIContext, parseJsonResponse } from '../../helpers';
import { mockAuthenticatedSession, mockUnauthenticatedSession, resetAuthMocks } from '../../helpers';

// Mockowane dane typu treningu
const mockDefaultTrainingType = {
  id: 'type-default-1',
  name: 'Siłowy',
  description: 'Trening siłowy',
  icon: '💪',
  isDefault: true,
  userId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCustomTrainingType = {
  id: 'type-custom-1',
  name: 'Mój trening',
  description: 'Mój własny trening',
  icon: '🏋️',
  isDefault: false,
  userId: 'user-test-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('API: /api/training-types', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('GET /api/training-types', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/training-types/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types',
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca typy domyślne i własne użytkownika', async () => {
      mockAuthenticatedSession();

      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([
                  mockDefaultTrainingType,
                  mockCustomTrainingType,
                ]),
              }),
            }),
          }),
        }),
      } as any);

      const { GET } = await import('@/pages/api/training-types/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types',
      });

      const response = await GET(ctx as any);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/training-types', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { POST } = await import('@/pages/api/training-types/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types',
        method: 'POST',
        body: {},
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 dla nieprawidłowych danych', async () => {
      mockAuthenticatedSession();
      
      const { POST } = await import('@/pages/api/training-types/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types',
        method: 'POST',
        body: {
          // Brak wymaganego pola name
          description: 'Opis',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
      const data = await parseJsonResponse(response);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('tworzy własny typ treningu', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { ...mockCustomTrainingType, id: 'new-type' }
          ]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/training-types/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types',
        method: 'POST',
        body: {
          name: 'Mój trening',
          description: 'Mój własny trening',
          icon: '🏋️',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(201);
    });

    it('waliduje minimalną długość nazwy', async () => {
      mockAuthenticatedSession();
      
      const { POST } = await import('@/pages/api/training-types/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types',
        method: 'POST',
        body: {
          name: 'A', // Za krótka (min 2)
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
    });

    it('waliduje maksymalną długość nazwy', async () => {
      mockAuthenticatedSession();
      
      const { POST } = await import('@/pages/api/training-types/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types',
        method: 'POST',
        body: {
          name: 'A'.repeat(101), // Za długa (max 100)
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
    });
  });
});

describe('API: /api/training-types/[id]', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('PUT /api/training-types/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { PUT } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/type-1',
        method: 'PUT',
        params: { id: 'type-1' },
        body: {},
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 gdy brak ID', async () => {
      mockAuthenticatedSession();
      
      const { PUT } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/',
        method: 'PUT',
        params: {},
        body: { name: 'Nowa nazwa' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(400);
    });

    it('zwraca 404 gdy typ nie istnieje lub jest domyślny', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/type-default-1',
        method: 'PUT',
        params: { id: 'type-default-1' },
        body: { name: 'Nowa nazwa' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(404);
      const data = await parseJsonResponse(response);
      expect(data.error.code).toBe('TRAINING_TYPE_NOT_FOUND');
    });

    it('nie pozwala na edycję typu domyślnego', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      // Zapytanie z warunkiem isDefault=false zwraca pusty wynik
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/type-default-1',
        method: 'PUT',
        params: { id: 'type-default-1' },
        body: { name: 'Zmieniona nazwa' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('aktualizuje własny typ treningu', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockCustomTrainingType]),
        }),
      } as any);
      
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { ...mockCustomTrainingType, name: 'Zaktualizowana nazwa' }
            ]),
          }),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/type-custom-1',
        method: 'PUT',
        params: { id: 'type-custom-1' },
        body: { name: 'Zaktualizowana nazwa' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(200);
    });

    it('nie pozwala na edycję typu innego użytkownika', async () => {
      mockAuthenticatedSession();

      const { db } = await import('@/lib/db');
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/other-user-type',
        method: 'PUT',
        params: { id: 'other-user-type' },
        body: { name: 'Nowa nazwa' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/training-types/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/type-1',
        method: 'DELETE',
        params: { id: 'type-1' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 gdy brak ID', async () => {
      mockAuthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/',
        method: 'DELETE',
        params: {},
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(400);
    });

    it('nie pozwala na usunięcie typu domyślnego', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { DELETE } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/type-default-1',
        method: 'DELETE',
        params: { id: 'type-default-1' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(404);
      const data = await parseJsonResponse(response);
      expect(data.error.code).toBe('TRAINING_TYPE_NOT_FOUND');
    });

    it('usuwa własny typ treningu', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockCustomTrainingType]),
        }),
      } as any);
      
      vi.mocked(db.delete).mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'type-custom-1' }]),
        }),
      } as any);

      const { DELETE } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/type-custom-1',
        method: 'DELETE',
        params: { id: 'type-custom-1' },
      });

      const response = await DELETE(ctx as any);

      expect(response.status).toBe(200);
    });

    it('nie pozwala na usunięcie typu innego użytkownika', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { DELETE } = await import('@/pages/api/training-types/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/training-types/other-user-type',
        method: 'DELETE',
        params: { id: 'other-user-type' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(404);
    });
  });
});
