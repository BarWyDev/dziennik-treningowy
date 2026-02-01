/**
 * Helper do tworzenia mock Request obiektów dla testów API
 */

interface MockRequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
}

/**
 * Tworzy mock obiektu Request dla testów API
 */
export function createMockRequest(
  url: string = 'http://localhost:4321/api/test',
  options: MockRequestOptions = {}
): Request {
  const { method = 'GET', body, headers = {}, searchParams } = options;

  // Dodaj parametry URL jeśli są
  let fullUrl = url;
  if (searchParams) {
    const params = new URLSearchParams(searchParams);
    fullUrl = `${url}?${params.toString()}`;
  }

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  return new Request(fullUrl, requestInit);
}

/**
 * Tworzy mock kontekstu API Route dla Astro
 */
export function createMockAPIContext(options: MockRequestOptions & { url?: string } = {}) {
  const url = options.url || 'http://localhost:4321/api/test';
  const request = createMockRequest(url, options);
  const urlObj = new URL(url);

  return {
    request,
    url: urlObj,
    params: options.params || {},
    redirect: (path: string) => new Response(null, { status: 302, headers: { Location: path } }),
    locals: {} as Record<string, unknown>,
  };
}

/**
 * Parsuje odpowiedź JSON z Response
 */
export async function parseJsonResponse<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

/**
 * Helper do generowania losowego UUID (do testów)
 */
export function generateTestId(): string {
  return 'test-' + Math.random().toString(36).substring(2, 15);
}
