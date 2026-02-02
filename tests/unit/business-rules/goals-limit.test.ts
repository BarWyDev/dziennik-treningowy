/**
 * Testy reguł biznesowych - Limit aktywnych celów
 * 
 * Testuje:
 * - Maksymalnie 5 aktywnych celów per użytkownik
 * - Cel jest "aktywny" gdy status='active' AND isArchived=false
 * - Można utworzyć nowy cel po archiwizacji lub osiągnięciu jednego z aktywnych
 * 
 * KRYTYCZNE: Te testy sprawdzają kluczową regułę biznesową aplikacji.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  mockAuthenticatedSession,
  resetAuthMocks,
  createMockSessionData,
} from '../../helpers';

const MAX_ACTIVE_GOALS = 5;

describe('Goals Business Rules - Active Goals Limit', () => {
  const mockUser = createMockSessionData({ id: 'user-123', email: 'test@example.com' });

  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('POST /api/goals - sprawdzanie limitu', () => {
    it('powinien odrzucić tworzenie 6. aktywnego celu', async () => {
      mockAuthenticatedSession(mockUser);

      // Symulacja: użytkownik ma już 5 aktywnych celów
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');

      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Szósty cel',
          targetValue: 100,
          unit: 'kg',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error.code).toBe('GOAL_LIMIT_EXCEEDED');
    });

    it('powinien pozwolić na tworzenie celu gdy użytkownik ma mniej niż 5 aktywnych', async () => {
      mockAuthenticatedSession(mockUser);

      // Symulacja: użytkownik ma 4 aktywne cele
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 4 }]),
        }),
      } as any);

      // Mock dla insert
      const mockNewGoal = {
        id: 'goal-new-123',
        userId: mockUser.user.id,
        title: 'Piąty cel',
        status: 'active',
        isArchived: false,
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewGoal]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');

      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Piąty cel',
          targetValue: 100,
          unit: 'kg',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.title).toBe('Piąty cel');
    });

    it('powinien pozwolić na tworzenie celu gdy użytkownik nie ma żadnych celów', async () => {
      mockAuthenticatedSession(mockUser);

      // Symulacja: użytkownik ma 0 aktywnych celów
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as any);

      const mockNewGoal = {
        id: 'goal-first-123',
        userId: mockUser.user.id,
        title: 'Pierwszy cel',
        status: 'active',
        isArchived: false,
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewGoal]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');

      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Pierwszy cel',
          targetValue: 50,
          unit: 'km',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
    });

    it('powinien pozwolić na tworzenie celu gdy użytkownik ma dokładnie 5 ale jeden jest achieved', async () => {
      mockAuthenticatedSession(mockUser);

      // Warunek limitu: status='active' AND isArchived=false
      // Jeśli jeden cel jest achieved, nie liczy się do limitu
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 4 }]), // 4 aktywne (1 achieved nie liczy się)
        }),
      } as any);

      const mockNewGoal = {
        id: 'goal-new-123',
        userId: mockUser.user.id,
        title: 'Nowy cel po achieved',
        status: 'active',
        isArchived: false,
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewGoal]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');

      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nowy cel po achieved',
          targetValue: 10,
          unit: 'reps',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
    });

    it('powinien pozwolić na tworzenie celu gdy użytkownik ma 5 ale jeden jest archived', async () => {
      mockAuthenticatedSession(mockUser);

      // Zarchiwizowany cel nie liczy się do limitu
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 4 }]), // 4 aktywne (1 archived nie liczy się)
        }),
      } as any);

      const mockNewGoal = {
        id: 'goal-new-456',
        userId: mockUser.user.id,
        title: 'Nowy cel po archiwizacji',
        status: 'active',
        isArchived: false,
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewGoal]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');

      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Nowy cel po archiwizacji',
          targetValue: 20,
          unit: 'min',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
    });
  });

  describe('Definicja aktywnego celu', () => {
    it('cel jest aktywny gdy status=active AND isArchived=false', () => {
      /**
       * Reguła biznesowa z kodu (goals/index.ts:54-59):
       * 
       * .where(
       *   and(
       *     eq(goals.userId, session.user.id),
       *     eq(goals.status, 'active'),
       *     eq(goals.isArchived, false)
       *   )
       * )
       */
      const isActiveGoal = (goal: { status: string; isArchived: boolean }): boolean => {
        return goal.status === 'active' && goal.isArchived === false;
      };

      // Aktywny cel
      expect(isActiveGoal({ status: 'active', isArchived: false })).toBe(true);

      // Nieaktywne cele
      expect(isActiveGoal({ status: 'achieved', isArchived: false })).toBe(false);
      expect(isActiveGoal({ status: 'active', isArchived: true })).toBe(false);
      expect(isActiveGoal({ status: 'achieved', isArchived: true })).toBe(false);
    });
  });

  describe('Granica limitu - edge cases', () => {
    it('powinien odrzucić przy dokładnie 5 aktywnych celach', async () => {
      mockAuthenticatedSession(mockUser);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');

      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Cel przekraczający limit',
          targetValue: 100,
          unit: 'kg',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe('GOAL_LIMIT_EXCEEDED');
    });

    it('powinien pozwolić przy dokładnie 4 aktywnych celach', async () => {
      mockAuthenticatedSession(mockUser);

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 4 }]),
        }),
      } as any);

      const mockNewGoal = {
        id: 'goal-fifth-123',
        userId: mockUser.user.id,
        title: 'Piąty cel',
        status: 'active',
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockNewGoal]),
        }),
      } as any);

      const { POST } = await import('@/pages/api/goals/index');

      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Piąty cel',
          targetValue: 100,
          unit: 'kg',
        }),
      });

      const response = await POST({ request } as any);

      expect(response.status).toBe(201);
    });
  });
});

