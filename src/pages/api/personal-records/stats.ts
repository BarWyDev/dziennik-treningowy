import type { APIRoute } from 'astro';
import { db, personalRecords } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, count, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(personalRecords)
      .where(eq(personalRecords.userId, session.user.id));

    // Last added record
    const [lastRecord] = await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, session.user.id))
      .orderBy(desc(personalRecords.createdAt))
      .limit(1);

    return new Response(
      JSON.stringify({
        totalCount: totalCount.count,
        lastRecord: lastRecord || null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching personal records stats:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
