import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { sql, count } from 'drizzle-orm';
import { users, trainings, goals, personalRecords } from '@/lib/db/schema';

const APP_VERSION = '0.0.1';

const toMB = (bytes: number) => Math.round((bytes / 1024 / 1024) * 10) / 10;

export const GET: APIRoute = async () => {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - start;

    const [usersCount, trainingsCount, goalsCount, recordsCount] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(trainings),
      db.select({ count: count() }).from(goals),
      db.select({ count: count() }).from(personalRecords),
    ]);

    const mem = process.memoryUsage();

    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        env: process.env.NODE_ENV ?? 'unknown',
        uptime: Math.floor(process.uptime()),
        memory: {
          heapUsedMb: toMB(mem.heapUsed),
          heapTotalMb: toMB(mem.heapTotal),
          rssMb: toMB(mem.rss),
        },
        db: {
          status: 'ok',
          latencyMs: dbLatency,
        },
        stats: {
          users: Number(usersCount[0].count),
          trainings: Number(trainingsCount[0].count),
          goals: Number(goalsCount[0].count),
          personalRecords: Number(recordsCount[0].count),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        env: process.env.NODE_ENV ?? 'unknown',
        db: { status: 'error' },
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
