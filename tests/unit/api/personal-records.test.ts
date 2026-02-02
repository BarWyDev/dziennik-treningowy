/**
 * Testy API dla endpointów /api/personal-records
 * Pokrywa CRUD operacje na rekordach osobistych + statystyki
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockAPIContext, parseJsonResponse } from '../../helpers';
import { mockAuthenticatedSession, mockUnauthenticatedSession, resetAuthMocks } from '../../helpers';

// Mockowane dane rekordu osobistego
const mockPersonalRecord = {
  id: 'record-1',
  userId: 'user-test-123',
  activityName: 'Wyciskanie sztangi',
  result: '100',
  unit: 'kg',
  date: '2026-01-15',
  notes: 'Nowy rekord!',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('API: /api/personal-records', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('GET /api/personal-records', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca listę rekordów użytkownika', async () => {
      mockAuthenticatedSession();

      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockPersonalRecord]),
              }),
            }),
          }),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
      });

      const response = await GET(ctx as any);

      expect(response.status).toBe(200);
    });

    it('obsługuje sortowanie po dacie', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockPersonalRecord]),
              }),
            }),
          }),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
        searchParams: {
          sortBy: 'date',
          sortOrder: 'desc',
        },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
    });

    it('obsługuje sortowanie po nazwie aktywności', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockPersonalRecord]),
              }),
            }),
          }),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
        searchParams: {
          sortBy: 'activityName',
          sortOrder: 'asc',
        },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
    });

    it('obsługuje sortowanie po wyniku', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([mockPersonalRecord]),
              }),
            }),
          }),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
        searchParams: {
          sortBy: 'result',
          sortOrder: 'desc',
        },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/personal-records', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { POST } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
        method: 'POST',
        body: {},
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 dla nieprawidłowych danych', async () => {
      mockAuthenticatedSession();
      
      const { POST } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
        method: 'POST',
        body: {
          // Brak wymaganych pól
          notes: 'Notatka',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
      const data = await parseJsonResponse(response);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('tworzy rekord osobisty z poprawnymi danymi', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { ...mockPersonalRecord, id: 'new-record' }
          ]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
        method: 'POST',
        body: {
          activityName: 'Wyciskanie sztangi',
          result: '100',
          unit: 'kg',
          date: '2026-01-15',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(201);
    });

    it('waliduje wymagane pole activityName', async () => {
      mockAuthenticatedSession();
      
      const { POST } = await import('@/pages/api/personal-records/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records',
        method: 'POST',
        body: {
          result: '100',
          unit: 'kg',
          date: '2026-01-15',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
    });

    // Test przypisywania media wymaga złożonego mockowania
  });
});

describe('API: /api/personal-records/[id]', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('GET /api/personal-records/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/record-1',
        params: { id: 'record-1' },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 gdy brak ID', async () => {
      mockAuthenticatedSession();
      
      const { GET } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/',
        params: {},
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(400);
    });

    it('zwraca 404 gdy rekord nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/non-existent',
        params: { id: 'non-existent' },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('zwraca szczegóły rekordu z media', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockPersonalRecord]),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 'media-1', fileType: 'image' }
          ]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/record-1',
        params: { id: 'record-1' },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/personal-records/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { PUT } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/record-1',
        method: 'PUT',
        params: { id: 'record-1' },
        body: {},
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 404 gdy rekord nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/non-existent',
        method: 'PUT',
        params: { id: 'non-existent' },
        body: { result: '110' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('aktualizuje rekord z poprawnymi danymi', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockPersonalRecord]),
        }),
      } as any);
      
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { ...mockPersonalRecord, result: '110' }
            ]),
          }),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/record-1',
        method: 'PUT',
        params: { id: 'record-1' },
        body: { result: '110' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(200);
    });

    it('nie pozwala na edycję rekordu innego użytkownika', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      // Zwraca pusty wynik bo warunek userId nie pasuje
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/other-user-record',
        method: 'PUT',
        params: { id: 'other-user-record' },
        body: { result: '110' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/personal-records/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/record-1',
        method: 'DELETE',
        params: { id: 'record-1' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 404 gdy rekord nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { DELETE } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/non-existent',
        method: 'DELETE',
        params: { id: 'non-existent' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('usuwa rekord i powiązane media', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      const { storage } = await import('@/lib/storage');
      
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockPersonalRecord]),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { id: 'media-1', fileUrl: '/uploads/file1.jpg' }
          ]),
        }),
      } as any);
      
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      vi.mocked(storage.deleteFile).mockResolvedValue(undefined);

      const { DELETE } = await import('@/pages/api/personal-records/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/record-1',
        method: 'DELETE',
        params: { id: 'record-1' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(200);
      expect(storage.deleteFile).toHaveBeenCalled();
    });
  });
});

describe('API: /api/personal-records/stats', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('GET /api/personal-records/stats', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/personal-records/stats');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/stats',
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca statystyki rekordów', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 10 }]),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockPersonalRecord]),
            }),
          }),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/stats');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/stats',
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
      const data = await parseJsonResponse(response);
      expect(data).toHaveProperty('totalCount');
      expect(data).toHaveProperty('lastRecord');
    });

    it('zwraca null dla lastRecord gdy brak rekordów', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      const { GET } = await import('@/pages/api/personal-records/stats');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/personal-records/stats',
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
      const data = await parseJsonResponse(response);
      expect(data.totalCount).toBe(0);
      expect(data.lastRecord).toBeNull();
    });
  });
});
