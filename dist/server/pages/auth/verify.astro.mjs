import { e as createComponent, f as createAstro, r as renderTemplate, k as renderComponent, l as renderHead } from '../../chunks/astro/server_C-0B9Fh3.mjs';
/* empty css                                        */
import { A as Alert } from '../../chunks/Alert_Bst9GH5v.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Verify = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Verify;
  const error = Astro2.url.searchParams.get("error");
  const success = !error;
  return renderTemplate(_a || (_a = __template([`<html lang="pl"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Weryfikacja email - Dziennik Treningowy</title><script>
      (function() {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        }
      })();
    <\/script>`, '</head> <body class="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8"> <div class="sm:mx-auto sm:w-full sm:max-w-md"> <h1 class="text-center text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Dziennik Treningowy</h1> <h2 class="mt-6 text-center text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">\nWeryfikacja email\n</h2> </div> <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"> <div class="bg-white dark:bg-[#161b22] py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200 dark:border-gray-800"> ', " </div> </div> </body></html>"])), renderHead(), success ? renderTemplate`<div class="text-center"> ${renderComponent($$result, "Alert", Alert, { "variant": "success", "title": "Email zweryfikowany!" }, { "default": ($$result2) => renderTemplate` <p>Twój adres email został pomyślnie zweryfikowany. Możesz się teraz zalogować.</p> ` })} <a href="/auth/login" class="mt-6 inline-block text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium text-sm lg:text-base">
Przejdź do logowania
</a> </div>` : renderTemplate`<div class="text-center"> ${renderComponent($$result, "Alert", Alert, { "variant": "error", "title": "B\u0142\u0105d weryfikacji" }, { "default": ($$result2) => renderTemplate` <p> ${error === "expired" ? "Link weryfikacyjny wygas\u0142. Zaloguj si\u0119, aby otrzyma\u0107 nowy link." : "Wyst\u0105pi\u0142 b\u0142\u0105d podczas weryfikacji. Spr\xF3buj ponownie lub skontaktuj si\u0119 z pomoc\u0105."} </p> ` })} <a href="/auth/login" class="mt-6 inline-block text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium text-sm lg:text-base">
Przejdź do logowania
</a> </div>`);
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/verify.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/verify.astro";
const $$url = "/auth/verify";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Verify,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
