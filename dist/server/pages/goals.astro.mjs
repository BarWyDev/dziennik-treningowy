import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C-0B9Fh3.mjs';
import { $ as $$AppLayout } from '../chunks/AppLayout_BmmcCXTo.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { B as Button } from '../chunks/Button_DSs3LSd1.mjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { u as updateGoalSchema, c as createGoalSchema } from '../chunks/goal_BQtVvuH1.mjs';
import { I as Input } from '../chunks/Input_jnU1wWv_.mjs';
import { L as Label } from '../chunks/Label_CbQ68ufM.mjs';
import { A as Alert } from '../chunks/Alert_Bst9GH5v.mjs';
import { D as Dialog } from '../chunks/Dialog_BB7fs6nV.mjs';
export { renderers } from '../renderers.mjs';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
function getProgress(current, target) {
  if (!target || target === 0) return 0;
  const currentVal = current || 0;
  return Math.min(100, Math.round(currentVal / target * 100));
}
function GoalCard({ goal, onUpdate, onEdit }) {
  const [isLoading, setIsLoading] = useState(false);
  const progress = getProgress(goal.currentValue, goal.targetValue);
  const isAchieved = goal.status === "achieved";
  const hasTarget = goal.targetValue && goal.targetValue > 0;
  const handleAchieve = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}/achieve`, {
        method: "PATCH"
      });
      if (response.ok) {
        onUpdate();
      }
    } catch {
      console.error("Error achieving goal");
    } finally {
      setIsLoading(false);
    }
  };
  const handleArchive = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}/archive`, {
        method: "PATCH"
      });
      if (response.ok) {
        onUpdate();
      }
    } catch {
      console.error("Error archiving goal");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć ten cel?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        onUpdate();
      }
    } catch {
      console.error("Error deleting goal");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `bg-white dark:bg-[#161b22] rounded-xl shadow-sm border p-5 ${isAchieved ? "border-success-200 dark:border-success-700 bg-success-50/50 dark:bg-success-900/20" : "border-gray-200 dark:border-gray-800"}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            isAchieved && /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 lg:w-6 lg:h-6 text-success-500 dark:text-success-400", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx(
              "path",
              {
                fillRule: "evenodd",
                d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                clipRule: "evenodd"
              }
            ) }),
            /* @__PURE__ */ jsx("h3", { className: `text-base lg:text-lg font-semibold ${isAchieved ? "text-success-800 dark:text-success-300" : "text-gray-900 dark:text-gray-100"}`, children: goal.title })
          ] }),
          goal.description && /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1", children: goal.description }),
          hasTarget && /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm lg:text-base mb-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [
                goal.currentValue || 0,
                " / ",
                goal.targetValue,
                " ",
                goal.unit
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: [
                progress,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: `h-2 rounded-full transition-all ${isAchieved ? "bg-success-500 dark:bg-success-400" : "bg-primary-600 dark:bg-primary-500"}`,
                style: { width: `${progress}%` }
              }
            ) })
          ] }),
          goal.deadline && /* @__PURE__ */ jsxs("p", { className: "text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-2", children: [
            "Termin: ",
            formatDate(goal.deadline)
          ] }),
          goal.achievedAt && /* @__PURE__ */ jsxs("p", { className: "text-xs lg:text-sm text-success-600 dark:text-success-400 mt-2", children: [
            "Osiągnięto: ",
            formatDate(goal.achievedAt)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          !isAchieved && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: handleAchieve,
              isLoading,
              title: "Oznacz jako osiągnięty",
              children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-success-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => onEdit(goal),
              title: "Edytuj cel",
              children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-primary-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: handleArchive,
              isLoading,
              title: "Zarchiwizuj",
              children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: handleDelete,
              isLoading,
              title: "Usuń",
              children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-error-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) })
            }
          )
        ] })
      ] })
    }
  );
}

function GoalForm({ goal, onSuccess, onCancel }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!goal;
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(isEditMode ? updateGoalSchema : createGoalSchema),
    defaultValues: goal ? {
      title: goal.title,
      description: goal.description || "",
      targetValue: goal.targetValue || void 0,
      currentValue: goal.currentValue || 0,
      unit: goal.unit || "",
      deadline: goal.deadline || ""
    } : void 0
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = isEditMode ? `/api/goals/${goal.id}` : "/api/goals";
      const method = isEditMode ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Wystąpił błąd");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", children: error }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "title", required: true, children: "Tytuł celu" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "title",
          placeholder: "np. Przebiec maraton",
          error: errors.title?.message,
          ...register("title")
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Opis (opcjonalnie)" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "description",
          rows: 2,
          className: "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          placeholder: "Krótki opis celu...",
          ...register("description")
        }
      ),
      errors.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: errors.description.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "targetValue", children: "Wartość docelowa" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "targetValue",
            type: "number",
            min: "1",
            placeholder: "np. 42",
            error: errors.targetValue?.message,
            ...register("targetValue", { valueAsNumber: true })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "unit", children: "Jednostka" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "unit",
            placeholder: "np. km",
            error: errors.unit?.message,
            ...register("unit")
          }
        )
      ] })
    ] }),
    isEditMode && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "currentValue", children: "Aktualny postęp" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "currentValue",
          type: "number",
          min: "0",
          placeholder: "np. 25",
          error: errors.currentValue?.message,
          ...register("currentValue", { valueAsNumber: true })
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400", children: "Wprowadź ile już osiągnąłeś z wartości docelowej" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "deadline", children: "Termin (opcjonalnie)" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "deadline",
          type: "date",
          error: errors.deadline?.message,
          ...register("deadline")
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
      /* @__PURE__ */ jsx(Button, { type: "submit", isLoading, className: "flex-1", children: isEditMode ? "Zapisz zmiany" : "Dodaj cel" }),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Anuluj" })
    ] })
  ] });
}

function GoalLimitInfo({ activeCount, maxGoals }) {
  const remaining = maxGoals - activeCount;
  if (remaining > 2) return null;
  if (remaining === 0) {
    return /* @__PURE__ */ jsxs(Alert, { variant: "warning", title: "Limit celów osiągnięty", children: [
      "Masz maksymalną liczbę aktywnych celów (",
      maxGoals,
      "). Oznacz cel jako osiągnięty lub zarchiwizuj, aby dodać nowy."
    ] });
  }
  return /* @__PURE__ */ jsxs(Alert, { variant: "info", children: [
    "Pozostało ",
    remaining,
    " ",
    remaining === 1 ? "miejsce" : "miejsca",
    " na aktywne cele (maks. ",
    maxGoals,
    ")."
  ] });
}

const MAX_ACTIVE_GOALS = 5;
function GoalList() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch {
      console.error("Error fetching goals");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchGoals();
  }, []);
  const activeGoals = goals.filter((g) => !g.isArchived && g.status === "active");
  const achievedGoals = goals.filter((g) => !g.isArchived && g.status === "achieved");
  const archivedGoals = goals.filter((g) => g.isArchived);
  const canAddGoal = activeGoals.length < MAX_ACTIVE_GOALS;
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingGoal(null);
    fetchGoals();
  };
  const handleEdit = (goal) => {
    setEditingGoal(goal);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [...Array(2)].map((_, i) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 animate-pulse",
        children: [
          /* @__PURE__ */ jsx("div", { className: "h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" })
        ]
      },
      i
    )) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(GoalLimitInfo, { activeCount: activeGoals.length, maxGoals: MAX_ACTIVE_GOALS }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100", children: [
          "Aktywne cele (",
          activeGoals.length,
          "/",
          MAX_ACTIVE_GOALS,
          ")"
        ] }),
        canAddGoal && /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => setShowForm(true), children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-4 h-4 lg:w-5 lg:h-5 mr-1",
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
          "Dodaj cel"
        ] })
      ] }),
      activeGoals.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700", children: [
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
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm lg:text-base text-gray-600 dark:text-gray-400", children: "Brak aktywnych celów" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", className: "mt-4", onClick: () => setShowForm(true), children: "Dodaj pierwszy cel" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: activeGoals.map((goal) => /* @__PURE__ */ jsx(GoalCard, { goal, onUpdate: fetchGoals, onEdit: handleEdit }, goal.id)) })
    ] }),
    achievedGoals.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4", children: [
        "Osiągnięte cele (",
        achievedGoals.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: achievedGoals.map((goal) => /* @__PURE__ */ jsx(GoalCard, { goal, onUpdate: fetchGoals, onEdit: handleEdit }, goal.id)) })
    ] }),
    archivedGoals.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "flex items-center gap-2 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
          onClick: () => setShowArchived(!showArchived),
          children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-4 h-4 lg:w-5 lg:h-5 transition-transform ${showArchived ? "rotate-180" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M19 9l-7 7-7-7"
                  }
                )
              }
            ),
            showArchived ? "Ukryj" : "Pokaż",
            " zarchiwizowane (",
            archivedGoals.length,
            ")"
          ]
        }
      ),
      showArchived && /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-3 opacity-60", children: archivedGoals.map((goal) => /* @__PURE__ */ jsx(GoalCard, { goal, onUpdate: fetchGoals, onEdit: handleEdit }, goal.id)) })
    ] }),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        isOpen: showForm || !!editingGoal,
        onClose: () => {
          setShowForm(false);
          setEditingGoal(null);
        },
        title: editingGoal ? "Edytuj cel" : "Dodaj nowy cel",
        children: /* @__PURE__ */ jsx(
          GoalForm,
          {
            goal: editingGoal || void 0,
            onSuccess: handleFormSuccess,
            onCancel: () => {
              setShowForm(false);
              setEditingGoal(null);
            }
          }
        )
      }
    )
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Cele" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl mx-auto"> <div class="mb-6"> <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Moje cele</h1> <p class="text-gray-600 dark:text-gray-400 mt-1 text-base lg:text-lg">Wyznaczaj cele i śledź swoje postępy</p> </div> ${renderComponent($$result2, "GoalList", GoalList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/goals/GoalList", "client:component-export": "GoalList" })} </div> ` })}`;
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/goals/index.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/goals/index.astro";
const $$url = "/goals";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
