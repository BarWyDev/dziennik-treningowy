import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - start;

    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: { status: 'ok', latencyMs: dbLatency },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        db: { status: 'error' },
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
