import { d as db, p as personalRecords } from '../../../chunks/index_D15ihLaC.mjs';
import { a as auth } from '../../../chunks/auth_C5u617DK.mjs';
import { count, eq, desc } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [totalCount] = await db.select({ count: count() }).from(personalRecords).where(eq(personalRecords.userId, session.user.id));
    const [lastRecord] = await db.select().from(personalRecords).where(eq(personalRecords.userId, session.user.id)).orderBy(desc(personalRecords.createdAt)).limit(1);
    return new Response(
      JSON.stringify({
        totalCount: totalCount.count,
        lastRecord: lastRecord || null
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error fetching personal records stats:", error);
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
