import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../../chunks/astro/server_C-0B9Fh3.mjs';
import { $ as $$AppLayout } from '../../../chunks/AppLayout_BmmcCXTo.mjs';
import { T as TrainingForm } from '../../../chunks/TrainingForm_B3CVnZiW.mjs';
import { d as db, a as trainings } from '../../../chunks/index_D15ihLaC.mjs';
import { and, eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const $$Edit = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Edit;
  const { id } = Astro2.params;
  const user = Astro2.locals.user;
  if (!id || !user) {
    return Astro2.redirect("/trainings");
  }
  const [training] = await db.select().from(trainings).where(and(eq(trainings.id, id), eq(trainings.userId, user.id)));
  if (!training) {
    return Astro2.redirect("/trainings");
  }
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Edytuj trening" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-xl mx-auto"> <div class="mb-6"> <a${addAttribute(`/trainings/${id}`, "href")} class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm lg:text-base font-medium">
&larr; Powrót do szczegółów
</a> </div> <div class="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"> <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edytuj trening</h1> ${renderComponent($$result2, "TrainingForm", TrainingForm, { "training": training, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/trainings/TrainingForm", "client:component-export": "TrainingForm" })} </div> </div> ` })}`;
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/[id]/edit.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/[id]/edit.astro";
const $$url = "/trainings/[id]/edit";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Edit,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
