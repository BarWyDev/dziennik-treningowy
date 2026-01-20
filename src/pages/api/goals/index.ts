import type { APIRoute } from 'astro';
import { db, goals } from '@/lib/db';
import { createGoalSchema } from '@/lib/validations/goal';
import { auth } from '@/lib/auth';
import { eq, and, count } from 'drizzle-orm';

const MAX_ACTIVE_GOALS = 5;

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, session.user.id))
      .orderBy(goals.createdAt);

    return new Response(JSON.stringify(userGoals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check active goals limit
    const [activeCount] = await db
      .select({ count: count() })
      .from(goals)
      .where(
        and(
          eq(goals.userId, session.user.id),
          eq(goals.status, 'active'),
          eq(goals.isArchived, false)
        )
      );

    if (activeCount.count >= MAX_ACTIVE_GOALS) {
      return new Response(
        JSON.stringify({
          error: `Możesz mieć maksymalnie ${MAX_ACTIVE_GOALS} aktywnych celów`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const validation = createGoalSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validation.error.flatten() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { title, description, targetValue, unit, deadline } = validation.data;

    const [newGoal] = await db
      .insert(goals)
      .values({
        userId: session.user.id,
        title,
        description,
        targetValue,
        unit,
        deadline,
        status: 'active',
      })
      .returning();

    return new Response(JSON.stringify(newGoal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
