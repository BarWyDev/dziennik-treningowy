import type { APIRoute } from 'astro';
import { db, goals } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { requireAuthWithCSRF, RateLimitPresets } from '@/lib/api-helpers';
import {
  handleUnexpectedError,
  handleDatabaseError,
  createNotFoundError,
} from '@/lib/error-handler';

export const PATCH: APIRoute = async ({ request, params }) => {
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

    const [updated] = await db
      .update(goals)
      .set({
        isArchived: true,
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
      return handleDatabaseError(error, 'archiving goal');
    }
    return handleUnexpectedError(error, 'goals/[id]/archive PATCH');
  }
};
