import { e as createComponent, r as renderTemplate, k as renderComponent, l as renderHead } from '../../chunks/astro/server_C-0B9Fh3.mjs';
/* empty css                                        */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { f as forgetPassword } from '../../chunks/auth-client_DMbUkJyp.mjs';
import { f as forgotPasswordSchema } from '../../chunks/auth_BO8XW5iv.mjs';
import { B as Button } from '../../chunks/Button_DSs3LSd1.mjs';
import { I as Input } from '../../chunks/Input_jnU1wWv_.mjs';
import { L as Label } from '../../chunks/Label_CbQ68ufM.mjs';
import { A as Alert } from '../../chunks/Alert_Bst9GH5v.mjs';
export { renderers } from '../../renderers.mjs';

function ForgotPasswordForm() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await forgetPassword({
        email: data.email,
        redirectTo: "/auth/reset-password"
      });
      if (result.error) {
        setError(result.error.message || "Wystąpił błąd");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Wystąpił błąd podczas wysyłania emaila");
    } finally {
      setIsLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Email wysłany!", children: /* @__PURE__ */ jsx("p", { children: "Jeśli konto z podanym adresem email istnieje, otrzymasz wiadomość z linkiem do resetowania hasła." }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 text-sm lg:text-base text-gray-600 dark:text-gray-400", children: /* @__PURE__ */ jsx("a", { href: "/auth/login", className: "text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium", children: "Wróć do strony logowania" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", children: error }),
    /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400", children: "Podaj swój adres email, a wyślemy Ci link do resetowania hasła." }),
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
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", isLoading, children: "Wyślij link resetujący" }),
    /* @__PURE__ */ jsx("p", { className: "text-center text-sm lg:text-base text-gray-600 dark:text-gray-400", children: /* @__PURE__ */ jsx("a", { href: "/auth/login", className: "text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium", children: "Wróć do logowania" }) })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$ForgotPassword = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="pl"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Resetowanie has\u0142a - Dziennik Treningowy</title><meta name="description" content="Zresetuj has\u0142o do Dziennika Treningowego"><script>
      (function() {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        }
      })();
    <\/script>`, '</head> <body class="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8"> <div class="sm:mx-auto sm:w-full sm:max-w-md"> <h1 class="text-center text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Dziennik Treningowy</h1> <h2 class="mt-6 text-center text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">\nZapomnia\u0142e\u015B has\u0142a?\n</h2> </div> <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"> <div class="bg-white dark:bg-[#161b22] py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200 dark:border-gray-800"> ', " </div> </div> </body></html>"])), renderHead(), renderComponent($$result, "ForgotPasswordForm", ForgotPasswordForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/auth/ForgotPasswordForm", "client:component-export": "ForgotPasswordForm" }));
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/forgot-password.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/forgot-password.astro";
const $$url = "/auth/forgot-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ForgotPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
