import { e as createComponent, f as createAstro, r as renderTemplate, o as renderSlot, k as renderComponent, l as renderHead, h as addAttribute } from './astro/server_C-0B9Fh3.mjs';
/* empty css                             */
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { b as signOut } from './auth-client_DMbUkJyp.mjs';

function MobileMenu({ isOpen, user, navigation }) {
  if (!isOpen) return null;
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };
  return /* @__PURE__ */ jsxs("div", { className: "sm:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117]", children: [
    /* @__PURE__ */ jsxs("div", { className: "pt-2 pb-3 space-y-1", children: [
      navigation.map((item) => /* @__PURE__ */ jsx(
        "a",
        {
          href: item.href,
          className: "block px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          style: { fontSize: "15px" },
          children: item.name
        },
        item.name
      )),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/trainings/new",
          className: "block px-4 py-2 font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          style: { fontSize: "15px" },
          children: "+ Dodaj trening"
        }
      )
    ] }),
    user && /* @__PURE__ */ jsxs("div", { className: "pt-4 pb-3 border-t border-gray-200 dark:border-gray-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 flex items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: user.image ? /* @__PURE__ */ jsx(
          "img",
          {
            className: "h-10 w-10 rounded-full",
            src: user.image,
            alt: user.name
          }
        ) : /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 dark:text-gray-300 font-medium text-sm", children: user.name.charAt(0).toUpperCase() }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "ml-3", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-gray-900 dark:text-gray-100", style: { fontSize: "15px" }, children: user.name }),
          /* @__PURE__ */ jsx("div", { className: "text-gray-500 dark:text-gray-400", style: { fontSize: "14px" }, children: user.email })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-1", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSignOut,
          className: "block w-full text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          style: { fontSize: "15px" },
          children: "Wyloguj się"
        }
      ) })
    ] })
  ] });
}

function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };
  return /* @__PURE__ */ jsxs("div", { className: "ml-4 relative", ref: menuRef, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "flex items-center gap-2 rounded-md px-3 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        onClick: () => setIsOpen(!isOpen),
        style: { fontSize: "14px" },
        children: [
          user.image ? /* @__PURE__ */ jsx(
            "img",
            {
              className: "h-8 w-8 rounded-full",
              src: user.image,
              alt: user.name
            }
          ) : /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-700 dark:text-gray-300 font-medium text-sm", children: user.name.charAt(0).toUpperCase() }) }),
          /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: user.name }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: `w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`,
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
            }
          )
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-[#161b22] ring-1 ring-black ring-opacity-5 dark:ring-gray-800 divide-y divide-gray-100 dark:divide-gray-800 z-50", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", style: { fontSize: "14px" }, children: user.name }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 truncate", style: { fontSize: "13px" }, children: user.email })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "py-1", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSignOut,
          className: "w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-error-600 dark:hover:text-error-400 flex items-center gap-2 transition-colors",
          style: { fontSize: "14px" },
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }),
            "Wyloguj się"
          ]
        }
      ) })
    ] })
  ] });
}

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Treningi", href: "/trainings" },
  { name: "Cele", href: "/goals" },
  { name: "Rekordy", href: "/personal-records" }
];
function Navbar({ user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);
  const toggleDarkMode = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };
  return /* @__PURE__ */ jsxs("nav", { className: "bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800 transition-colors", children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between h-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 flex items-center", children: /* @__PURE__ */ jsx("a", { href: "/dashboard", className: "text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Dziennik Treningowy" }) }),
        /* @__PURE__ */ jsx("div", { className: "hidden sm:ml-8 sm:flex sm:space-x-1", children: navigation.map((item) => /* @__PURE__ */ jsx(
          "a",
          {
            href: item.href,
            className: "inline-flex items-center px-3 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors",
            style: { fontSize: "14px" },
            children: item.name
          },
          item.name
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hidden sm:ml-6 sm:flex sm:items-center sm:space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: toggleDarkMode,
            className: "inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            "aria-label": "Przełącz tryb ciemny",
            suppressHydrationWarning: true,
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", suppressHydrationWarning: true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: isDarkMode ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" : "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" }) })
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/trainings/new",
            className: "inline-flex items-center px-4 py-2 font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 rounded-md transition-colors",
            style: { fontSize: "14px" },
            children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "w-4 h-4 mr-2",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M12 4v16m8-8H4"
                    }
                  )
                }
              ),
              "Dodaj trening"
            ]
          }
        ),
        user && /* @__PURE__ */ jsx(UserMenu, { user })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center sm:hidden space-x-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: toggleDarkMode,
            className: "inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            "aria-label": "Przełącz tryb ciemny",
            suppressHydrationWarning: true,
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", suppressHydrationWarning: true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: isDarkMode ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" : "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" }) })
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
            onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
            children: [
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Otwórz menu" }),
              isMobileMenuOpen ? /* @__PURE__ */ jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) : /* @__PURE__ */ jsx("svg", { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(MobileMenu, { isOpen: isMobileMenuOpen, user, navigation })
  ] });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$AppLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AppLayout;
  const { title, description = "\u015Aled\u017A swoje treningi i osi\u0105gaj cele" } = Astro2.props;
  const user = Astro2.locals.user;
  return renderTemplate(_a || (_a = __template(['<html lang="pl"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>', ' - Dziennik Treningowy</title><meta name="description"', `><link rel="icon" type="image/svg+xml" href="/favicon.svg"><script>
      // Prevent flash of unstyled content (FOUC) for dark mode
      (function() {
        const theme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (theme === 'dark' || (!theme && prefersDark)) {
          document.documentElement.classList.add('dark');
        }
      })();
    <\/script>`, '</head> <body class="min-h-screen bg-white dark:bg-[#0d1117]"> ', ' <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> ', " </main> </body></html>"])), title, addAttribute(description, "content"), renderHead(), renderComponent($$result, "Navbar", Navbar, { "user": user, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/layout/Navbar", "client:component-export": "Navbar" }), renderSlot($$result, $$slots["default"]));
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/layouts/AppLayout.astro", void 0);

export { $$AppLayout as $ };
