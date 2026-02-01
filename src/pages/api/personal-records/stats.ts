import type { APIRoute } from 'astro';
import { db, personalRecords } from '@/lib/db';
import { eq, count, desc } from 'drizzle-orm';
import { requireAuthWithRateLimit, RateLimitPresets } from '@/lib/api-helpers';
import { handleUnexpectedError, handleDatabaseError } from '@/lib/error-handler';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    // Total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(personalRecords)
      .where(eq(personalRecords.userId, authResult.user.id));

    // Last added record
    const [lastRecord] = await db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, authResult.user.id))
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
    if (error instanceof Error && (error.message.includes('database') || error.message.includes('query'))) {
      return handleDatabaseError(error, 'fetching personal records stats');
    }
    return handleUnexpectedError(error, 'personal-records/stats GET');
  }
};
