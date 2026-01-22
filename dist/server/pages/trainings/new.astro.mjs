import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C-0B9Fh3.mjs';
import { $ as $$AppLayout } from '../../chunks/AppLayout_BmmcCXTo.mjs';
import { T as TrainingForm } from '../../chunks/TrainingForm_B3CVnZiW.mjs';
export { renderers } from '../../renderers.mjs';

const $$New = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Dodaj trening" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-xl mx-auto"> <div class="mb-6"> <a href="/trainings" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm lg:text-base font-medium">
&larr; Powrót do listy treningów
</a> </div> <div class="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"> <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dodaj nowy trening</h1> ${renderComponent($$result2, "TrainingForm", TrainingForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/trainings/TrainingForm", "client:component-export": "TrainingForm" })} </div> </div> ` })}`;
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/new.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/new.astro";
const $$url = "/trainings/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
