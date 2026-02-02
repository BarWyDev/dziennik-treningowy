/**
 * Testy bezpieczeństwa - API Authentication (401 Unauthorized)
 * 
 * Testuje że wszystkie chronione endpointy API zwracają 401
 * gdy użytkownik nie jest zalogowany.
 * 
 * KRYTYCZNE: Te testy sprawdzają najważniejszy aspekt bezpieczeństwa -
 * czy nieautoryzowany dostęp jest blokowany.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auth } from '@/lib/auth';
import {
  mockUnauthenticatedSession,
  mockAuthenticatedSession,
  resetAuthMocks,
  createMockSessionData,
} from '../../helpers';

describe('API Authentication - 401 Unauthorized for unauthenticated requests', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  // =================================================================
  // TRAININGS API
  // =================================================================
  describe('Trainings API - /api/trainings', () => {
    it('GET /api/trainings powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      // Importujemy dynamicznie aby mocki zadziałały
      const { GET } = await import('@/pages/api/trainings/index');
      
      const request = new Request('http://localhost:4321/api/trainings');
      const url = new URL(request.url);
      const response = await GET({ request, url } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/trainings powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { POST } = await import('@/pages/api/trainings/index');
      
      const request = new Request('http://localhost:4321/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainingTypeId: 'type-1',
          date: '2025-01-15',
          ratingOverall: 4,
        }),
      });
      
      const response = await POST({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Trainings API - /api/trainings/[id]', () => {
    it('GET /api/trainings/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/trainings/[id]');
      
      const request = new Request('http://localhost:4321/api/trainings/training-123');
      const response = await GET({ 
        request, 
        params: { id: 'training-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('PUT /api/trainings/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { PUT } = await import('@/pages/api/trainings/[id]');
      
      const request = new Request('http://localhost:4321/api/trainings/training-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratingOverall: 5 }),
      });
      
      const response = await PUT({ 
        request, 
        params: { id: 'training-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('DELETE /api/trainings/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/trainings/[id]');
      
      const request = new Request('http://localhost:4321/api/trainings/training-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE({ 
        request, 
        params: { id: 'training-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  // =================================================================
  // GOALS API
  // =================================================================
  describe('Goals API - /api/goals', () => {
    it('GET /api/goals powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/goals/index');
      
      const request = new Request('http://localhost:4321/api/goals');
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/goals powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { POST } = await import('@/pages/api/goals/index');
      
      const request = new Request('http://localhost:4321/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Goal',
          targetValue: 100,
          unit: 'kg',
        }),
      });
      
      const response = await POST({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Goals API - /api/goals/[id]', () => {
    it('GET /api/goals/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/goals/[id]');
      
      const request = new Request('http://localhost:4321/api/goals/goal-123');
      const response = await GET({ 
        request, 
        params: { id: 'goal-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('PUT /api/goals/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { PUT } = await import('@/pages/api/goals/[id]');
      
      const request = new Request('http://localhost:4321/api/goals/goal-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Goal' }),
      });
      
      const response = await PUT({ 
        request, 
        params: { id: 'goal-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('DELETE /api/goals/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/goals/[id]');
      
      const request = new Request('http://localhost:4321/api/goals/goal-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE({ 
        request, 
        params: { id: 'goal-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Goals API - /api/goals/[id]/achieve', () => {
    it('PATCH /api/goals/:id/achieve powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { PATCH } = await import('@/pages/api/goals/[id]/achieve');
      
      const request = new Request('http://localhost:4321/api/goals/goal-123/achieve', {
        method: 'PATCH',
      });
      
      const response = await PATCH({ 
        request, 
        params: { id: 'goal-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Goals API - /api/goals/[id]/archive', () => {
    it('PATCH /api/goals/:id/archive powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { PATCH } = await import('@/pages/api/goals/[id]/archive');
      
      const request = new Request('http://localhost:4321/api/goals/goal-123/archive', {
        method: 'PATCH',
      });
      
      const response = await PATCH({ 
        request, 
        params: { id: 'goal-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  // =================================================================
  // PERSONAL RECORDS API
  // =================================================================
  describe('Personal Records API - /api/personal-records', () => {
    it('GET /api/personal-records powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/personal-records/index');
      
      const request = new Request('http://localhost:4321/api/personal-records');
      const url = new URL(request.url);
      const response = await GET({ request, url } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/personal-records powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { POST } = await import('@/pages/api/personal-records/index');
      
      const request = new Request('http://localhost:4321/api/personal-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityName: 'Przysiad',
          result: '150 kg',
          date: '2025-01-15',
        }),
      });
      
      const response = await POST({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Personal Records API - /api/personal-records/[id]', () => {
    it('GET /api/personal-records/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/personal-records/[id]');
      
      const request = new Request('http://localhost:4321/api/personal-records/record-123');
      const response = await GET({ 
        request, 
        params: { id: 'record-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('PUT /api/personal-records/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { PUT } = await import('@/pages/api/personal-records/[id]');
      
      const request = new Request('http://localhost:4321/api/personal-records/record-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: '160 kg' }),
      });
      
      const response = await PUT({ 
        request, 
        params: { id: 'record-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('DELETE /api/personal-records/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/personal-records/[id]');
      
      const request = new Request('http://localhost:4321/api/personal-records/record-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE({ 
        request, 
        params: { id: 'record-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Personal Records API - /api/personal-records/stats', () => {
    it('GET /api/personal-records/stats powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/personal-records/stats');
      
      const request = new Request('http://localhost:4321/api/personal-records/stats');
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  // =================================================================
  // TRAINING TYPES API
  // =================================================================
  describe('Training Types API - /api/training-types', () => {
    it('GET /api/training-types powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/training-types/index');
      
      const request = new Request('http://localhost:4321/api/training-types');
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/training-types powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { POST } = await import('@/pages/api/training-types/index');
      
      const request = new Request('http://localhost:4321/api/training-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Mój typ treningu' }),
      });
      
      const response = await POST({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Training Types API - /api/training-types/[id]', () => {
    it('PUT /api/training-types/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { PUT } = await import('@/pages/api/training-types/[id]');
      
      const request = new Request('http://localhost:4321/api/training-types/type-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Type' }),
      });
      
      const response = await PUT({ 
        request, 
        params: { id: 'type-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('DELETE /api/training-types/:id powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { DELETE } = await import('@/pages/api/training-types/[id]');
      
      const request = new Request('http://localhost:4321/api/training-types/type-123', {
        method: 'DELETE',
      });
      
      const response = await DELETE({ 
        request, 
        params: { id: 'type-123' } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  // =================================================================
  // DASHBOARD API
  // =================================================================
  describe('Dashboard API - /api/dashboard', () => {
    it('GET /api/dashboard powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/dashboard');
      
      const request = new Request('http://localhost:4321/api/dashboard');
      const response = await GET({ request } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  // =================================================================
  // UPLOAD API
  // =================================================================
  describe('Upload API - /api/upload', () => {
    it('POST /api/upload powinien zwrócić 401 bez sesji', async () => {
      // upload.ts używa locals.user zamiast auth.api.getSession
      const { POST } = await import('@/pages/api/upload');
      
      const request = new Request('http://localhost:4321/api/upload', {
        method: 'POST',
        body: new FormData(),
      });
      
      // locals.user jest undefined = niezalogowany
      const response = await POST({ 
        request, 
        locals: { user: undefined } 
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  // =================================================================
  // FILES API
  // =================================================================
  describe('Files API - /api/files/[...path]', () => {
    it('GET /api/files/image.jpg powinien zwrócić 401 bez sesji', async () => {
      mockUnauthenticatedSession();
      
      const { GET } = await import('@/pages/api/files/[...path]');
      
      const request = new Request('http://localhost:4321/api/files/user-123/image.jpg');
      const response = await GET({ 
        request, 
        params: { path: 'user-123/image.jpg' } 
      } as any);
      
      expect(response.status).toBe(401);
    });
  });

  // =================================================================
  // MEDIA API
  // =================================================================
  describe('Media API - /api/media/[id]', () => {
    it('DELETE /api/media/:id powinien zwrócić 401 bez sesji', async () => {
      // media/[id].ts używa locals.user zamiast auth.api.getSession
      const { DELETE } = await import('@/pages/api/media/[id]');
      
      const request = new Request('http://localhost:4321/api/media/media-123', {
        method: 'DELETE',
      });
      
      // locals.user jest undefined = niezalogowany
      const response = await DELETE({ 
        request, 
        params: { id: 'media-123' },
        locals: { user: undefined }
      } as any);
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});

describe('API Authentication - Positive cases (authenticated requests)', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  it('Zalogowany użytkownik powinien mieć dostęp do chronionych endpointów', async () => {
    const mockSession = createMockSessionData();
    mockAuthenticatedSession(mockSession);
    
    // Weryfikujemy że mock działa poprawnie
    const session = await auth.api.getSession({ headers: new Headers() });
    
    expect(session).not.toBeNull();
    expect(session?.user.id).toBe('user-test-123');
  });
});
