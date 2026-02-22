/**
 * Testy E2E dla flow autoryzacji
 * Pokrywa: rejestrację, logowanie, wylogowanie, reset hasła
 */

import { test, expect } from '@playwright/test';

test.describe('Autoryzacja', () => {
  test.describe('Strona logowania', () => {
    test('wyświetla formularz logowania', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('wyświetla link do rejestracji', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.locator('a[href="/auth/register"]')).toBeVisible();
    });

    test('wyświetla link do resetu hasła', async ({ page }) => {
      await page.goto('/auth/login');

      await expect(page.locator('a[href="/auth/forgot-password"]')).toBeVisible();
    });

    test('waliduje puste pola przy submicie', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      await page.locator('button[type="submit"]').click();

      // Oczekuj komunikatów o błędach walidacji
      await expect(page.getByText('Nieprawidłowy adres email')).toBeVisible();
    });

    test('waliduje format email', async ({ page }) => {
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      await page.locator('input[type="email"]').fill('invalid-email');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();

      // Oczekuj błędu walidacji email
      await expect(page.getByText('Nieprawidłowy adres email')).toBeVisible();
    });
  });

  test.describe('Strona rejestracji', () => {
    test('wyświetla formularz rejestracji', async ({ page }) => {
      await page.goto('/auth/register');

      await expect(page.locator('input[name="name"], input[id="name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('input#confirmPassword')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('wyświetla link do logowania', async ({ page }) => {
      await page.goto('/auth/register');

      await expect(page.locator('a[href="/auth/login"]')).toBeVisible();
    });

    test('waliduje wymagane pola', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      await page.locator('button[type="submit"]').click();

      // Oczekuj komunikatów o błędach walidacji
      await expect(page.getByText('Imię musi mieć co najmniej 2 znaki')).toBeVisible();
    });

    test('waliduje siłę hasła', async ({ page }) => {
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      await page.locator('input[name="name"], input[id="name"]').fill('Test User');
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input#password').fill('123'); // Za słabe
      await page.locator('button[type="submit"]').click();

      // Oczekuj błędu o sile hasła
      await expect(page.getByText(/co najmniej 8 znaków/i)).toBeVisible();
    });
  });

  test.describe('Strona resetowania hasła', () => {
    test('wyświetla formularz reset hasła', async ({ page }) => {
      await page.goto('/auth/forgot-password');

      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('wyświetla link powrotu do logowania', async ({ page }) => {
      await page.goto('/auth/forgot-password');

      await expect(page.locator('a[href="/auth/login"]')).toBeVisible();
    });
  });

  test.describe('Ochrona tras', () => {
    test('przekierowuje niezalogowanego z /dashboard na /auth/login', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('przekierowuje niezalogowanego z /trainings na /auth/login', async ({ page }) => {
      await page.goto('/trainings');

      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('przekierowuje niezalogowanego z /goals na /auth/login', async ({ page }) => {
      await page.goto('/goals');

      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('przekierowuje niezalogowanego z /personal-records na /auth/login', async ({ page }) => {
      await page.goto('/personal-records');

      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('pozwala na dostęp do strony głównej', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveURL('/');
    });
  });
});
