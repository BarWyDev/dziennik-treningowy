import type { APIRoute } from 'astro';
import { db, goals } from '@/lib/db';
import { updateGoalSchema } from '@/lib/validations/goal';
import { eq, and } from 'drizzle-orm';
import { requireAuthWithRateLimit, requireAuthWithCSRF, checkHealthConsent, RateLimitPresets } from '@/lib/api-helpers';
import {
  handleUnexpectedError,
  handleDatabaseError,
  handleValidationError,
  createNotFoundError,
} from '@/lib/error-handler';

export const GET: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Goal ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, authResult.user.id)));

    if (!goal) {
      return createNotFoundError('goal', id);
    }

    return new Response(JSON.stringify(goal), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching goal');
    }
    return handleUnexpectedError(error, 'goals/[id] GET');
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    // Autentykacja + rate limiting + CSRF protection
    const authResult = await requireAuthWithCSRF(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const consentError = await checkHealthConsent(authResult.user.id);
    if (consentError) return consentError;

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Goal ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const validation = updateGoalSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    const [updated] = await db
      .update(goals)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, id), eq(goals.userId, authResult.user.id)))
      .returning();

    if (!updated) {
      return createNotFoundError('goal', id);
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'updating goal');
    }
    return handleUnexpectedError(error, 'goals/[id] PUT');
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
      return new Response(JSON.stringify({ error: 'Goal ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [deleted] = await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, authResult.user.id)))
      .returning({ id: goals.id });

    if (!deleted) {
      return createNotFoundError('goal', id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'deleting goal');
    }
    return handleUnexpectedError(error, 'goals/[id] DELETE');
  }
};
