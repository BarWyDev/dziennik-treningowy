/**
 * Helper functions safe for client-side (browser) usage
 * These functions do NOT import any server-side dependencies
 */

/**
 * Struktura błędu API (zgodna z error-handler.ts)
 */
interface ApiErrorResponse {
  error: {
    code: string;
    category: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Sprawdza czy obiekt jest strukturyzowanym błędem API
 */
function isApiError(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiErrorResponse).error === 'object' &&
    (data as ApiErrorResponse).error !== null &&
    'message' in (data as ApiErrorResponse).error
  );
}

/**
 * Bezpiecznie parsuje JSON z response
 * Sprawdza content-type i obsługuje błędy parsowania
 */
export async function safeJsonParse<T = unknown>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type');

  try {
    // Sprawdź czy response ma JSON content-type
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      // Jeśli nie jest JSON, spróbuj przeczytać jako text
      const text = await response.text();
      console.warn('Non-JSON response:', text);
      return null;
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    return null;
  }
}

/**
 * Parsuje error response z API
 * Obsługuje zarówno strukturyzowane ApiError jak i proste { error: string }
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();

      // Obsłuż strukturyzowany błąd ApiError: { error: { code, message, ... } }
      if (isApiError(errorData)) {
        return errorData.error.message;
      }

      // Obsłuż prosty błąd: { error: "message" } lub { message: "message" }
      if (typeof errorData.error === 'string') {
        return errorData.error;
      }
      if (typeof errorData.message === 'string') {
        return errorData.message;
      }

      // Fallback
      return `HTTP ${response.status}`;
    } else {
      const text = await response.text();
      return text || `HTTP ${response.status}`;
    }
  } catch (parseError) {
    console.error('Error parsing error response:', parseError);
    return `HTTP ${response.status}`;
  }
}

/**
 * Parsuje error response i zwraca szczegóły błędu
 * Przydatne gdy potrzebujesz więcej informacji niż tylko wiadomość
 */
export async function parseErrorDetails(response: Response): Promise<{
  message: string;
  code?: string;
  category?: string;
  details?: Record<string, unknown>;
}> {
  const contentType = response.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();

      // Obsłuż strukturyzowany błąd ApiError
      if (isApiError(errorData)) {
        return {
          message: errorData.error.message,
          code: errorData.error.code,
          category: errorData.error.category,
          details: errorData.error.details,
        };
      }

      // Obsłuż prosty błąd
      return {
        message: typeof errorData.error === 'string'
          ? errorData.error
          : errorData.message || `HTTP ${response.status}`,
      };
    } else {
      const text = await response.text();
      return { message: text || `HTTP ${response.status}` };
    }
  } catch (parseError) {
    console.error('Error parsing error response:', parseError);
    return { message: `HTTP ${response.status}` };
  }
}
