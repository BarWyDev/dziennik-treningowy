/**
 * Error Handler Utility
 * 
 * Zapewnia strukturyzowaną obsługę błędów z kategoriami i kodami.
 * Ułatwia debugowanie i zapewnia spójne odpowiedzi API.
 */

// Kategorie błędów
export enum ErrorCategory {
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE',
  RATE_LIMIT = 'RATE_LIMIT',
  CSRF = 'CSRF',
  FILE_UPLOAD = 'FILE_UPLOAD',
  BUSINESS_RULE = 'BUSINESS_RULE',
  INTERNAL = 'INTERNAL',
}

// Kody błędów dla każdej kategorii
export enum ErrorCode {
  // AUTH (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  
  // VALIDATION (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // NOT_FOUND (404)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  TRAINING_NOT_FOUND = 'TRAINING_NOT_FOUND',
  GOAL_NOT_FOUND = 'GOAL_NOT_FOUND',
  PERSONAL_RECORD_NOT_FOUND = 'PERSONAL_RECORD_NOT_FOUND',
  TRAINING_TYPE_NOT_FOUND = 'TRAINING_TYPE_NOT_FOUND',
  MEDIA_NOT_FOUND = 'MEDIA_NOT_FOUND',
  
  // DATABASE (500)
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // RATE_LIMIT (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // CSRF (403)
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  INVALID_ORIGIN = 'INVALID_ORIGIN',
  
  // FILE_UPLOAD (400)
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // BUSINESS_RULE (400)
  GOAL_LIMIT_EXCEEDED = 'GOAL_LIMIT_EXCEEDED',
  MEDIA_LIMIT_EXCEEDED = 'MEDIA_LIMIT_EXCEEDED',
  RESOURCE_OWNERSHIP_MISMATCH = 'RESOURCE_OWNERSHIP_MISMATCH',
  DEFAULT_RESOURCE_DELETE = 'DEFAULT_RESOURCE_DELETE',
  
