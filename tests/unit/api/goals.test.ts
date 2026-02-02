/**
 * Testy API dla endpointów /api/goals
 * Pokrywa CRUD operacje na celach + achieve/archive
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockAPIContext, parseJsonResponse } from '../../helpers';
import { mockAuthenticatedSession, mockUnauthenticatedSession, resetAuthMocks } from '../../helpers';

// Mockowane dane celu
const mockGoal = {
  id: 'goal-1',
  userId: 'user-test-123',
  title: 'Przebiec maraton',
  description: 'Mój pierwszy maraton',
  targetValue: 42,
  currentValue: 10,
  unit: 'km',
  deadline: '2026-06-01',
  status: 'active',
  isArchived: false,
  achievedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('API: /api/goals', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('GET /api/goals', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/goals/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals',
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca listę celów użytkownika', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockGoal]),
          }),
        }),
      } as any);

      const { GET } = await import('@/pages/api/goals/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals',
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/goals', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { POST } = await import('@/pages/api/goals/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals',
        method: 'POST',
        body: {},
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 gdy przekroczono limit 5 aktywnych celów', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals',
        method: 'POST',
        body: {
          title: 'Nowy cel',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
      const data = await parseJsonResponse(response);
      expect(data.error.code).toBe('GOAL_LIMIT_EXCEEDED');
    });

    it('zwraca 400 dla nieprawidłowych danych', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals',
        method: 'POST',
        body: {
          // Brak wymaganego pola title
          description: 'Opis',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
      const data = await parseJsonResponse(response);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('tworzy cel z poprawnymi danymi', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as any);
      
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...mockGoal, id: 'new-goal' }]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals',
        method: 'POST',
        body: {
          title: 'Przebiec maraton',
          description: 'Mój pierwszy maraton',
          targetValue: 42,
          unit: 'km',
          deadline: '2026-06-01',
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(201);
    });

    it('waliduje minimalną długość tytułu', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals',
        method: 'POST',
        body: {
          title: 'AB', // Za krótki (min 3)
        },
      });
      
      const response = await POST(ctx as any);
      
      expect(response.status).toBe(400);
    });
  });
});

describe('API: /api/goals/[id]', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('GET /api/goals/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1',
        params: { id: 'goal-1' },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 gdy brak ID', async () => {
      mockAuthenticatedSession();
      
      const { GET } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/',
        params: {},
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(400);
    });

    it('zwraca 404 gdy cel nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/non-existent',
        params: { id: 'non-existent' },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('zwraca szczegóły celu', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockGoal]),
        }),
      } as any);

      const { GET } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1',
        params: { id: 'goal-1' },
      });
      
      const response = await GET(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { PUT } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1',
        method: 'PUT',
        params: { id: 'goal-1' },
        body: {},
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 404 gdy cel nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/non-existent',
        method: 'PUT',
        params: { id: 'non-existent' },
        body: { title: 'Nowy tytuł' },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('aktualizuje cel z poprawnymi danymi', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockGoal]),
        }),
      } as any);
      
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockGoal, currentValue: 20 }]),
          }),
        }),
      } as any);

      const { PUT } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1',
        method: 'PUT',
        params: { id: 'goal-1' },
        body: { currentValue: 20 },
      });
      
      const response = await PUT(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1',
        method: 'DELETE',
        params: { id: 'goal-1' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 404 gdy cel nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { DELETE } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/non-existent',
        method: 'DELETE',
        params: { id: 'non-existent' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('usuwa cel', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockGoal]),
        }),
      } as any);
      
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const { DELETE } = await import('@/pages/api/goals/[id]');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1',
        method: 'DELETE',
        params: { id: 'goal-1' },
      });
      
      const response = await DELETE(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });
});

describe('API: /api/goals/[id]/achieve', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('PATCH /api/goals/:id/achieve', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { PATCH } = await import('@/pages/api/goals/[id]/achieve');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1/achieve',
        method: 'PATCH',
        params: { id: 'goal-1' },
      });
      
      const response = await PATCH(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 400 gdy brak ID', async () => {
      mockAuthenticatedSession();
      
      const { PATCH } = await import('@/pages/api/goals/[id]/achieve');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals//achieve',
        method: 'PATCH',
        params: {},
      });
      
      const response = await PATCH(ctx as any);
      
      expect(response.status).toBe(400);
    });

    it('zwraca 404 gdy cel nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { PATCH } = await import('@/pages/api/goals/[id]/achieve');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/non-existent/achieve',
        method: 'PATCH',
        params: { id: 'non-existent' },
      });
      
      const response = await PATCH(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('oznacza cel jako osiągnięty', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockGoal]),
        }),
      } as any);
      
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { ...mockGoal, status: 'achieved', achievedAt: new Date() }
            ]),
          }),
        }),
      } as any);

      const { PATCH } = await import('@/pages/api/goals/[id]/achieve');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1/achieve',
        method: 'PATCH',
        params: { id: 'goal-1' },
      });
      
      const response = await PATCH(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });
});

describe('API: /api/goals/[id]/archive', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('PATCH /api/goals/:id/archive', () => {
    it('zwraca 401 dla niezalogowanego użytkownika', async () => {
      mockUnauthenticatedSession();
      
      const { PATCH } = await import('@/pages/api/goals/[id]/archive');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1/archive',
        method: 'PATCH',
        params: { id: 'goal-1' },
      });
      
      const response = await PATCH(ctx as any);
      
      expect(response.status).toBe(401);
    });

    it('zwraca 404 gdy cel nie istnieje', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const { PATCH } = await import('@/pages/api/goals/[id]/archive');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/non-existent/archive',
        method: 'PATCH',
        params: { id: 'non-existent' },
      });
      
      const response = await PATCH(ctx as any);
      
      expect(response.status).toBe(404);
    });

    it('archiwizuje cel', async () => {
      mockAuthenticatedSession();
      
      const { db } = await import('@/lib/db');
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockGoal]),
        }),
      } as any);
      
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              { ...mockGoal, isArchived: true }
            ]),
          }),
        }),
      } as any);

      const { PATCH } = await import('@/pages/api/goals/[id]/archive');
      const ctx = createMockAPIContext({
        url: 'http://localhost:4321/api/goals/goal-1/archive',
        method: 'PATCH',
        params: { id: 'goal-1' },
      });
      
      const response = await PATCH(ctx as any);
      
      expect(response.status).toBe(200);
    });
  });
});
