import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_C-0B9Fh3.mjs';
import { $ as $$AppLayout } from '../chunks/AppLayout_BmmcCXTo.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { c as createPersonalRecordSchema } from '../chunks/personal-record_Cb0TCP_H.mjs';
import { B as Button } from '../chunks/Button_DSs3LSd1.mjs';
import { I as Input } from '../chunks/Input_jnU1wWv_.mjs';
import { L as Label } from '../chunks/Label_CbQ68ufM.mjs';
import { A as Alert } from '../chunks/Alert_Bst9GH5v.mjs';
import { S as Select } from '../chunks/Select_DYlv6HWL.mjs';
import { D as Dialog } from '../chunks/Dialog_BB7fs6nV.mjs';
export { renderers } from '../renderers.mjs';

function PersonalRecordForm({ record, onSuccess }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!record;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(createPersonalRecordSchema),
    defaultValues: {
      activityName: record?.activityName || "",
      result: record?.result || "",
      unit: record?.unit || "",
      date: record?.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      notes: record?.notes || ""
    }
  });
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = isEditing ? `/api/personal-records/${record.id}` : "/api/personal-records";
      const method = isEditing ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Wystąpił błąd");
      }
      if (!isEditing) {
        reset();
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Błąd", children: error }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "activityName", required: true, children: "Nazwa aktywności" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "activityName",
          type: "text",
          placeholder: "np. Wyciskanie sztangi, Sprint 100m",
          error: errors.activityName?.message,
          ...register("activityName")
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "result", required: true, children: "Wynik" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "result",
            type: "text",
            placeholder: "np. 100 lub 100,5",
            error: errors.result?.message,
            ...register("result")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "unit", required: true, children: "Jednostka" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "unit",
            type: "text",
            placeholder: "np. kg, km, min, sek",
            error: errors.unit?.message,
            ...register("unit")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "date", required: true, children: "Data" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "date",
          type: "date",
          error: errors.date?.message,
          ...register("date")
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "notes", children: "Notatki" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "notes",
          rows: 3,
          className: "w-full px-3 py-2 text-sm lg:text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          placeholder: "Dodatkowe informacje...",
          ...register("notes")
        }
      ),
      errors.notes && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: errors.notes.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isLoading, children: isLoading ? "Zapisywanie..." : isEditing ? "Zapisz zmiany" : "Dodaj rekord" }),
      isEditing && onSuccess && /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onSuccess, children: "Anuluj" })
    ] })
  ] });
}

function PersonalRecordCard({ record, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć ten rekord?")) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(record.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };
  const formattedDate = new Date(record.date).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100", children: record.activityName }),
        /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1", children: formattedDate })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("p", { className: "text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400", children: [
        record.result,
        " ",
        /* @__PURE__ */ jsx("span", { className: "text-sm lg:text-base font-normal text-gray-600 dark:text-gray-400", children: record.unit })
      ] }) })
    ] }),
    record.notes && /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md", children: record.notes }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          size: "sm",
          onClick: () => onEdit(record),
          children: "Edytuj"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "danger",
          size: "sm",
          onClick: handleDelete,
          disabled: isDeleting,
          children: isDeleting ? "Usuwanie..." : "Usuń"
        }
      )
    ] })
  ] });
}

function PersonalRecordList() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/personal-records?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRecords();
  }, [sortBy, sortOrder]);
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/personal-records/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setRecords(records.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
    fetchRecords();
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-gray-600 dark:text-gray-400 text-base lg:text-lg", children: "Ładowanie..." });
  }
  if (records.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 text-lg lg:text-xl", children: "Nie masz jeszcze żadnych rekordów osobistych." }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 dark:text-gray-500 mt-2 text-base lg:text-lg", children: "Dodaj swój pierwszy rekord używając formularza powyżej!" })
    ] });
  }
  const sortByOptions = [
    { value: "date", label: "Data" },
    { value: "activityName", label: "Nazwa aktywności" },
    { value: "result", label: "Wynik" },
    { value: "createdAt", label: "Data dodania" }
  ];
  const sortOrderOptions = [
    { value: "desc", label: "Malejąco" },
    { value: "asc", label: "Rosnąco" }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "sortBy", children: "Sortuj według" }),
        /* @__PURE__ */ jsx(
          Select,
          {
            id: "sortBy",
            options: sortByOptions,
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "sortOrder", children: "Kolejność" }),
        /* @__PURE__ */ jsx(
          Select,
          {
            id: "sortOrder",
            options: sortOrderOptions,
            value: sortOrder,
            onChange: (e) => setSortOrder(e.target.value)
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: records.map((record) => /* @__PURE__ */ jsx(
      PersonalRecordCard,
      {
        record,
        onEdit: handleEdit,
        onDelete: handleDelete
      },
      record.id
    )) }),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        isOpen: isEditDialogOpen,
        onClose: () => {
          setIsEditDialogOpen(false);
          setEditingRecord(null);
        },
        title: "Edytuj rekord",
        children: editingRecord && /* @__PURE__ */ jsx(
          PersonalRecordForm,
          {
            record: editingRecord,
            onSuccess: handleEditSuccess
          }
        )
      }
    )
  ] });
}

function PersonalRecordsStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/personal-records/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-4 text-gray-600 dark:text-gray-400 text-base lg:text-lg", children: "Ładowanie statystyk..." });
  }
  if (!stats) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg p-6 shadow-md", children: [
      /* @__PURE__ */ jsx("p", { className: "text-blue-100 dark:text-blue-200 text-sm lg:text-base font-medium mb-2", children: "Łączna liczba rekordów" }),
      /* @__PURE__ */ jsx("p", { className: "text-4xl lg:text-5xl font-bold", children: stats.totalCount })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg p-6 shadow-md", children: [
      /* @__PURE__ */ jsx("p", { className: "text-green-100 dark:text-green-200 text-sm lg:text-base font-medium mb-2", children: "Ostatnio dodany rekord" }),
      stats.lastRecord ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xl lg:text-2xl font-bold", children: stats.lastRecord.activityName }),
        /* @__PURE__ */ jsxs("p", { className: "text-green-100 dark:text-green-200 text-sm lg:text-base mt-1", children: [
          stats.lastRecord.result,
          " ",
          stats.lastRecord.unit,
          " • ",
          new Date(stats.lastRecord.date).toLocaleDateString("pl-PL")
        ] })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-lg lg:text-xl", children: "Brak rekordów" })
    ] })
  ] });
}

function PersonalRecordsManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleRecordAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Rekordy osobiste" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 text-base lg:text-lg", children: "Śledź swoje najlepsze osiągnięcia i obserwuj postępy" })
    ] }),
    /* @__PURE__ */ jsx(PersonalRecordsStats, {}, `stats-${refreshTrigger}`),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6 sticky top-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6", children: "Dodaj nowy rekord" }),
        /* @__PURE__ */ jsx(PersonalRecordForm, { onSuccess: handleRecordAdded })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6", children: "Wszystkie rekordy" }),
        /* @__PURE__ */ jsx(PersonalRecordList, {}, `list-${refreshTrigger}`)
      ] }) })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Rekordy osobiste" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PersonalRecordsManager", PersonalRecordsManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/personal-records/PersonalRecordsManager", "client:component-export": "PersonalRecordsManager" })} ` })}`;
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/personal-records/index.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/personal-records/index.astro";
const $$url = "/personal-records";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
