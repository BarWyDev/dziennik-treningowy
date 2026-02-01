import type { APIRoute } from 'astro';
import { db, trainingTypes } from '@/lib/db';
import { updateTrainingTypeSchema } from '@/lib/validations/training-type';
import { eq, and } from 'drizzle-orm';
import { requireAuthWithCSRF, RateLimitPresets } from '@/lib/api-helpers';
import {
  handleUnexpectedError,
  handleDatabaseError,
  handleValidationError,
  createNotFoundError,
} from '@/lib/error-handler';

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Training type ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validation = updateTrainingTypeSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    // Check if the training type belongs to the user (not a default type)
    const [existing] = await db
      .select()
      .from(trainingTypes)
      .where(
        and(
          eq(trainingTypes.id, id),
          eq(trainingTypes.userId, authResult.user.id),
          eq(trainingTypes.isDefault, false)
        )
      );

    if (!existing) {
      return createNotFoundError('training-type', id);
    }

    const [updated] = await db
      .update(trainingTypes)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(trainingTypes.id, id))
      .returning();

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'updating training type');
    }
    return handleUnexpectedError(error, 'training-types/[id] PUT');
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Training type ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if the training type belongs to the user (not a default type)
    const [existing] = await db
      .select()
      .from(trainingTypes)
      .where(
        and(
          eq(trainingTypes.id, id),
          eq(trainingTypes.userId, authResult.user.id),
          eq(trainingTypes.isDefault, false)
        )
      );

    if (!existing) {
      return createNotFoundError('training-type', id);
    }

    await db.delete(trainingTypes).where(eq(trainingTypes.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'deleting training type');
    }
    return handleUnexpectedError(error, 'training-types/[id] DELETE');
  }
};