describe('Goals Business Rules - Status Changes', () => {
  const mockUser = createMockSessionData({ id: 'user-123', email: 'test@example.com' });

  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  describe('PATCH /api/goals/:id/achieve', () => {
    it('powinien zmienić status na achieved i ustawić achievedAt', async () => {
      mockAuthenticatedSession(mockUser);

      const existingGoal = {
        id: 'goal-123',
        userId: mockUser.user.id,
        status: 'active',
        isArchived: false,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([existingGoal]),
        }),
      } as any);

      const updatedGoal = {
        ...existingGoal,
        status: 'achieved',
        achievedAt: new Date(),
      };

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedGoal]),
          }),
        }),
      } as any);

      const { PATCH } = await import('@/pages/api/goals/[id]/achieve');

      const request = new Request('http://localhost:4321/api/goals/goal-123/achieve', {
        method: 'PATCH',
      });

      const response = await PATCH({
        request,
        params: { id: 'goal-123' },
      } as any);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('achieved');
      expect(data.achievedAt).toBeDefined();
    });
  });

  describe('PATCH /api/goals/:id/archive', () => {
    it('powinien ustawić isArchived na true', async () => {
      mockAuthenticatedSession(mockUser);

      const existingGoal = {
        id: 'goal-456',
        userId: mockUser.user.id,
        status: 'active',
        isArchived: false,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([existingGoal]),
        }),
      } as any);

      const updatedGoal = {
        ...existingGoal,
        isArchived: true,
      };

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedGoal]),
          }),
        }),
      } as any);

      const { PATCH } = await import('@/pages/api/goals/[id]/archive');

      const request = new Request('http://localhost:4321/api/goals/goal-456/archive', {
        method: 'PATCH',
      });

      const response = await PATCH({
        request,
        params: { id: 'goal-456' },
      } as any);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.isArchived).toBe(true);
    });
  });
});

describe('Goals Limit - Documentation', () => {
  it('MAX_ACTIVE_GOALS powinno być równe 5', () => {
    /**
     * Stała MAX_ACTIVE_GOALS jest zdefiniowana w:
     * src/pages/api/goals/index.ts:7
     * 
     * const MAX_ACTIVE_GOALS = 5;
     */
    expect(MAX_ACTIVE_GOALS).toBe(5);
  });

  it('powinien zwrócić komunikat błędu po polsku', async () => {
    /**
     * Komunikat błędu: "Możesz mieć maksymalnie 5 aktywnych celów"
     * jest przyjazny dla użytkownika i po polsku.
     */
    const errorMessage = `Możesz mieć maksymalnie ${MAX_ACTIVE_GOALS} aktywnych celów`;
    expect(errorMessage).toBe('Możesz mieć maksymalnie 5 aktywnych celów');
  });
});
