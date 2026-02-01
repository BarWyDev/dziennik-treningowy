/**
 * Testy walidacji - Faza 3
 * 
 * Ten plik agreguje wszystkie testy walidacji.
 * Uruchom: pnpm test:validations
 * 
 * Zawiera:
 * 1. auth.test.ts - Walidacja autoryzacji (login, register, reset password)
 * 2. training.test.ts - Walidacja treningów (daty, oceny, pola reflection)
 * 3. goal.test.ts - Walidacja celów (deadline w przyszłości)
 * 4. personal-record.test.ts - Walidacja rekordów (result jako liczba)
 */

// Re-export dla lepszej organizacji
export * from './auth.test';
export * from './training.test';
export * from './goal.test';
export * from './personal-record.test';
