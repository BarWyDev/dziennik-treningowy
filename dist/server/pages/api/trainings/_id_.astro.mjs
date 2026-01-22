import { d as db, t as trainingTypes, a as trainings } from '../../../chunks/index_D15ihLaC.mjs';
import { u as updateTrainingSchema } from '../../../chunks/training_DZ_Fq8pO.mjs';
import { a as auth } from '../../../chunks/auth_C5u617DK.mjs';
import { eq, and } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Training ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [result] = await db.select({
      training: trainings,
      trainingType: trainingTypes
    }).from(trainings).leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id)).where(and(eq(trainings.id, id), eq(trainings.userId, session.user.id)));
    if (!result) {
      return new Response(JSON.stringify({ error: "Training not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = {
      ...result.training,
      trainingType: result.trainingType
    };
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching training:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PUT = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Training ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const validation = updateTrainingSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validation.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const [existing] = await db.select().from(trainings).where(and(eq(trainings.id, id), eq(trainings.userId, session.user.id)));
    if (!existing) {
      return new Response(JSON.stringify({ error: "Training not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [updated] = await db.update(trainings).set({
      ...validation.data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(trainings.id, id)).returning();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating training:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Training ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [existing] = await db.select().from(trainings).where(and(eq(trainings.id, id), eq(trainings.userId, session.user.id)));
    if (!existing) {
      return new Response(JSON.stringify({ error: "Training not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await db.delete(trainings).where(eq(trainings.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error deleting training:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
