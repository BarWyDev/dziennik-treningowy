import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_C-0B9Fh3.mjs';
import { $ as $$AppLayout } from '../chunks/AppLayout_BmmcCXTo.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
export { renderers } from '../renderers.mjs';

function getGreeting() {
  const hour = (/* @__PURE__ */ new Date()).getHours();
  if (hour < 12) return "Dzień dobry";
  if (hour < 18) return "Cześć";
  return "Dobry wieczór";
}
function WelcomeMessage({ userName }) {
  const greeting = getGreeting();
  const firstName = userName.split(" ")[0];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100", children: [
      greeting,
      ", ",
      firstName,
      "!"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 mt-1 text-base lg:text-lg", children: "Sprawdź swoje postępy i zaplanuj kolejny trening." })
  ] });
}

function formatDuration$1(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}
function WeekSummary({ trainingsCount, totalDuration, totalCalories }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Ten tydzień" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-600 dark:text-primary-400", children: trainingsCount }),
        /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1", children: trainingsCount === 1 ? "trening" : trainingsCount >= 2 && trainingsCount <= 4 ? "treningi" : "treningów" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center border-x border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-600 dark:text-primary-400", children: totalDuration > 0 ? formatDuration$1(totalDuration) : "0min" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1", children: "łącznie" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-3xl lg:text-4xl xl:text-5xl font-bold text-primary-600 dark:text-primary-400", children: totalCalories > 0 ? totalCalories : "-" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1", children: "kcal" })
      ] })
    ] })
  ] });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = /* @__PURE__ */ new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateString === today.toISOString().split("T")[0]) {
    return "Dzisiaj";
  }
  if (dateString === yesterday.toISOString().split("T")[0]) {
    return "Wczoraj";
  }
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short"
  });
}
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}
function RecentTrainings({ trainings }) {
  if (trainings.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Ostatnie treningi" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "mx-auto h-12 w-12 lg:h-14 lg:w-14 text-gray-400 dark:text-gray-600",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 1.5,
                d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400", children: "Brak treningów do wyświetlenia" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/trainings/new",
            className: "mt-3 inline-block text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium",
            children: "Dodaj pierwszy trening"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100", children: "Ostatnie treningi" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/trainings",
          className: "text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium",
          children: "Zobacz wszystkie"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: trainings.map((training) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: `/trainings/${training.id}`,
        className: "flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100 text-base lg:text-lg", children: training.trainingType?.name || "Trening" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400", children: formatDate(training.date) })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-sm lg:text-base font-medium text-primary-600 dark:text-primary-400", children: formatDuration(training.durationMinutes) })
        ]
      },
      training.id
    )) })
  ] });
}

function getProgress(current, target) {
  if (!target || target === 0) return 0;
  const currentVal = current || 0;
  return Math.min(100, Math.round(currentVal / target * 100));
}
function ActiveGoals({ goals }) {
  if (goals.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Aktywne cele" }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "mx-auto h-12 w-12 lg:h-14 lg:w-14 text-gray-400 dark:text-gray-600",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 1.5,
                d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400", children: "Brak aktywnych celów" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/goals",
            className: "mt-3 inline-block text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium",
            children: "Dodaj pierwszy cel"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100", children: "Aktywne cele" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/goals",
          className: "text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium",
          children: "Zarządzaj"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: goals.map((goal) => {
      const progress = getProgress(goal.currentValue, goal.targetValue);
      const hasTarget = goal.targetValue && goal.targetValue > 0;
      return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100 text-base lg:text-lg", children: goal.title }),
          hasTarget && /* @__PURE__ */ jsxs("span", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400", children: [
            goal.currentValue || 0,
            "/",
            goal.targetValue,
            " ",
            goal.unit
          ] })
        ] }),
        hasTarget && /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all",
            style: { width: `${progress}%` }
          }
        ) })
      ] }, goal.id);
    }) })
  ] });
}

function QuickAddButton() {
  return /* @__PURE__ */ jsx(
    "a",
    {
      href: "/trainings/new",
      className: "block bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-xl shadow-sm p-6 text-white hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all",
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white/20 dark:bg-white/10 rounded-lg p-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 lg:w-7 lg:h-7", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 4v16m8-8H4"
          }
        ) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold text-lg lg:text-xl", children: "Dodaj trening" }),
          /* @__PURE__ */ jsx("p", { className: "text-primary-100 dark:text-primary-200 text-sm lg:text-base", children: "Zapisz swój dzisiejszy trening" })
        ] })
      ] })
    }
  );
}

function Dashboard({ userName }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch {
        console.error("Error fetching dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" }),
        /* @__PURE__ */ jsx("div", { className: "h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" })
      ] })
    ] });
  }
  if (!data) {
    return /* @__PURE__ */ jsx("div", { className: "text-gray-900 dark:text-gray-100", children: "Nie udało się załadować danych" });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(WelcomeMessage, { userName }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx(QuickAddButton, {}),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(
        WeekSummary,
        {
          trainingsCount: data.weekSummary.trainingsCount,
          totalDuration: data.weekSummary.totalDuration,
          totalCalories: data.weekSummary.totalCalories
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsx(RecentTrainings, { trainings: data.recentTrainings }),
      /* @__PURE__ */ jsx(ActiveGoals, { goals: data.activeGoals })
    ] })
  ] });
}

const $$Astro = createAstro();
const $$Dashboard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const user = Astro2.locals.user;
  if (!user) {
    return Astro2.redirect("/auth/login");
  }
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Dashboard" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Dashboard", Dashboard, { "userName": user.name, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/dashboard/Dashboard", "client:component-export": "Dashboard" })} ` })}`;
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/dashboard.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
