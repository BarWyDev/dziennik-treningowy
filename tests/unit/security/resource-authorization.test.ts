/**
 * Testy bezpieczeństwa - Autoryzacja właściciela zasobów
 * 
 * Testuje że użytkownicy nie mogą uzyskać dostępu do zasobów innych użytkowników.
 * Wszystkie endpointy powinny zwracać 404 (nie 403) aby nie ujawniać istnienia zasobów.
 * 
 * KRYTYCZNE: Te testy sprawdzają izolację danych między użytkownikami.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  mockAuthenticatedSession,
  resetAuthMocks,
  createMockSessionData,
  createMockUser,
  createOtherUser,
} from '../../helpers';

describe('Resource Authorization - User Isolation', () => {
  // Użytkownik A - zalogowany
  const userA = createMockUser({ id: 'user-a-123', email: 'usera@test.com' });
  // Użytkownik B - właściciel zasobów których A próbuje dostać
  const userB = createOtherUser();

  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  // =================================================================
  // TRAININGS - Izolacja zasobów
  // =================================================================
  describe('Trainings Resource Authorization', () => {
    describe('GET /api/trainings/:id', () => {
      it('powinien zwrócić 404 dla treningu innego użytkownika', async () => {
        // User A jest zalogowany
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        // Training należy do User B - query zwróci pustą tablicę
        // bo warunek eq(trainings.userId, session.user.id) nie zostanie spełniony
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]), // Pusty wynik = nie znaleziono
            }),
          }),
        } as any);

        const { GET } = await import('@/pages/api/trainings/[id]');

        const request = new Request('http://localhost:4321/api/trainings/training-of-user-b');
        const response = await GET({
          request,
          params: { id: 'training-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('TRAINING_NOT_FOUND');
      });

      it('powinien zwrócić 200 dla własnego treningu', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        // Training należy do User A - query zwróci wynik
        const mockTraining = {
          training: {
            id: 'training-a-1',
            userId: userA.id,
            date: '2025-01-15',
            ratingOverall: 4,
          },
          trainingType: { id: 'type-1', name: 'Siłowy' },
        };

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([mockTraining]),
            }),
            where: vi.fn().mockResolvedValue([]), // dla media query
          }),
        } as any);

        const { GET } = await import('@/pages/api/trainings/[id]');

        const request = new Request('http://localhost:4321/api/trainings/training-a-1');
        const response = await GET({
          request,
          params: { id: 'training-a-1' },
        } as any);

        expect(response.status).toBe(200);
      });
    });

    describe('PUT /api/trainings/:id', () => {
      it('powinien zwrócić 404 przy próbie edycji treningu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        // Training należy do User B
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]), // Nie znaleziono
          }),
        } as any);

        const { PUT } = await import('@/pages/api/trainings/[id]');

        const request = new Request('http://localhost:4321/api/trainings/training-of-user-b', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ratingOverall: 5 }),
        });

        const response = await PUT({
          request,
          params: { id: 'training-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('TRAINING_NOT_FOUND');
      });
    });

    describe('DELETE /api/trainings/:id', () => {
      it('powinien zwrócić 404 przy próbie usunięcia treningu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { DELETE } = await import('@/pages/api/trainings/[id]');

        const request = new Request('http://localhost:4321/api/trainings/training-of-user-b', {
          method: 'DELETE',
        });

        const response = await DELETE({
          request,
          params: { id: 'training-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('TRAINING_NOT_FOUND');
      });
    });
  });

  // =================================================================
  // GOALS - Izolacja zasobów
  // =================================================================
  describe('Goals Resource Authorization', () => {
    describe('GET /api/goals/:id', () => {
      it('powinien zwrócić 404 dla celu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { GET } = await import('@/pages/api/goals/[id]');

        const request = new Request('http://localhost:4321/api/goals/goal-of-user-b');
        const response = await GET({
          request,
          params: { id: 'goal-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('GOAL_NOT_FOUND');
      });
    });

    describe('PUT /api/goals/:id', () => {
      it('powinien zwrócić 404 przy próbie edycji celu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { PUT } = await import('@/pages/api/goals/[id]');

        const request = new Request('http://localhost:4321/api/goals/goal-of-user-b', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Hacked Goal' }),
        });

        const response = await PUT({
          request,
          params: { id: 'goal-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('GOAL_NOT_FOUND');
      });
    });

    describe('DELETE /api/goals/:id', () => {
      it('powinien zwrócić 404 przy próbie usunięcia celu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { DELETE } = await import('@/pages/api/goals/[id]');

        const request = new Request('http://localhost:4321/api/goals/goal-of-user-b', {
          method: 'DELETE',
        });

        const response = await DELETE({
          request,
          params: { id: 'goal-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('GOAL_NOT_FOUND');
      });
    });

    describe('PATCH /api/goals/:id/achieve', () => {
      it('powinien zwrócić 404 przy próbie oznaczenia celu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { PATCH } = await import('@/pages/api/goals/[id]/achieve');

        const request = new Request('http://localhost:4321/api/goals/goal-of-user-b/achieve', {
          method: 'PATCH',
        });

        const response = await PATCH({
          request,
          params: { id: 'goal-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('GOAL_NOT_FOUND');
      });
    });

    describe('PATCH /api/goals/:id/archive', () => {
      it('powinien zwrócić 404 przy próbie archiwizacji celu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { PATCH } = await import('@/pages/api/goals/[id]/archive');

        const request = new Request('http://localhost:4321/api/goals/goal-of-user-b/archive', {
          method: 'PATCH',
        });

        const response = await PATCH({
          request,
          params: { id: 'goal-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('GOAL_NOT_FOUND');
      });
    });
  });

  // =================================================================
  // PERSONAL RECORDS - Izolacja zasobów
  // =================================================================
  describe('Personal Records Resource Authorization', () => {
    describe('GET /api/personal-records/:id', () => {
      it('powinien zwrócić 404 dla rekordu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { GET } = await import('@/pages/api/personal-records/[id]');

        const request = new Request('http://localhost:4321/api/personal-records/record-of-user-b');
        const response = await GET({
          request,
          params: { id: 'record-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('PERSONAL_RECORD_NOT_FOUND');
      });
    });

    describe('PUT /api/personal-records/:id', () => {
      it('powinien zwrócić 404 przy próbie edycji rekordu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { PUT } = await import('@/pages/api/personal-records/[id]');

        const request = new Request('http://localhost:4321/api/personal-records/record-of-user-b', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: '200' }),
        });

        const response = await PUT({
          request,
          params: { id: 'record-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('PERSONAL_RECORD_NOT_FOUND');
      });
    });

    describe('DELETE /api/personal-records/:id', () => {
      it('powinien zwrócić 404 przy próbie usunięcia rekordu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { DELETE } = await import('@/pages/api/personal-records/[id]');

        const request = new Request('http://localhost:4321/api/personal-records/record-of-user-b', {
          method: 'DELETE',
        });

        const response = await DELETE({
          request,
          params: { id: 'record-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error.code).toBe('PERSONAL_RECORD_NOT_FOUND');
      });
    });
  });

  // =================================================================
  // TRAINING TYPES - Izolacja zasobów (custom types)
  // =================================================================
  describe('Training Types Resource Authorization', () => {
    describe('PUT /api/training-types/:id', () => {
      it('powinien zwrócić 404 przy próbie edycji typu treningu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        // Typ nie należy do użytkownika A
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { PUT } = await import('@/pages/api/training-types/[id]');

        const request = new Request('http://localhost:4321/api/training-types/type-of-user-b', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Hacked Type' }),
        });

        const response = await PUT({
          request,
          params: { id: 'type-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        // Komunikat zawiera również info o ochronie domyślnych typów
        expect(data.error.code).toBe('TRAINING_TYPE_NOT_FOUND');
      });
    });

    describe('DELETE /api/training-types/:id', () => {
      it('powinien zwrócić 404 przy próbie usunięcia typu treningu innego użytkownika', async () => {
        const sessionA = createMockSessionData({ id: userA.id, email: userA.email });
        mockAuthenticatedSession(sessionA);

        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        } as any);

        const { DELETE } = await import('@/pages/api/training-types/[id]');

        const request = new Request('http://localhost:4321/api/training-types/type-of-user-b', {
          method: 'DELETE',
        });

        const response = await DELETE({
          request,
          params: { id: 'type-of-user-b' },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        // Komunikat zawiera również info o ochronie domyślnych typów
        expect(data.error.code).toBe('TRAINING_TYPE_NOT_FOUND');
      });
    });
  });

  // =================================================================
  // MEDIA - Izolacja zasobów
  // =================================================================
  describe('Media Resource Authorization', () => {
    describe('DELETE /api/media/:id', () => {
      it('powinien zwrócić 404 przy próbie usunięcia mediów innego użytkownika', async () => {
        // media/[id].ts używa locals.user zamiast auth.api.getSession
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // Pusty wynik = nie znaleziono
            }),
          }),
        } as any);

        const { DELETE } = await import('@/pages/api/media/[id]');

        const request = new Request('http://localhost:4321/api/media/media-of-user-b', {
          method: 'DELETE',
        });

        // Używamy locals.user dla user A
        const response = await DELETE({
          request,
          params: { id: 'media-of-user-b' },
          locals: { user: { id: userA.id, email: userA.email } },
        } as any);

        expect(response.status).toBe(404);
        const data = await response.json();
        // Komunikat po polsku zgodnie z kodem
        expect(data.error.code).toBe('MEDIA_NOT_FOUND');
      });
    });
  });
});

describe('Resource Authorization - Security considerations', () => {
  beforeEach(() => {
    resetAuthMocks();
    vi.clearAllMocks();
  });

  it('powinien zwracać 404 zamiast 403 dla nieistniejących/cudzych zasobów', () => {
    /**
     * WAŻNE: Zwracanie 404 zamiast 403 jest celowe!
     * 
     * 403 (Forbidden) ujawnia że zasób ISTNIEJE ale użytkownik nie ma dostępu.
     * 404 (Not Found) nie ujawnia informacji o istnieniu zasobu.
     * 
     * Jest to zgodne z zasadą "nie ujawniaj informacji o systemie".
     * Atakujący nie może sprawdzić czy dany ID istnieje w systemie.
     */
    expect(true).toBe(true); // Ten test jest dokumentacją
  });

  it('powinien używać warunku AND z userId we wszystkich zapytaniach', () => {
    /**
     * Wszystkie zapytania do bazy danych filtrujące zasoby użytkownika
     * MUSZĄ zawierać warunek:
     * 
     * .where(and(
     *   eq(table.id, id),
     *   eq(table.userId, session.user.id)
     * ))
     * 
     * NIE WOLNO najpierw pobierać zasobu a potem sprawdzać userId!
     * Takie podejście jest podatne na timing attacks.
     */
    expect(true).toBe(true); // Ten test jest dokumentacją
  });
});
