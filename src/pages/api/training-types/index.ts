import type { APIRoute } from 'astro';
import { db, trainingTypes } from '@/lib/db';
import { createTrainingTypeSchema, trainingTypesQuerySchema } from '@/lib/validations/training-type';
import { eq, or, isNull } from 'drizzle-orm';
import { requireAuthWithRateLimit, requireAuthWithCSRF, RateLimitPresets } from '@/lib/api-helpers';
import { handleUnexpectedError, handleDatabaseError, handleValidationError } from '@/lib/error-handler';
import { parseQueryParamsWithDefaults } from '@/lib/validations/query-params';
import { cache, cacheKeys, CACHE_TTL } from '@/lib/cache';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    // Walidacja query params
    const queryValidation = parseQueryParamsWithDefaults(url.searchParams, trainingTypesQuerySchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { page, limit } = queryValidation.data;
    const cacheKey = cacheKeys.trainingTypes(authResult.user.id, page, limit);

    // Sprawdź cache
    const cached = cache.get<{ data: typeof types; page: number; limit: number }>(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }

    const offset = (page - 1) * limit;

    // Get default types (isDefault = true) and user's custom types
    const types = await db
      .select()
      .from(trainingTypes)
      .where(
        or(
          eq(trainingTypes.isDefault, true),
          eq(trainingTypes.userId, authResult.user.id)
        )
      )
      .orderBy(trainingTypes.name)
      .limit(limit)
      .offset(offset);

    const response = { data: types, page, limit };

    // Zapisz do cache
    cache.set(cacheKey, response, CACHE_TTL.TRAINING_TYPES);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching training types');
    }
    return handleUnexpectedError(error, 'training-types GET');
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const body = await request.json();
    const validation = createTrainingTypeSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    const { name, description, icon } = validation.data;

    const [newType] = await db
      .insert(trainingTypes)
      .values({
        name,
        description,
        icon,
        isDefault: false,
        userId: authResult.user.id,
      })
      .returning();

    // Invalidate cache dla tego użytkownika (wszystkie strony)
    cache.deleteByPattern(cacheKeys.trainingTypesPrefix(authResult.user.id));

    return new Response(JSON.stringify(newType), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'creating training type');
    }
    return handleUnexpectedError(error, 'training-types POST');
  }
};
