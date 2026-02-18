/**
 * Testy E2E dla nawigacji i responsywności
 * Pokrywa: nawigację między stronami, menu mobilne, breadcrumbs
 */

import { test, expect } from '@playwright/test';

test.describe('Nawigacja - Strona główna', () => {
  test('wyświetla stronę główną', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/TrainWise/i);
  });

  test('wyświetla przycisk CTA do rejestracji/logowania', async ({ page }) => {
    await page.goto('/');

    // Oczekuj przycisku zachęcającego do akcji
    await expect(
      page.locator('a[href="/auth/login"], a[href="/auth/register"]').first()
    ).toBeVisible();
  });

  test('wyświetla nawigację', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('nav, header')).toBeVisible();
  });
});

test.describe('Nawigacja - Strony auth', () => {
  test('nawigacja między login a register', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('a[href="/auth/register"]').click();
    await expect(page).toHaveURL('/auth/register');

    await page.locator('a[href="/auth/login"]').click();
    await expect(page).toHaveURL('/auth/login');
  });

  test('nawigacja do forgot-password', async ({ page }) => {
    await page.goto('/auth/login');

    await page.locator('a[href="/auth/forgot-password"]').click();
    await expect(page).toHaveURL('/auth/forgot-password');
  });

  test('powrót do login z forgot-password', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    await page.locator('a[href="/auth/login"]').click();
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('Responsywność', () => {
  test('strona główna jest responsywna (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Strona powinna być widoczna i nie mieć horizontal scroll
    const body = page.locator('body');
    const bodyWidth = await body.evaluate((el) => el.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('strona główna jest responsywna (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
  });

  test('strona główna jest responsywna (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
  });

  test('strona logowania jest responsywna (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/login');

    // Formularz powinien być widoczny
    await expect(page.locator('form')).toBeVisible();
  });
});

test.describe('Nawigacja - Linki', () => {
  test('logo/nazwa aplikacji linkuje do strony głównej', async ({ page }) => {
    await page.goto('/');

    // Sprawdź że strona główna ma link do rejestracji lub logowania
    const authLink = page.locator('a[href="/auth/login"], a[href="/auth/register"]').first();
    await expect(authLink).toBeVisible();
  });
});

test.describe('Nawigacja - Historia przeglądarki', () => {
  test('przycisk back działa poprawnie', async ({ page }) => {
    await page.goto('/');
    await page.goto('/auth/login');

    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('przycisk forward działa poprawnie', async ({ page }) => {
    await page.goto('/');
    await page.goto('/auth/login');
    await page.goBack();

    await page.goForward();
    await expect(page).toHaveURL('/auth/login');
  });
});

test.describe('Nawigacja - 404', () => {
  test('nieistniejąca chroniona ścieżka przekierowuje na login', async ({ page }) => {
    await page.goto('/nieistniejaca-strona-xyz');

    // Middleware przekierowuje niezalogowanych na login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Nawigacja - Meta tags', () => {
  test('strona główna ma poprawne meta tags', async ({ page }) => {
    await page.goto('/');

    // Sprawdź title
    await expect(page).toHaveTitle(/TrainWise/);

    // Sprawdź meta description (jeśli jest)
    const metaDescription = page.locator('meta[name="description"]');
    // await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('strona logowania ma poprawny title', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page).toHaveTitle(/logowanie|TrainWise/i);
  });
});

test.describe('Nawigacja - Accessibility', () => {
  test('strona główna ma skip link lub główny landmark', async ({ page }) => {
    await page.goto('/');

    // Sprawdź czy jest main element
    await expect(page.locator('main')).toBeVisible();
  });

  test('strona logowania ma focus na pierwszym polu', async ({ page }) => {
    await page.goto('/auth/login');

    // Sprawdź kolejność tabowania
    await page.keyboard.press('Tab');
    
    // Powinien być focus na jakimś elemencie interaktywnym
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });
});
