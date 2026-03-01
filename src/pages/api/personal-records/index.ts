import type { APIRoute } from 'astro';
import { db, personalRecords, mediaAttachments, type MediaAttachment } from '@/lib/db';
import { createPersonalRecordSchema, personalRecordsQuerySchema } from '@/lib/validations/personal-record';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { requireAuthWithRateLimit, requireAuthWithCSRF, checkHealthConsent, RateLimitPresets } from '@/lib/api-helpers';
import {
  handleUnexpectedError,
  handleDatabaseError,
  handleValidationError,
} from '@/lib/error-handler';
import { parseQueryParamsWithDefaults } from '@/lib/validations/query-params';
import { cache, cacheKeys } from '@/lib/cache';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    // Walidacja query params
    const queryValidation = parseQueryParamsWithDefaults(url.searchParams, personalRecordsQuerySchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { sortBy, sortOrder, page, limit } = queryValidation.data;
    const offset = (page - 1) * limit;

    // Build order by clause
    let orderByClause;
    switch (sortBy) {
      case 'activityName':
        orderByClause = sortOrder === 'asc' ? personalRecords.activityName : desc(personalRecords.activityName);
        break;
      case 'result':
        orderByClause = sortOrder === 'asc' ? personalRecords.result : desc(personalRecords.result);
        break;
      case 'createdAt':
        orderByClause = sortOrder === 'asc' ? personalRecords.createdAt : desc(personalRecords.createdAt);
        break;
      case 'date':
      default:
        orderByClause = sortOrder === 'asc' ? personalRecords.date : desc(personalRecords.date);
    }

    const records = await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, authResult.user.id))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Pobierz media dla wszystkich rekordów jednym zapytaniem
    const recordIds = records.map((r) => r.id);
    let allMedia: MediaAttachment[] = [];

    if (recordIds.length > 0) {
      allMedia = await db
        .select()
        .from(mediaAttachments)
        .where(inArray(mediaAttachments.personalRecordId, recordIds));
    }

    // Pogrupuj media według personalRecordId
    const mediaByRecord = allMedia.reduce((acc, media) => {
      if (!media.personalRecordId) return acc;
      if (!acc[media.personalRecordId]) {
        acc[media.personalRecordId] = [];
      }
      acc[media.personalRecordId].push(media);
      return acc;
    }, {} as Record<string, typeof allMedia>);

    const recordsWithMedia = records.map((record) => ({
      ...record,
      media: mediaByRecord[record.id] || [],
    }));

    return new Response(JSON.stringify({ data: recordsWithMedia, page, limit }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching personal records');
    }
    return handleUnexpectedError(error, 'personal-records GET');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const consentError = await checkHealthConsent(authResult.user.id);
    if (consentError) return consentError;

    const body = await request.json();
    const validation = createPersonalRecordSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    const { activityName, result, unit, date, notes, mediaIds } = validation.data;

    // Użyj transakcji aby zapewnić atomiczność operacji
    const newRecord = await db.transaction(async (tx) => {
      const [record] = await tx
        .insert(personalRecords)
        .values({
          userId: authResult.user.id,
          activityName,
          result,
          unit,
          date,
          notes: notes || null,
        })
        .returning();

      // Powiąż media z rekordem w tej samej transakcji
      if (mediaIds && mediaIds.length > 0) {
        await tx
          .update(mediaAttachments)
          .set({ personalRecordId: record.id })
          .where(
            and(
              inArray(mediaAttachments.id, mediaIds),
              eq(mediaAttachments.userId, authResult.user.id)
            )
          );
      }

      return record;
    });

    cache.delete(cacheKeys.dashboard(authResult.user.id));

    return new Response(JSON.stringify(newRecord), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'creating personal record');
    }
    return handleUnexpectedError(error, 'personal-records POST');
  }
};
