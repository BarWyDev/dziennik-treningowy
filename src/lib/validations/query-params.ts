/**
 * Helper functions do walidacji query params z URLSearchParams
 */

import { z } from 'zod';
import { handleValidationError } from '@/lib/error-handler';

/**
 * Parsuje i waliduje query params z URLSearchParams używając schematu Zod
 * 
 * @param searchParams - URLSearchParams z requestu
 * @param schema - Schemat Zod do walidacji
 * @returns Zwraca przetworzone dane lub Response z błędem walidacji
 */
export function parseQueryParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: Response } {
  // Konwertuj URLSearchParams do obiektu
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // Waliduj używając schematu
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      response: handleValidationError(result),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Parsuje query params z wartościami domyślnymi dla brakujących parametrów
 * 
 * @param searchParams - URLSearchParams z requestu
 * @param schema - Schemat Zod do walidacji
 * @returns Zwraca przetworzone dane lub Response z błędem walidacji
 */
export function parseQueryParamsWithDefaults<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: Response } {
  // Konwertuj URLSearchParams do obiektu
  // Dla brakujących parametrów nie dodajemy ich do obiektu (Zod użyje wartości domyślnych)
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    // Puste stringi traktujemy jako brak wartości (Zod użyje default)
    if (value !== '') {
      params[key] = value;
    }
  });

  // Waliduj używając schematu (Zod automatycznie użyje wartości domyślnych dla brakujących pól)
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      response: handleValidationError(result),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
