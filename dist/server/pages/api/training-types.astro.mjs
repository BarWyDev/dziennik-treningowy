import { d as db, t as trainingTypes } from '../../chunks/index_D15ihLaC.mjs';
import { c as createTrainingTypeSchema } from '../../chunks/training-type_BVOdu_Mh.mjs';
import { a as auth } from '../../chunks/auth_C5u617DK.mjs';
import { or, eq } from 'drizzle-orm';
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
    const types = await db.select().from(trainingTypes).where(
      or(
        eq(trainingTypes.isDefault, true),
        eq(trainingTypes.userId, session.user.id)
      )
    ).orderBy(trainingTypes.name);
    return new Response(JSON.stringify(types), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching training types:", error);
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
    const validation = createTrainingTypeSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validation.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { name, description, icon } = validation.data;
    const [newType] = await db.insert(trainingTypes).values({
      name,
      description,
      icon,
      isDefault: false,
      userId: session.user.id
    }).returning();
    return new Response(JSON.stringify(newType), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating training type:", error);
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
