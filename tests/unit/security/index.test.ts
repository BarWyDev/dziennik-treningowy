/**
 * Testy bezpieczeństwa - Faza 1
 * 
 * Ten plik agreguje wszystkie testy bezpieczeństwa.
 * Uruchom: pnpm test tests/unit/security
 * 
 * Zawiera:
 * 1. middleware.test.ts - Testy middleware autoryzacji (publiczne vs chronione ścieżki)
 * 2. api-authentication.test.ts - Testy 401 dla niezalogowanych użytkowników
 * 3. resource-authorization.test.ts - Testy izolacji zasobów między użytkownikami
 * 4. file-security.test.ts - Testy ochrony przed path traversal
 */

// Re-export dla lepszej organizacji
export * from './middleware.test';
export * from './api-authentication.test';
export * from './resource-authorization.test';
export * from './file-security.test';
