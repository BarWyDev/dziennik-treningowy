import { e as createComponent, r as renderTemplate, k as renderComponent, l as renderHead } from '../../chunks/astro/server_C-0B9Fh3.mjs';
/* empty css                                        */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { s as signIn } from '../../chunks/auth-client_DMbUkJyp.mjs';
import { l as loginSchema } from '../../chunks/auth_BO8XW5iv.mjs';
import { B as Button } from '../../chunks/Button_DSs3LSd1.mjs';
import { I as Input } from '../../chunks/Input_jnU1wWv_.mjs';
import { L as Label } from '../../chunks/Label_CbQ68ufM.mjs';
import { A as Alert } from '../../chunks/Alert_Bst9GH5v.mjs';
export { renderers } from '../../renderers.mjs';

function LoginForm() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password
      });
      if (result.error) {
        setError(result.error.message || "Wystąpił błąd podczas logowania");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", children: error }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "email", required: true, children: "Email" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "email",
          type: "email",
          autoComplete: "email",
          placeholder: "jan@example.com",
          error: errors.email?.message,
          ...register("email")
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", required: true, children: "Hasło" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/auth/forgot-password",
            className: "text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300",
            children: "Zapomniałeś hasła?"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "password",
          type: "password",
          autoComplete: "current-password",
          placeholder: "••••••••",
          error: errors.password?.message,
          ...register("password")
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", isLoading, children: "Zaloguj się" }),
    /* @__PURE__ */ jsxs("p", { className: "text-center text-sm lg:text-base text-gray-600 dark:text-gray-400", children: [
      "Nie masz konta?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/auth/register", className: "text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium", children: "Zarejestruj się" })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="pl"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Logowanie - Dziennik Treningowy</title><meta name="description" content="Zaloguj si\u0119 do Dziennika Treningowego"><script>
      (function() {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        }
      })();
    <\/script>`, '</head> <body class="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8"> <div class="sm:mx-auto sm:w-full sm:max-w-md"> <h1 class="text-center text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Dziennik Treningowy</h1> <h2 class="mt-6 text-center text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">\nZaloguj si\u0119\n</h2> </div> <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"> <div class="bg-white dark:bg-[#161b22] py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200 dark:border-gray-800"> ', " </div> </div> </body></html>"])), renderHead(), renderComponent($$result, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/auth/LoginForm", "client:component-export": "LoginForm" }));
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/login.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/login.astro";
const $$url = "/auth/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
