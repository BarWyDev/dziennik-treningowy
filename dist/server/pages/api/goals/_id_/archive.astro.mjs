import { d as db, g as goals } from '../../../../chunks/index_D15ihLaC.mjs';
import { a as auth } from '../../../../chunks/auth_C5u617DK.mjs';
import { and, eq } from 'drizzle-orm';
export { renderers } from '../../../../renderers.mjs';

const PATCH = async ({ request, params }) => {
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
      return new Response(JSON.stringify({ error: "Goal ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [existing] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, session.user.id)));
    if (!existing) {
      return new Response(JSON.stringify({ error: "Goal not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [updated] = await db.update(goals).set({
      isArchived: true,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(goals.id, id)).returning();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error archiving goal:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
