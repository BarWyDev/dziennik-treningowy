import type { APIRoute } from 'astro';
import { db, trainings, trainingTypes, mediaAttachments, type MediaAttachment } from '@/lib/db';
import { createTrainingSchema, trainingFiltersQuerySchema } from '@/lib/validations/training';
import { eq, and, gte, lte, desc, inArray } from 'drizzle-orm';
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
    const queryValidation = parseQueryParamsWithDefaults(url.searchParams, trainingFiltersQuerySchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }

    const { startDate, endDate, trainingTypeId, page, limit } = queryValidation.data;
    const offset = (page - 1) * limit;

    const conditions = [eq(trainings.userId, authResult.user.id)];

    // Filtruj puste stringi (mogą pochodzić z query params)
    if (startDate && startDate !== '') {
      conditions.push(gte(trainings.date, startDate));
    }

    if (endDate && endDate !== '') {
      conditions.push(lte(trainings.date, endDate));
    }

    if (trainingTypeId && trainingTypeId !== '') {
      conditions.push(eq(trainings.trainingTypeId, trainingTypeId));
    }

    const results = await db
      .select({
        training: trainings,
        trainingType: trainingTypes,
      })
      .from(trainings)
      .leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id))
      .where(and(...conditions))
      .orderBy(desc(trainings.date), desc(trainings.createdAt))
      .limit(limit)
      .offset(offset);

    // Pobierz media dla wszystkich treningów jednym zapytaniem
    const trainingIds = results.map((r) => r.training.id);
    let allMedia: MediaAttachment[] = [];

    if (trainingIds.length > 0) {
      allMedia = await db
        .select()
        .from(mediaAttachments)
        .where(inArray(mediaAttachments.trainingId, trainingIds));
    }

    // Pogrupuj media według trainingId
    const mediaByTraining = allMedia.reduce((acc, media) => {
      if (!media.trainingId) return acc;
      if (!acc[media.trainingId]) {
        acc[media.trainingId] = [];
      }
      acc[media.trainingId].push(media);
      return acc;
    }, {} as Record<string, typeof allMedia>);

    const data = results.map((r) => ({
      ...r.training,
      trainingType: r.trainingType,
      media: mediaByTraining[r.training.id] || [],
    }));

    return new Response(JSON.stringify({ data, page, limit }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching trainings');
    }
    return handleUnexpectedError(error, 'trainings GET');
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
    const validation = createTrainingSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    const {
      trainingTypeId,
      date,
      time,
      durationMinutes,
      description,
      ratingOverall,
      ratingPhysical,
      ratingEnergy,
      ratingMotivation,
      ratingDifficulty,
      trainingGoal,
      mostSatisfiedWith,
      improveNextTime,
      howToImprove,
      notes,
      caloriesBurned,
      mediaIds,
    } = validation.data;

    // Użyj transakcji aby zapewnić atomiczność operacji
    const newTraining = await db.transaction(async (tx) => {
      const [training] = await tx
        .insert(trainings)
        .values({
          userId: authResult.user.id,
          trainingTypeId,
          date,
          time,
          durationMinutes,
          description,
          ratingOverall,
          ratingPhysical,
          ratingEnergy,
          ratingMotivation,
          ratingDifficulty,
          trainingGoal,
          mostSatisfiedWith,
          improveNextTime,
          howToImprove,
          notes,
          caloriesBurned,
        })
        .returning();

      // Powiąż media z treningiem w tej samej transakcji
      if (mediaIds && mediaIds.length > 0) {
        await tx
          .update(mediaAttachments)
          .set({ trainingId: training.id })
          .where(
            and(
              inArray(mediaAttachments.id, mediaIds),
              eq(mediaAttachments.userId, authResult.user.id)
            )
          )
          .returning();
      }

      return training;
    });

    // Unieważnij cache dashboardu - dane się zmieniły
    cache.delete(cacheKeys.dashboard(authResult.user.id));

    return new Response(JSON.stringify(newTraining), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'creating training');
    }
    return handleUnexpectedError(error, 'trainings POST');
  }
};
