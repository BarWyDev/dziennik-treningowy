import { e as createComponent, r as renderTemplate, k as renderComponent, l as renderHead } from '../../chunks/astro/server_C-0B9Fh3.mjs';
/* empty css                                        */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { a as signUp } from '../../chunks/auth-client_DMbUkJyp.mjs';
import { r as registerSchema } from '../../chunks/auth_BO8XW5iv.mjs';
import { B as Button } from '../../chunks/Button_DSs3LSd1.mjs';
import { I as Input } from '../../chunks/Input_jnU1wWv_.mjs';
import { L as Label } from '../../chunks/Label_CbQ68ufM.mjs';
import { A as Alert } from '../../chunks/Alert_Bst9GH5v.mjs';
export { renderers } from '../../renderers.mjs';

function RegisterForm() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema)
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name
      });
      if (result.error) {
        setError(result.error.message || "Wystąpił błąd podczas rejestracji");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Wystąpił błąd podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Rejestracja zakończona!", children: /* @__PURE__ */ jsx("p", { children: "Na Twój adres email został wysłany link aktywacyjny. Sprawdź swoją skrzynkę pocztową i kliknij w link, aby aktywować konto." }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm lg:text-base text-gray-600 dark:text-gray-400", children: /* @__PURE__ */ jsx("a", { href: "/auth/login", className: "text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium", children: "Wróć do strony logowania" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", children: error }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "name", required: true, children: "Imię" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "name",
          type: "text",
          autoComplete: "name",
          placeholder: "Jan",
          error: errors.name?.message,
          ...register("name")
        }
      )
    ] }),
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
      /* @__PURE__ */ jsx(Label, { htmlFor: "password", required: true, children: "Hasło" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "password",
          type: "password",
          autoComplete: "new-password",
          placeholder: "••••••••",
          error: errors.password?.message,
          ...register("password")
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400", children: "Min. 8 znaków, wielka i mała litera oraz cyfra" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", required: true, children: "Potwierdź hasło" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "confirmPassword",
          type: "password",
          autoComplete: "new-password",
          placeholder: "••••••••",
          error: errors.confirmPassword?.message,
          ...register("confirmPassword")
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", isLoading, children: "Zarejestruj się" }),
    /* @__PURE__ */ jsxs("p", { className: "text-center text-sm lg:text-base text-gray-600 dark:text-gray-400", children: [
      "Masz już konto?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/auth/login", className: "text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium", children: "Zaloguj się" })
    ] })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Register = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="pl"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Rejestracja - Dziennik Treningowy</title><meta name="description" content="Zarejestruj si\u0119 w Dzienniku Treningowym"><script>
      (function() {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        }
      })();
    <\/script>`, '</head> <body class="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8"> <div class="sm:mx-auto sm:w-full sm:max-w-md"> <h1 class="text-center text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Dziennik Treningowy</h1> <h2 class="mt-6 text-center text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">\nUtw\xF3rz konto\n</h2> </div> <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"> <div class="bg-white dark:bg-[#161b22] py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200 dark:border-gray-800"> ', " </div> </div> </body></html>"])), renderHead(), renderComponent($$result, "RegisterForm", RegisterForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/auth/RegisterForm", "client:component-export": "RegisterForm" }));
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/register.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/register.astro";
const $$url = "/auth/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
