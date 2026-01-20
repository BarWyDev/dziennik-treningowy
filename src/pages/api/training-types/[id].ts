import type { APIRoute } from 'astro';
import { db, trainingTypes } from '@/lib/db';
import { updateTrainingTypeSchema } from '@/lib/validations/training-type';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
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
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validation.error.flatten() }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if the training type belongs to the user (not a default type)
    const [existing] = await db
      .select()
      .from(trainingTypes)
      .where(
        and(
          eq(trainingTypes.id, id),
          eq(trainingTypes.userId, session.user.id),
          eq(trainingTypes.isDefault, false)
        )
      );

    if (!existing) {
      return new Response(
        JSON.stringify({ error: 'Training type not found or cannot be modified' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
    console.error('Error updating training type:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
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
          eq(trainingTypes.userId, session.user.id),
          eq(trainingTypes.isDefault, false)
        )
      );

    if (!existing) {
      return new Response(
        JSON.stringify({ error: 'Training type not found or cannot be deleted' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await db.delete(trainingTypes).where(eq(trainingTypes.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting training type:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
