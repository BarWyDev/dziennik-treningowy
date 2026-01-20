import type { APIRoute } from 'astro';
import { db, trainingTypes } from '@/lib/db';
import { createTrainingTypeSchema } from '@/lib/validations/training-type';
import { auth } from '@/lib/auth';
import { eq, or, isNull } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get default types (isDefault = true) and user's custom types
    const types = await db
      .select()
      .from(trainingTypes)
      .where(
        or(
          eq(trainingTypes.isDefault, true),
          eq(trainingTypes.userId, session.user.id)
        )
      )
      .orderBy(trainingTypes.name);

    return new Response(JSON.stringify(types), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching training types:', error);
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
    const validation = createTrainingTypeSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validation.error.flatten() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { name, description, icon } = validation.data;

    const [newType] = await db
      .insert(trainingTypes)
      .values({
        name,
        description,
        icon,
        isDefault: false,
        userId: session.user.id,
      })
      .returning();

    return new Response(JSON.stringify(newType), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating training type:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
