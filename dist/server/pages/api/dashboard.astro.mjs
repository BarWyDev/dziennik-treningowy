import { d as db, t as trainingTypes, a as trainings, g as goals } from '../../chunks/index_D15ihLaC.mjs';
import { a as auth } from '../../chunks/auth_C5u617DK.mjs';
import { eq, desc, sql, count, and, gte, lte } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = session.user.id;
    const now = /* @__PURE__ */ new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];
    const endOfWeekStr = endOfWeek.toISOString().split("T")[0];
    const recentTrainingsData = await db.select({
      training: trainings,
      trainingType: trainingTypes
    }).from(trainings).leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id)).where(eq(trainings.userId, userId)).orderBy(desc(trainings.date), desc(trainings.createdAt)).limit(5);
    const recentTrainings = recentTrainingsData.map((r) => ({
      ...r.training,
      trainingType: r.trainingType
    }));
    const weekTrainings = await db.select({
      count: count(),
      totalDuration: sql`COALESCE(SUM(${trainings.durationMinutes}), 0)`,
      totalCalories: sql`COALESCE(SUM(${trainings.caloriesBurned}), 0)`
    }).from(trainings).where(
      and(
        eq(trainings.userId, userId),
        gte(trainings.date, startOfWeekStr),
        lte(trainings.date, endOfWeekStr)
      )
    );
    const weekSummary = {
      trainingsCount: weekTrainings[0]?.count || 0,
      totalDuration: weekTrainings[0]?.totalDuration || 0,
      totalCalories: weekTrainings[0]?.totalCalories || 0
    };
    const activeGoals = await db.select().from(goals).where(
      and(
        eq(goals.userId, userId),
        eq(goals.status, "active"),
        eq(goals.isArchived, false)
      )
    ).limit(3);
    const totalStats = await db.select({
      count: count(),
      totalDuration: sql`COALESCE(SUM(${trainings.durationMinutes}), 0)`
    }).from(trainings).where(eq(trainings.userId, userId));
    return new Response(
      JSON.stringify({
        recentTrainings,
        weekSummary,
        activeGoals,
        totalStats: {
          trainingsCount: totalStats[0]?.count || 0,
          totalDuration: totalStats[0]?.totalDuration || 0
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
