import type { APIRoute } from 'astro';
import { db, trainings, trainingTypes } from '@/lib/db';
import { createTrainingSchema } from '@/lib/validations/training';
import { auth } from '@/lib/auth';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const trainingTypeId = url.searchParams.get('trainingTypeId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const conditions = [eq(trainings.userId, session.user.id)];

    if (startDate) {
      conditions.push(gte(trainings.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(trainings.date, endDate));
    }

    if (trainingTypeId) {
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

    const data = results.map((r) => ({
      ...r.training,
      trainingType: r.trainingType,
    }));

    return new Response(JSON.stringify({ data, page, limit }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching trainings:', error);
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

    const body = await request.json();
    const validation = createTrainingSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validation.error.flatten() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { trainingTypeId, date, durationMinutes, notes, rating, caloriesBurned } =
      validation.data;

    const [newTraining] = await db
      .insert(trainings)
      .values({
        userId: session.user.id,
        trainingTypeId,
        date,
        durationMinutes,
        notes,
        rating,
        caloriesBurned,
      })
      .returning();

    return new Response(JSON.stringify(newTraining), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating training:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
