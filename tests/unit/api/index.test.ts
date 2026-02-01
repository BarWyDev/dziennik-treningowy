/**
 * Plik indeksowy dla testów API
 * Eksportuje wszystkie testy API
 */

import { describe, it, expect } from 'vitest';

describe('API Tests Structure', () => {
  it('dokumentacja struktury testów API', () => {
    // Ten test służy jako dokumentacja
    const apiEndpoints = [
      '/api/trainings',
      '/api/goals',
      '/api/training-types',
      '/api/personal-records',
      '/api/dashboard',
    ];
    expect(apiEndpoints.length).toBe(5);
  });
});

/**
 * Struktura testów API:
 * 
 * trainings.test.ts - Testy CRUD dla /api/trainings
 *   - GET /api/trainings - lista treningów z filtrami i paginacją
 *   - POST /api/trainings - tworzenie treningu
 *   - GET /api/trainings/:id - szczegóły treningu
 *   - PUT /api/trainings/:id - aktualizacja treningu
 *   - DELETE /api/trainings/:id - usunięcie treningu
 * 
 * goals.test.ts - Testy CRUD dla /api/goals
 *   - GET /api/goals - lista celów
 *   - POST /api/goals - tworzenie celu (z limitem 5 aktywnych)
 *   - GET /api/goals/:id - szczegóły celu
 *   - PUT /api/goals/:id - aktualizacja celu
 *   - DELETE /api/goals/:id - usunięcie celu
 *   - PATCH /api/goals/:id/achieve - oznaczenie jako osiągnięty
 *   - PATCH /api/goals/:id/archive - archiwizacja celu
 * 
 * training-types.test.ts - Testy CRUD dla /api/training-types
 *   - GET /api/training-types - lista typów (domyślne + własne)
 *   - POST /api/training-types - tworzenie własnego typu
 *   - PUT /api/training-types/:id - aktualizacja własnego typu
 *   - DELETE /api/training-types/:id - usunięcie własnego typu
 *   - Ochrona typów domyślnych przed modyfikacją
 * 
 * personal-records.test.ts - Testy CRUD dla /api/personal-records
 *   - GET /api/personal-records - lista rekordów z sortowaniem
 *   - POST /api/personal-records - tworzenie rekordu
 *   - GET /api/personal-records/:id - szczegóły rekordu
 *   - PUT /api/personal-records/:id - aktualizacja rekordu
 *   - DELETE /api/personal-records/:id - usunięcie rekordu
 *   - GET /api/personal-records/stats - statystyki rekordów
 * 
 * dashboard.test.ts - Testy dla /api/dashboard
 *   - GET /api/dashboard - dane dashboardu
 *     - recentTrainings (ostatnie 5)
 *     - weekSummary (statystyki tygodnia)
 *     - activeGoals (max 3)
 *     - totalStats (ogólne statystyki)
 */
