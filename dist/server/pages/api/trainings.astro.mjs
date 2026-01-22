import { a as trainings, d as db, t as trainingTypes } from '../../chunks/index_D15ihLaC.mjs';
import { c as createTrainingSchema } from '../../chunks/training_DZ_Fq8pO.mjs';
import { a as auth } from '../../chunks/auth_C5u617DK.mjs';
import { eq, gte, lte, and, desc } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request, url }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const trainingTypeId = url.searchParams.get("trainingTypeId");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;
    const conditions = [eq(trainings.userId, session.user.id)];
    if (startDate) {
      conditions.push(gte(trainings.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(trainings.date, endDate));
    }
    if (trainingTypeId) {
      conditions.push(eq(trainings.trainingTypeId, trainingTypeId));
    }
    const results = await db.select({
      training: trainings,
      trainingType: trainingTypes
    }).from(trainings).leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id)).where(and(...conditions)).orderBy(desc(trainings.date), desc(trainings.createdAt)).limit(limit).offset(offset);
    const data = results.map((r) => ({
      ...r.training,
      trainingType: r.trainingType
    }));
    return new Response(JSON.stringify({ data, page, limit }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const validation = createTrainingSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validation.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const {
      trainingTypeId,
      date,
      time,
      durationMinutes,
      ratingOverall,
      ratingPhysical,
      ratingEnergy,
      ratingMotivation,
      ratingDifficulty,
      trainingGoal,
      mostSatisfiedWith,
      improveNextTime,
      howToImprove,
      notes,
      caloriesBurned
    } = validation.data;
    const [newTraining] = await db.insert(trainings).values({
      userId: session.user.id,
      trainingTypeId,
      date,
      time,
      durationMinutes,
      ratingOverall,
      ratingPhysical,
      ratingEnergy,
      ratingMotivation,
      ratingDifficulty,
      trainingGoal,
      mostSatisfiedWith,
      improveNextTime,
      howToImprove,
      notes,
      caloriesBurned
    }).returning();
    return new Response(JSON.stringify(newTraining), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating training:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
