import { d as db, g as goals } from '../../chunks/index_D15ihLaC.mjs';
import { c as createGoalSchema } from '../../chunks/goal_BQtVvuH1.mjs';
import { a as auth } from '../../chunks/auth_C5u617DK.mjs';
import { eq, count, and } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const MAX_ACTIVE_GOALS = 5;
const GET = async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userGoals = await db.select().from(goals).where(eq(goals.userId, session.user.id)).orderBy(goals.createdAt);
    return new Response(JSON.stringify(userGoals), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
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
    const [activeCount] = await db.select({ count: count() }).from(goals).where(
      and(
        eq(goals.userId, session.user.id),
        eq(goals.status, "active"),
        eq(goals.isArchived, false)
      )
    );
    if (activeCount.count >= MAX_ACTIVE_GOALS) {
      return new Response(
        JSON.stringify({
          error: `Możesz mieć maksymalnie ${MAX_ACTIVE_GOALS} aktywnych celów`
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const body = await request.json();
    const validation = createGoalSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validation.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { title, description, targetValue, unit, deadline } = validation.data;
    const [newGoal] = await db.insert(goals).values({
      userId: session.user.id,
      title,
      description,
      targetValue,
      unit,
      deadline,
      status: "active"
    }).returning();
    return new Response(JSON.stringify(newGoal), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating goal:", error);
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
