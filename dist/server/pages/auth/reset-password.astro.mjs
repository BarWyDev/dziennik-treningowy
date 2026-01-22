import { e as createComponent, f as createAstro, r as renderTemplate, k as renderComponent, l as renderHead } from '../../chunks/astro/server_C-0B9Fh3.mjs';
/* empty css                                        */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { r as resetPassword } from '../../chunks/auth-client_DMbUkJyp.mjs';
import { a as resetPasswordSchema } from '../../chunks/auth_BO8XW5iv.mjs';
import { B as Button } from '../../chunks/Button_DSs3LSd1.mjs';
import { I as Input } from '../../chunks/Input_jnU1wWv_.mjs';
import { L as Label } from '../../chunks/Label_CbQ68ufM.mjs';
import { A as Alert } from '../../chunks/Alert_Bst9GH5v.mjs';
export { renderers } from '../../renderers.mjs';

function ResetPasswordForm({ token }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await resetPassword({
        newPassword: data.password,
        token
      });
      if (result.error) {
        setError(result.error.message || "Wystąpił błąd podczas resetowania hasła");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Wystąpił błąd podczas resetowania hasła");
    } finally {
      setIsLoading(false);
    }
  };
  if (!token) {
    return /* @__PURE__ */ jsxs(Alert, { variant: "error", title: "Nieprawidłowy link", children: [
      /* @__PURE__ */ jsx("p", { children: "Link do resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj ponownie zresetować hasło." }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/auth/forgot-password",
          className: "mt-4 inline-block text-primary-600 hover:text-primary-500 font-medium",
          children: "Zresetuj hasło ponownie"
        }
      )
    ] });
  }
  if (success) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Hasło zmienione!", children: /* @__PURE__ */ jsx("p", { children: "Twoje hasło zostało pomyślnie zmienione. Możesz się teraz zalogować." }) }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/auth/login",
          className: "mt-6 inline-block text-primary-600 hover:text-primary-500 font-medium",
          children: "Przejdź do logowania"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", children: error }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "password", required: true, children: "Nowe hasło" }),
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
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Min. 8 znaków, wielka i mała litera oraz cyfra" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", required: true, children: "Potwierdź nowe hasło" }),
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
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", isLoading, children: "Zmień hasło" })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$ResetPassword = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ResetPassword;
  const token = Astro2.url.searchParams.get("token") || "";
  return renderTemplate(_a || (_a = __template([`<html lang="pl"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nowe has\u0142o - Dziennik Treningowy</title><meta name="description" content="Ustaw nowe has\u0142o do Dziennika Treningowego"><script>
      (function() {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        }
      })();
    <\/script>`, '</head> <body class="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8"> <div class="sm:mx-auto sm:w-full sm:max-w-md"> <h1 class="text-center text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Dziennik Treningowy</h1> <h2 class="mt-6 text-center text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">\nUstaw nowe has\u0142o\n</h2> </div> <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"> <div class="bg-white dark:bg-[#161b22] py-8 px-4 shadow-sm rounded-xl sm:px-10 border border-gray-200 dark:border-gray-800"> ', " </div> </div> </body></html>"])), renderHead(), renderComponent($$result, "ResetPasswordForm", ResetPasswordForm, { "token": token, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/auth/ResetPasswordForm", "client:component-export": "ResetPasswordForm" }));
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/reset-password.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/auth/reset-password.astro";
const $$url = "/auth/reset-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ResetPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
