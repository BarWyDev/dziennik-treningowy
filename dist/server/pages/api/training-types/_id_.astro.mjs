import { d as db, t as trainingTypes } from '../../../chunks/index_D15ihLaC.mjs';
import { u as updateTrainingTypeSchema } from '../../../chunks/training-type_BVOdu_Mh.mjs';
import { a as auth } from '../../../chunks/auth_C5u617DK.mjs';
import { and, eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

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
      return new Response(JSON.stringify({ error: "Training type ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const validation = updateTrainingTypeSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validation.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const [existing] = await db.select().from(trainingTypes).where(
      and(
        eq(trainingTypes.id, id),
        eq(trainingTypes.userId, session.user.id),
        eq(trainingTypes.isDefault, false)
      )
    );
    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Training type not found or cannot be modified" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const [updated] = await db.update(trainingTypes).set({
      ...validation.data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(trainingTypes.id, id)).returning();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating training type:", error);
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
      return new Response(JSON.stringify({ error: "Training type ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [existing] = await db.select().from(trainingTypes).where(
      and(
        eq(trainingTypes.id, id),
        eq(trainingTypes.userId, session.user.id),
        eq(trainingTypes.isDefault, false)
      )
    );
    if (!existing) {
      return new Response(
        JSON.stringify({ error: "Training type not found or cannot be deleted" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    await db.delete(trainingTypes).where(eq(trainingTypes.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error deleting training type:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
