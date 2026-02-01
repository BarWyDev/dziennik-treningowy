import type { APIRoute } from 'astro';
import { db, trainingTypes } from '@/lib/db';
import { createTrainingTypeSchema } from '@/lib/validations/training-type';
import { eq, or, isNull } from 'drizzle-orm';
import { requireAuthWithRateLimit, requireAuthWithCSRF, RateLimitPresets } from '@/lib/api-helpers';
import { handleUnexpectedError, handleDatabaseError, handleValidationError } from '@/lib/error-handler';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

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
      .orderBy(trainingTypes.name);

    return new Response(JSON.stringify(types), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
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
