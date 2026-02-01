/**
 * Helper do mockowania sesji autoryzacji w testach
 */

import { vi } from 'vitest';
import { auth } from '@/lib/auth';

// Typ sesji użytkownika
export interface MockUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockSession {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  token: string;
}

export interface MockSessionData {
  user: MockUser;
  session: MockSession;
}

/**
 * Tworzy przykładowego użytkownika do testów
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'user-test-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Tworzy przykładową sesję do testów
 */
export function createMockSession(userId: string, overrides: Partial<MockSession> = {}): MockSession {
  return {
    id: 'session-test-123',
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dni
    createdAt: new Date(),
    updatedAt: new Date(),
    token: 'test-token-abc123',
    ...overrides,
  };
}

/**
 * Tworzy pełne dane sesji (user + session)
 */
export function createMockSessionData(
  userOverrides: Partial<MockUser> = {},
  sessionOverrides: Partial<MockSession> = {}
): MockSessionData {
  const user = createMockUser(userOverrides);
  const session = createMockSession(user.id, sessionOverrides);
  return { user, session };
}

/**
 * Mockuje sesję jako zalogowanego użytkownika
 */
export function mockAuthenticatedSession(sessionData?: MockSessionData): void {
  const data = sessionData || createMockSessionData();
  vi.mocked(auth.api.getSession).mockResolvedValue(data);
}

/**
 * Mockuje brak sesji (niezalogowany użytkownik)
 */
export function mockUnauthenticatedSession(): void {
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
}

/**
 * Mockuje wygasłą sesję
 */
export function mockExpiredSession(): void {
  const user = createMockUser();
  const session = createMockSession(user.id, {
    expiresAt: new Date(Date.now() - 1000), // wygasła 1 sekundę temu
  });
  // Better Auth powinno zwrócić null dla wygasłej sesji
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
}

/**
 * Resetuje wszystkie mocki autoryzacji
 */
export function resetAuthMocks(): void {
  vi.mocked(auth.api.getSession).mockReset();
}

/**
 * Tworzy drugiego użytkownika (do testów autoryzacji zasobów)
 */
export function createOtherUser(): MockUser {
  return createMockUser({
    id: 'user-other-456',
    email: 'other@example.com',
    name: 'Other User',
  });
}
