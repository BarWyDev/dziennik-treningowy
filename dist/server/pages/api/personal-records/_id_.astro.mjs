import { d as db, p as personalRecords } from '../../../chunks/index_D15ihLaC.mjs';
import { u as updatePersonalRecordSchema } from '../../../chunks/personal-record_Cb0TCP_H.mjs';
import { a as auth } from '../../../chunks/auth_C5u617DK.mjs';
import { and, eq } from 'drizzle-orm';
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
      return new Response(JSON.stringify({ error: "Record ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [record] = await db.select().from(personalRecords).where(and(eq(personalRecords.id, id), eq(personalRecords.userId, session.user.id)));
    if (!record) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(record), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching personal record:", error);
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
      return new Response(JSON.stringify({ error: "Record ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const validation = updatePersonalRecordSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validation.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const [existing] = await db.select().from(personalRecords).where(and(eq(personalRecords.id, id), eq(personalRecords.userId, session.user.id)));
    if (!existing) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [updated] = await db.update(personalRecords).set({
      ...validation.data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(personalRecords.id, id)).returning();
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating personal record:", error);
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
      return new Response(JSON.stringify({ error: "Record ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [existing] = await db.select().from(personalRecords).where(and(eq(personalRecords.id, id), eq(personalRecords.userId, session.user.id)));
    if (!existing) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await db.delete(personalRecords).where(eq(personalRecords.id, id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error deleting personal record:", error);
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
