/**
 * Helper functions safe for client-side (browser) usage
 * These functions do NOT import any server-side dependencies
 */

/**
 * Bezpiecznie parsuje JSON z response
 * Sprawdza content-type i obsługuje błędy parsowania
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
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
 * Obsługuje zarówno JSON jak i text responses
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      return errorData.error || errorData.message || `HTTP ${response.status}`;
    } else {
      const text = await response.text();
      return text || `HTTP ${response.status}`;
    }
  } catch (parseError) {
    console.error('Error parsing error response:', parseError);
    return `HTTP ${response.status}`;
  }
}
