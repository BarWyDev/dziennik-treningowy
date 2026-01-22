import type { APIRoute } from 'astro';
import { db, personalRecords } from '@/lib/db';
import { createPersonalRecordSchema } from '@/lib/validations/personal-record';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sortBy = url.searchParams.get('sortBy') || 'date';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

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
      .where(eq(personalRecords.userId, session.user.id))
      .orderBy(orderByClause);

    return new Response(JSON.stringify(records), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching personal records:', error);
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
    const validation = createPersonalRecordSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validation.error.flatten() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { activityName, result, unit, date, notes } = validation.data;

    const [newRecord] = await db
      .insert(personalRecords)
      .values({
        userId: session.user.id,
        activityName,
        result,
        unit,
        date,
        notes: notes || null,
      })
      .returning();

    return new Response(JSON.stringify(newRecord), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating personal record:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
