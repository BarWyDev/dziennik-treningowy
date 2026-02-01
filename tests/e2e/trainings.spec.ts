/**
 * Testy E2E dla flow treningów
 * Pokrywa: CRUD treningów, filtrowanie, nawigację
 * 
 * UWAGA: Testy wymagają zalogowanego użytkownika.
 * W środowisku testowym należy skonfigurować fixture z zalogowaną sesją.
 */

import { test, expect } from '@playwright/test';

// Fixture do logowania (do zaimplementowania w środowisku testowym)
// test.beforeEach(async ({ page }) => {
//   await loginAsTestUser(page);
// });

test.describe('Treningi - Flow', () => {
  test.describe('Lista treningów', () => {
    test('strona treningów wymaga autoryzacji', async ({ page }) => {
      await page.goto('/trainings');
      
      // Oczekuj przekierowania na login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Formularz treningu (dostępność)', () => {
    test('strona nowego treningu wymaga autoryzacji', async ({ page }) => {
      await page.goto('/trainings/new');
      
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});

// Testy wymagające zalogowanego użytkownika
// Odkomentuej po skonfigurowaniu fixture autoryzacji

/*
test.describe('Treningi - Zalogowany użytkownik', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Zaloguj testowego użytkownika
  });

  test.describe('Lista treningów', () => {
    test('wyświetla listę treningów', async ({ page }) => {
      await page.goto('/trainings');

      await expect(page.locator('h1')).toContainText(/trening/i);
    });

    test('wyświetla przycisk dodania treningu', async ({ page }) => {
      await page.goto('/trainings');

      await expect(page.locator('a[href="/trainings/new"]')).toBeVisible();
    });

    test('wyświetla filtry', async ({ page }) => {
      await page.goto('/trainings');

      await expect(page.locator('[data-testid="filters"]')).toBeVisible();
    });
  });

  test.describe('Dodawanie treningu', () => {
    test('wyświetla formularz treningu', async ({ page }) => {
      await page.goto('/trainings/new');

      await expect(page.locator('select[name="trainingTypeId"]')).toBeVisible();
      await expect(page.locator('input[name="date"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('domyślna data to dzisiaj', async ({ page }) => {
      await page.goto('/trainings/new');

      const today = new Date().toISOString().split('T')[0];
      const dateInput = page.locator('input[name="date"]');
      
      await expect(dateInput).toHaveValue(today);
    });

    test('waliduje wymagane pola', async ({ page }) => {
      await page.goto('/trainings/new');

      await page.locator('button[type="submit"]').click();

      await expect(page.locator('text=/wymagane|required/i')).toBeVisible();
    });

    test('tworzy trening po wypełnieniu formularza', async ({ page }) => {
      await page.goto('/trainings/new');

      // Wypełnij formularz
      await page.locator('select[name="trainingTypeId"]').selectOption({ index: 1 });
      await page.locator('input[name="date"]').fill('2026-01-15');
      
      // Ustaw czas trwania
      // await page.locator('[data-testid="duration-picker"]').fill('60');
      
      // Ustaw ocenę
      await page.locator('[data-testid="rating-4"]').click();

      await page.locator('button[type="submit"]').click();

      // Oczekuj przekierowania na listę lub szczegóły
      await expect(page).toHaveURL(/\/trainings/);
    });
  });

  test.describe('Szczegóły treningu', () => {
    test('wyświetla szczegóły treningu', async ({ page }) => {
      // Załóżmy że istnieje trening o ID 'test-training'
      await page.goto('/trainings/test-training');

      await expect(page.locator('[data-testid="training-details"]')).toBeVisible();
    });

    test('wyświetla przyciski edycji i usunięcia', async ({ page }) => {
      await page.goto('/trainings/test-training');

      await expect(page.locator('a[href*="/edit"]')).toBeVisible();
      await expect(page.locator('[data-testid="delete-button"]')).toBeVisible();
    });
  });

  test.describe('Edycja treningu', () => {
    test('wyświetla formularz z danymi treningu', async ({ page }) => {
      await page.goto('/trainings/test-training/edit');

      // Formularz powinien być wypełniony
      const dateInput = page.locator('input[name="date"]');
      await expect(dateInput).toHaveValue(/.+/);
    });

    test('aktualizuje trening po submicie', async ({ page }) => {
      await page.goto('/trainings/test-training/edit');

      // Zmień notatkę
      await page.locator('textarea[name="notes"]').fill('Zaktualizowana notatka');
      await page.locator('button[type="submit"]').click();

      // Oczekuj przekierowania
      await expect(page).toHaveURL(/\/trainings/);
    });
  });

  test.describe('Usuwanie treningu', () => {
    test('wyświetla dialog potwierdzenia', async ({ page }) => {
      await page.goto('/trainings/test-training');

      await page.locator('[data-testid="delete-button"]').click();

      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=/usunąć|pewien/i')).toBeVisible();
    });

    test('usuwa trening po potwierdzeniu', async ({ page }) => {
      await page.goto('/trainings/test-training');

      await page.locator('[data-testid="delete-button"]').click();
      await page.locator('[data-testid="confirm-delete"]').click();

      // Oczekuj przekierowania na listę
      await expect(page).toHaveURL('/trainings');
    });

    test('anuluje usuwanie', async ({ page }) => {
      await page.goto('/trainings/test-training');

      await page.locator('[data-testid="delete-button"]').click();
      await page.locator('[data-testid="cancel-delete"]').click();

      // Dialog powinien się zamknąć
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test.describe('Filtrowanie treningów', () => {
    test('filtruje po typie treningu', async ({ page }) => {
      await page.goto('/trainings');

      await page.locator('select[data-testid="type-filter"]').selectOption({ label: 'Siłowy' });

      // Oczekuj zaktualizowanej listy
      await expect(page.locator('[data-testid="training-card"]')).toBeVisible();
    });

    test('filtruje po dacie', async ({ page }) => {
      await page.goto('/trainings');

      await page.locator('input[data-testid="start-date"]').fill('2026-01-01');
      await page.locator('input[data-testid="end-date"]').fill('2026-01-31');

      // Oczekuj zaktualizowanej listy
      await expect(page.locator('[data-testid="training-list"]')).toBeVisible();
    });

    test('resetuje filtry', async ({ page }) => {
      await page.goto('/trainings');

      // Ustaw filtry
      await page.locator('select[data-testid="type-filter"]').selectOption({ index: 1 });
      
      // Resetuj
      await page.locator('[data-testid="reset-filters"]').click();

      // Sprawdź czy filtry są zresetowane
      await expect(page.locator('select[data-testid="type-filter"]')).toHaveValue('');
    });
  });
});
*/
