/**
 * Testy reguł biznesowych - Faza 2
 * 
 * Ten plik agreguje wszystkie testy reguł biznesowych.
 * Uruchom: pnpm test:business
 * 
 * Zawiera:
 * 1. goals-limit.test.ts - Limit 5 aktywnych celów per użytkownik
 * 2. training-types-protection.test.ts - Ochrona domyślnych typów treningów
 * 3. media-limits.test.ts - Limity mediów (5 zdjęć + 1 video, 50MB)
 * 4. cascade-delete.test.ts - Kasowanie kaskadowe mediów
 */

// Re-export dla lepszej organizacji
export * from './goals-limit.test';
export * from './training-types-protection.test';
export * from './media-limits.test';
export * from './cascade-delete.test';
