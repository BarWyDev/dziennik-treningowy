import { p as personalRecords, d as db } from '../../chunks/index_D15ihLaC.mjs';
import { c as createPersonalRecordSchema } from '../../chunks/personal-record_Cb0TCP_H.mjs';
import { a as auth } from '../../chunks/auth_C5u617DK.mjs';
import { desc, eq } from 'drizzle-orm';
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
    const sortBy = url.searchParams.get("sortBy") || "date";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    let orderByClause;
    switch (sortBy) {
      case "activityName":
        orderByClause = sortOrder === "asc" ? personalRecords.activityName : desc(personalRecords.activityName);
        break;
      case "result":
        orderByClause = sortOrder === "asc" ? personalRecords.result : desc(personalRecords.result);
        break;
      case "createdAt":
        orderByClause = sortOrder === "asc" ? personalRecords.createdAt : desc(personalRecords.createdAt);
        break;
      case "date":
      default:
        orderByClause = sortOrder === "asc" ? personalRecords.date : desc(personalRecords.date);
    }
    const records = await db.select().from(personalRecords).where(eq(personalRecords.userId, session.user.id)).orderBy(orderByClause);
    return new Response(JSON.stringify(records), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching personal records:", error);
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
    const validation = createPersonalRecordSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validation.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { activityName, result, unit, date, notes } = validation.data;
    const [newRecord] = await db.insert(personalRecords).values({
      userId: session.user.id,
      activityName,
      result,
      unit,
      date,
      notes: notes || null
    }).returning();
    return new Response(JSON.stringify(newRecord), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating personal record:", error);
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