  // INTERNAL (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

// Struktura błędu API
export interface ApiError {
  error: {
    code: ErrorCode;
    category: ErrorCategory;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
    requestId?: string;
  };
}

// Mapowanie kodów błędów do kategorii
const errorCodeToCategory: Record<ErrorCode, ErrorCategory> = {
  // AUTH
  [ErrorCode.UNAUTHORIZED]: ErrorCategory.AUTH,
  [ErrorCode.SESSION_EXPIRED]: ErrorCategory.AUTH,
  [ErrorCode.INVALID_CREDENTIALS]: ErrorCategory.AUTH,
  [ErrorCode.EMAIL_NOT_VERIFIED]: ErrorCategory.AUTH,
  
  // VALIDATION
  [ErrorCode.VALIDATION_ERROR]: ErrorCategory.VALIDATION,
  [ErrorCode.INVALID_INPUT]: ErrorCategory.VALIDATION,
  [ErrorCode.MISSING_REQUIRED_FIELD]: ErrorCategory.VALIDATION,
  [ErrorCode.INVALID_FORMAT]: ErrorCategory.VALIDATION,
  
  // NOT_FOUND
  [ErrorCode.RESOURCE_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCode.TRAINING_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCode.GOAL_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCode.PERSONAL_RECORD_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCode.TRAINING_TYPE_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  [ErrorCode.MEDIA_NOT_FOUND]: ErrorCategory.NOT_FOUND,
  
  // DATABASE
  [ErrorCode.DATABASE_ERROR]: ErrorCategory.DATABASE,
  [ErrorCode.QUERY_FAILED]: ErrorCategory.DATABASE,
  [ErrorCode.TRANSACTION_FAILED]: ErrorCategory.DATABASE,
  [ErrorCode.CONSTRAINT_VIOLATION]: ErrorCategory.DATABASE,
  
  // RATE_LIMIT
  [ErrorCode.RATE_LIMIT_EXCEEDED]: ErrorCategory.RATE_LIMIT,
  
  // CSRF
  [ErrorCode.CSRF_TOKEN_INVALID]: ErrorCategory.CSRF,
  [ErrorCode.INVALID_ORIGIN]: ErrorCategory.CSRF,
  
  // FILE_UPLOAD
  [ErrorCode.FILE_TOO_LARGE]: ErrorCategory.FILE_UPLOAD,
  [ErrorCode.INVALID_FILE_TYPE]: ErrorCategory.FILE_UPLOAD,
  [ErrorCode.UPLOAD_FAILED]: ErrorCategory.FILE_UPLOAD,
  [ErrorCode.STORAGE_ERROR]: ErrorCategory.FILE_UPLOAD,
  
  // BUSINESS_RULE
  [ErrorCode.GOAL_LIMIT_EXCEEDED]: ErrorCategory.BUSINESS_RULE,
  [ErrorCode.MEDIA_LIMIT_EXCEEDED]: ErrorCategory.BUSINESS_RULE,
  [ErrorCode.RESOURCE_OWNERSHIP_MISMATCH]: ErrorCategory.BUSINESS_RULE,
  [ErrorCode.DEFAULT_RESOURCE_DELETE]: ErrorCategory.BUSINESS_RULE,
  
  // INTERNAL
  [ErrorCode.INTERNAL_ERROR]: ErrorCategory.INTERNAL,
  [ErrorCode.UNEXPECTED_ERROR]: ErrorCategory.INTERNAL,
};

// Mapowanie kategorii do kodów HTTP
const categoryToHttpStatus: Record<ErrorCategory, number> = {
  [ErrorCategory.AUTH]: 401,
  [ErrorCategory.VALIDATION]: 400,
  [ErrorCategory.NOT_FOUND]: 404,
  [ErrorCategory.DATABASE]: 500,
  [ErrorCategory.RATE_LIMIT]: 429,
  [ErrorCategory.CSRF]: 403,
  [ErrorCategory.FILE_UPLOAD]: 400,
  [ErrorCategory.BUSINESS_RULE]: 400,
  [ErrorCategory.INTERNAL]: 500,
};

// Poziomy logowania
enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

/**
 * Logger z poziomami (prosty, można zastąpić pino/winston w przyszłości)
 */
function log(level: LogLevel, message: string, error?: unknown, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  const errorStr = error instanceof Error ? ` ${error.message}${error.stack ? `\n${error.stack}` : ''}` : '';
  
  // W produkcji można użyć właściwego loggera
  if (import.meta.env.PROD) {
    // W produkcji loguj tylko ERROR i WARN
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      console.error(`[${timestamp}] [${level}] ${message}${contextStr}${errorStr}`);
    }
  } else {
    // W development loguj wszystko
    const logFn = level === LogLevel.ERROR ? console.error : level === LogLevel.WARN ? console.warn : console.log;
    logFn(`[${timestamp}] [${level}] ${message}${contextStr}${errorStr}`);
  }
}

/**
 * Tworzy strukturę błędu API
 */
function createApiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): ApiError {
  const category = errorCodeToCategory[code];
  
  return {
    error: {
      code,
      category,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

/**
 * Tworzy Response z błędem API
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): Response {
  const category = errorCodeToCategory[code];
  const status = categoryToHttpStatus[category];
  const apiError = createApiError(code, message, details, requestId);
  
  // Loguj błąd
  const logLevel = status >= 500 ? LogLevel.ERROR : LogLevel.WARN;
  log(logLevel, `API Error: ${code}`, undefined, { code, category, status, details });
  
  return new Response(JSON.stringify(apiError), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Obsługuje nieoczekiwane błędy (catch blocks)
 */
export function handleUnexpectedError(
  error: unknown,
  context?: string,
  requestId?: string
): Response {
  // Loguj pełny błąd
  log(LogLevel.ERROR, `Unexpected error${context ? ` in ${context}` : ''}`, error, {
    context,
    requestId,
  });
  
  // W produkcji nie ujawniaj szczegółów błędu
  const message = import.meta.env.PROD
    ? 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.'
    : error instanceof Error
    ? error.message
    : 'Wystąpił nieoczekiwany błąd';
  
  const details = import.meta.env.PROD
    ? undefined
    : error instanceof Error
    ? { stack: error.stack, name: error.name }
    : { error: String(error) };
  
  return createErrorResponse(ErrorCode.UNEXPECTED_ERROR, message, details, requestId);
}

/**
 * Obsługuje błędy walidacji Zod
 */
export function handleValidationError(
  validationError: { error: { flatten: () => { fieldErrors: Record<string, string[]> } } },
  requestId?: string
): Response {
  const flattened = validationError.error.flatten();
  
  return createErrorResponse(
    ErrorCode.VALIDATION_ERROR,
    'Błąd walidacji danych',
    { fieldErrors: flattened.fieldErrors },
    requestId
  );
}

/**
 * Obsługuje błędy bazy danych
 */
export function handleDatabaseError(
  error: unknown,
  operation: string,
  requestId?: string
): Response {
  log(LogLevel.ERROR, `Database error during ${operation}`, error, { operation, requestId });
  
  const message = import.meta.env.PROD
    ? 'Błąd podczas operacji na bazie danych'
    : error instanceof Error
    ? `Database error: ${error.message}`
    : 'Błąd podczas operacji na bazie danych';
  
  return createErrorResponse(
    ErrorCode.DATABASE_ERROR,
    message,
    import.meta.env.PROD ? undefined : { operation, error: String(error) },
    requestId
  );
}

/**
 * Helper do tworzenia błędów NOT_FOUND
 */
export function createNotFoundError(
  resourceType: 'training' | 'goal' | 'personal-record' | 'training-type' | 'media' | 'resource',
  id?: string,
  requestId?: string
): Response {
  const codeMap: Record<string, ErrorCode> = {
    training: ErrorCode.TRAINING_NOT_FOUND,
    goal: ErrorCode.GOAL_NOT_FOUND,
    'personal-record': ErrorCode.PERSONAL_RECORD_NOT_FOUND,
    'training-type': ErrorCode.TRAINING_TYPE_NOT_FOUND,
    media: ErrorCode.MEDIA_NOT_FOUND,
    resource: ErrorCode.RESOURCE_NOT_FOUND,
  };
  
  const code = codeMap[resourceType] || ErrorCode.RESOURCE_NOT_FOUND;
  const message = id
    ? `${resourceType} o ID ${id} nie został znaleziony`
    : `${resourceType} nie został znaleziony`;
  
  return createErrorResponse(code, message, { resourceType, id }, requestId);
}

/**
 * Helper do tworzenia błędów autoryzacji
 */
export function createUnauthorizedError(message = 'Brak autoryzacji', requestId?: string): Response {
  return createErrorResponse(ErrorCode.UNAUTHORIZED, message, undefined, requestId);
}

/**
 * Helper do tworzenia błędów business rules
 */
export function createBusinessRuleError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): Response {
  return createErrorResponse(code, message, details, requestId);
}

/**
 * Wrapper dla API routes - automatycznie obsługuje błędy
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Generuj requestId (można użyć UUID w przyszłości)
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return handleUnexpectedError(error, context, requestId);
    }
  }) as T;
}
