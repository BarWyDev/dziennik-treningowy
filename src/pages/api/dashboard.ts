import type { APIRoute } from 'astro';
import { db, trainings, trainingTypes, goals, mediaAttachments } from '@/lib/db';
import { eq, and, gte, lte, desc, sql, count, inArray } from 'drizzle-orm';
import { requireAuthWithRateLimit, RateLimitPresets } from '@/lib/api-helpers';
import { handleUnexpectedError, handleDatabaseError } from '@/lib/error-handler';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Autentykacja + rate limiting
    const authResult = await requireAuthWithRateLimit(request, RateLimitPresets.API);
    if (!authResult.success) {
      return authResult.response;
    }

    const userId = authResult.user.id;

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

    // Week summary
    const weekTrainings = await db
      .select({
        count: count(),
        totalDuration: sql<number>`COALESCE(SUM(${trainings.durationMinutes}), 0)`,
        totalCalories: sql<number>`COALESCE(SUM(${trainings.caloriesBurned}), 0)`,
      })
      .from(trainings)
      .where(
        and(
          eq(trainings.userId, userId),
          gte(trainings.date, startOfWeekStr),
          lte(trainings.date, endOfWeekStr)
        )
      );

    const weekSummary = {
      trainingsCount: weekTrainings[0]?.count || 0,
      totalDuration: weekTrainings[0]?.totalDuration || 0,
      totalCalories: weekTrainings[0]?.totalCalories || 0,
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

    // Total stats
    const totalStats = await db
      .select({
        count: count(),
        totalDuration: sql<number>`COALESCE(SUM(${trainings.durationMinutes}), 0)`,
      })
      .from(trainings)
      .where(eq(trainings.userId, userId));

    return new Response(
      JSON.stringify({
        recentTrainings,
        weekSummary,
        activeGoals,
        totalStats: {
          trainingsCount: totalStats[0]?.count || 0,
          totalDuration: totalStats[0]?.totalDuration || 0,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Sprawdź czy to błąd bazy danych
    if (error instanceof Error && error.message.includes('database') || error instanceof Error && error.message.includes('query')) {
      return handleDatabaseError(error, 'fetching dashboard data');
    }
    return handleUnexpectedError(error, 'dashboard GET');
  }
};
