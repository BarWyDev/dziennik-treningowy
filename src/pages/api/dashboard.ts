import type { APIRoute } from 'astro';
import { db, trainings, trainingTypes, goals, mediaAttachments, personalRecords } from '@/lib/db';
import { eq, and, gte, lte, desc, sql, count, inArray } from 'drizzle-orm';
import { requireAuthWithRateLimit, RateLimitPresets } from '@/lib/api-helpers';
import { handleUnexpectedError, handleDatabaseError } from '@/lib/error-handler';
import { cache, cacheKeys, CACHE_TTL } from '@/lib/cache';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const userId = authResult.user.id;
    const cacheKey = cacheKeys.dashboard(userId);

    // Sprawdź cache
    const cached = cache.get<{
      recentTrainings: unknown[];
      weekSummary: { trainingsCount: number; totalDuration: number; totalCalories: number };
      activeGoals: unknown[];
      totalStats: { trainingsCount: number; totalDuration: number };
      personalRecordsStats: { totalCount: number; lastRecord: unknown | null };
      streak: number;
    }>(cacheKey);
    
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }

    // Get current week dates
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

    // Recent trainings (last 5) - Zapytanie 1
    const recentTrainingsData = await db
      .select({
        training: trainings,
        trainingType: trainingTypes,
      })
      .from(trainings)
      .leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id))
      .where(eq(trainings.userId, userId))
      .orderBy(desc(trainings.date), desc(trainings.createdAt))
      .limit(5);

    // Pobierz wszystkie media dla treningów naraz - Zapytanie 2 (zamiast N+1)
    const trainingIds = recentTrainingsData.map((r) => r.training.id);
    const allMedia = trainingIds.length > 0
      ? await db
          .select()
          .from(mediaAttachments)
          .where(inArray(mediaAttachments.trainingId, trainingIds))
      : [];

    // Połącz dane w pamięci (szybkie, bez zapytań do bazy)
    const recentTrainings = recentTrainingsData.map((r) => ({
      ...r.training,
      trainingType: r.trainingType,
      media: allMedia.filter((m) => m.trainingId === r.training.id),
    }));

    // Combined week + total stats query (optimized from 2 queries to 1)
    const [statsResult] = await db
      .select({
        // Week stats
        weekCount: sql<number>`COUNT(*) FILTER (WHERE ${trainings.date} >= ${startOfWeekStr} AND ${trainings.date} <= ${endOfWeekStr})`,
        weekDuration: sql<number>`COALESCE(SUM(${trainings.durationMinutes}) FILTER (WHERE ${trainings.date} >= ${startOfWeekStr} AND ${trainings.date} <= ${endOfWeekStr}), 0)`,
        weekCalories: sql<number>`COALESCE(SUM(${trainings.caloriesBurned}) FILTER (WHERE ${trainings.date} >= ${startOfWeekStr} AND ${trainings.date} <= ${endOfWeekStr}), 0)`,
        // Total stats
        totalCount: count(),
        totalDuration: sql<number>`COALESCE(SUM(${trainings.durationMinutes}), 0)`,
      })
      .from(trainings)
      .where(eq(trainings.userId, userId));

    const weekSummary = {
      trainingsCount: Number(statsResult?.weekCount) || 0,
      totalDuration: Number(statsResult?.weekDuration) || 0,
      totalCalories: Number(statsResult?.weekCalories) || 0,
    };

    // Active goals
    const activeGoals = await db
      .select()
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.status, 'active'),
          eq(goals.isArchived, false)
        )
      )
      .limit(3);

    // Personal records stats
    const [[prCountResult], [lastRecord]] = await Promise.all([
      db.select({ count: count() }).from(personalRecords).where(eq(personalRecords.userId, userId)),
      db.select().from(personalRecords).where(eq(personalRecords.userId, userId)).orderBy(desc(personalRecords.createdAt)).limit(1),
    ]);

    // Training streak (last 365 distinct dates, descending)
    const recentDates = await db
      .selectDistinct({ date: trainings.date })
      .from(trainings)
      .where(eq(trainings.userId, userId))
      .orderBy(desc(trainings.date))
      .limit(365);

    const toDateStr = (d: unknown): string => {
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return String(d);
    };
    const dateSet = new Set(recentDates.map((r) => toDateStr(r.date)));

    const subtractDay = (dateStr: string): string => {
      const [y, m, day] = dateStr.split('-').map(Number);
      const d = new Date(y, m - 1, day);
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const nowLocal = new Date();
    const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
    const yesterdayStr = subtractDay(todayStr);

    let streak = 0;
    let current: string | null = dateSet.has(todayStr) ? todayStr : dateSet.has(yesterdayStr) ? yesterdayStr : null;
    while (current && dateSet.has(current)) {
      streak++;
      current = subtractDay(current);
    }

    const response = {
      recentTrainings,
      weekSummary,
      activeGoals,
      totalStats: {
        trainingsCount: Number(statsResult?.totalCount) || 0,
        totalDuration: Number(statsResult?.totalDuration) || 0,
      },
      personalRecordsStats: {
        totalCount: Number(prCountResult?.count) || 0,
        lastRecord: lastRecord || null,
      },
      streak,
    };

    // Zapisz do cache
    cache.set(cacheKey, response, CACHE_TTL.DASHBOARD);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    // Sprawdź czy to błąd bazy danych
    if (error instanceof Error && error.message.includes('database') || error instanceof Error && error.message.includes('query')) {
      return handleDatabaseError(error, 'fetching dashboard data');
    }
    return handleUnexpectedError(error, 'dashboard GET');
  }
};
