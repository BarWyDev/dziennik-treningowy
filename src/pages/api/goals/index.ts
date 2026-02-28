import type { APIRoute } from 'astro';
import { db, goals } from '@/lib/db';
import { createGoalSchema } from '@/lib/validations/goal';
import { eq, and, count } from 'drizzle-orm';
import { requireAuthWithRateLimit, requireAuthWithCSRF, checkHealthConsent, RateLimitPresets } from '@/lib/api-helpers';
import {
  handleUnexpectedError,
  handleDatabaseError,
  handleValidationError,
  createBusinessRuleError,
  ErrorCode,
} from '@/lib/error-handler';

const MAX_ACTIVE_GOALS = 5;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    // Pagination parameters
    const url = new URL(request.url);
    const limitParam = Number(url.searchParams.get('limit')) || 50;
    const offset = Number(url.searchParams.get('offset')) || 0;

    // Enforce max limit of 100
    const limit = Math.min(limitParam, 100);

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, authResult.user.id))
      .orderBy(goals.createdAt)
      .limit(limit)
      .offset(offset);

    return new Response(
      JSON.stringify({
        goals: userGoals,
        pagination: {
          limit,
          offset,
          hasMore: userGoals.length === limit,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching goals');
    }
    return handleUnexpectedError(error, 'goals GET');
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

    // Check active goals limit
    const [activeCount] = await db
      .select({ count: count() })
      .from(goals)
      .where(
        and(
          eq(goals.userId, authResult.user.id),
          eq(goals.status, 'active'),
          eq(goals.isArchived, false)
        )
      );

    if (activeCount.count >= MAX_ACTIVE_GOALS) {
      return createBusinessRuleError(
        ErrorCode.GOAL_LIMIT_EXCEEDED,
        `Możesz mieć maksymalnie ${MAX_ACTIVE_GOALS} aktywnych celów`,
        { currentCount: activeCount.count, maxCount: MAX_ACTIVE_GOALS }
      );
    }

    const body = await request.json();
    const validation = createGoalSchema.safeParse(body);

    if (!validation.success) {
      return handleValidationError(validation);
    }

    const { title, description, targetValue, currentValue, unit, deadline, lowerIsBetter } = validation.data;

    const [newGoal] = await db
      .insert(goals)
      .values({
        userId: authResult.user.id,
        title,
        description,
        targetValue,
        currentValue: currentValue || 0,
        unit,
        deadline,
        lowerIsBetter: lowerIsBetter ?? false,
        status: 'active',
      })
      .returning();

    return new Response(JSON.stringify(newGoal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query') || error.message.includes('constraint'))) {
      return handleDatabaseError(error, 'creating goal');
    }
    return handleUnexpectedError(error, 'goals POST');
  }
};
