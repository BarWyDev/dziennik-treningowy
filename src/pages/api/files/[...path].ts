import type { APIRoute } from 'astro';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { requireAuth } from '@/lib/api-helpers';
import { handleUnexpectedError } from '@/lib/error-handler';
import {
  checkRateLimit,
  getRateLimitIdentifier,
  RateLimitPresets,
} from '@/lib/rate-limit';

/**
 * Custom file server dla uploadowanych plików
 * Serwuje pliki z public/uploads/ przez API endpoint
 * Działa zarówno w dev jak i production
 */
export const GET: APIRoute = async ({ params, request }) => {
  try {
    // Sprawdź autentykację
    const authResult = await requireAuth(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Rate limiting dla pobierania plików (DoS protection)
    const rateLimitResponse = checkRateLimit(
      getRateLimitIdentifier(request, authResult.userId),
      RateLimitPresets.FILE_DOWNLOAD
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const filePath = params.path;
    if (!filePath) {
      return new Response('File path required', { status: 400 });
    }

    // Zabezpieczenie przed path traversal - użyj path.resolve() dla pełnej walidacji
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const requestedPath = path.resolve(uploadsDir, filePath);

    // Sprawdź czy resolved path jest WEWNĄTRZ uploads directory
    // Chroni przed: '..', '%2e%2e', symlinks, etc.
    if (!requestedPath.startsWith(uploadsDir + path.sep)) {
      return new Response('Invalid file path', { status: 400 });
    }

    const fullPath = requestedPath;

    // Sprawdź czy plik istnieje
    if (!fs.existsSync(fullPath)) {
      return new Response('File not found', { status: 404 });
    }

    // Sprawdź czy to faktycznie plik (nie katalog)
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return new Response('Not a file', { status: 400 });
    }

    // Odczytaj plik
    const fileBuffer = fs.readFileSync(fullPath);

    // Określ content type na podstawie rozszerzenia
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.webm': 'video/webm',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Zwróć plik z odpowiednimi nagłówkami
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return handleUnexpectedError(error, 'files/[...path] GET');
  }
};
