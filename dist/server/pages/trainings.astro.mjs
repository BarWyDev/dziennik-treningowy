import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, n as renderScript } from '../chunks/astro/server_C-0B9Fh3.mjs';
import { $ as $$AppLayout } from '../chunks/AppLayout_BmmcCXTo.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { I as Input } from '../chunks/Input_jnU1wWv_.mjs';
import { S as Select } from '../chunks/Select_DYlv6HWL.mjs';
import { B as Button } from '../chunks/Button_DSs3LSd1.mjs';
import { D as Dialog } from '../chunks/Dialog_BB7fs6nV.mjs';
import { c as createPDF, d as formatDateRange, a as addHeader, s as sanitizePolishText, f as formatDuration$1, b as addFooter } from '../chunks/common_BnydJ18k.mjs';
import autoTable from 'jspdf-autotable';
export { renderers } from '../renderers.mjs';

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}
function TrainingCard({ training }) {
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: `/trainings/${training.id}`,
      className: "block bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100", children: training.trainingType?.name || "Trening" }),
              training.rating && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: [...Array(training.rating)].map((_, i) => /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500",
                  viewBox: "0 0 20 20",
                  children: /* @__PURE__ */ jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" })
                },
                i
              )) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1", children: formatDate(training.date) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg lg:text-xl font-semibold text-primary-600 dark:text-primary-400", children: formatDuration(training.durationMinutes) }),
            training.caloriesBurned && /* @__PURE__ */ jsxs("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400", children: [
              training.caloriesBurned,
              " kcal"
            ] })
          ] })
        ] }),
        training.notes && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm lg:text-base text-gray-600 dark:text-gray-300 line-clamp-2", children: training.notes })
      ]
    }
  );
}

function TrainingFilters({ filters, onFiltersChange }) {
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/training-types");
        if (response.ok) {
          const data = await response.json();
          setTrainingTypes(data);
        }
      } catch {
        console.error("Error fetching training types");
      }
    };
    fetchTypes();
  }, []);
  const typeOptions = [
    { value: "", label: "Wszystkie typy" },
    ...trainingTypes.map((type) => ({
      value: type.id,
      label: type.name
    }))
  ];
  const handleClearFilters = () => {
    onFiltersChange({});
  };
  const hasActiveFilters = filters.startDate || filters.endDate || filters.trainingTypeId;
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "flex items-center justify-between w-full",
        onClick: () => setIsExpanded(!isExpanded),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-5 h-5 lg:w-6 lg:h-6 text-gray-500 dark:text-gray-400",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700 dark:text-gray-300 text-base lg:text-lg", children: "Filtry" }),
            hasActiveFilters && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-xs lg:text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full", children: "Aktywne" })
          ] }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: `w-5 h-5 lg:w-6 lg:h-6 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`,
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
            }
          )
        ]
      }
    ),
    isExpanded && /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Od daty" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "date",
              value: filters.startDate || "",
              onChange: (e) => onFiltersChange({ ...filters, startDate: e.target.value || void 0 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Do daty" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "date",
              value: filters.endDate || "",
              onChange: (e) => onFiltersChange({ ...filters, endDate: e.target.value || void 0 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Typ treningu" }),
          /* @__PURE__ */ jsx(
            Select,
            {
              options: typeOptions,
              value: filters.trainingTypeId || "",
              onChange: (e) => onFiltersChange({
                ...filters,
                trainingTypeId: e.target.value || void 0
              })
            }
          )
        ] })
      ] }),
      hasActiveFilters && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: handleClearFilters, children: "Wyczyść filtry" }) })
    ] })
  ] });
}

function EmptyState() {
  return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
    /* @__PURE__ */ jsx(
      "svg",
      {
        className: "mx-auto h-16 w-16 lg:h-20 lg:w-20 text-gray-400 dark:text-gray-600",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
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
    /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg lg:text-xl font-medium text-gray-900 dark:text-gray-100", children: "Brak treningów" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400", children: "Nie masz jeszcze żadnych zapisanych treningów. Zacznij śledzić swoje postępy!" }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx("a", { href: "/trainings/new", children: /* @__PURE__ */ jsxs(Button, { children: [
      /* @__PURE__ */ jsx(
        "svg",
        {
          className: "w-4 h-4 lg:w-5 lg:h-5 mr-2",
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
      "Dodaj pierwszy trening"
    ] }) }) })
  ] });
}

function TrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fetchTrainings = async (currentPage, currentFilters, append = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      });
      if (currentFilters.startDate) params.set("startDate", currentFilters.startDate);
      if (currentFilters.endDate) params.set("endDate", currentFilters.endDate);
      if (currentFilters.trainingTypeId) params.set("trainingTypeId", currentFilters.trainingTypeId);
      const response = await fetch(`/api/trainings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTrainings(append ? [...trainings, ...data.data] : data.data);
        setHasMore(data.data.length === 20);
      }
    } catch {
      console.error("Error fetching trainings");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setPage(1);
    fetchTrainings(1, filters);
  }, [filters]);
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrainings(nextPage, filters, true);
  };
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };
  if (isLoading && trainings.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx(TrainingFilters, { filters, onFiltersChange: handleFiltersChange }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [...Array(3)].map((_, i) => /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 animate-pulse", children: [
        /* @__PURE__ */ jsx("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" })
      ] }, i)) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(TrainingFilters, { filters, onFiltersChange: handleFiltersChange }),
    trainings.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: trainings.map((training) => /* @__PURE__ */ jsx(TrainingCard, { training }, training.id)) }),
      hasMore && /* @__PURE__ */ jsx("div", { className: "flex justify-center pt-4", children: /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: handleLoadMore, isLoading, children: "Załaduj więcej" }) })
    ] })
  ] });
}

function generateWeeklyReport({ trainings, startDate, endDate }) {
  const doc = createPDF();
  const dateRange = formatDateRange(startDate, endDate);
  let yPos = addHeader(doc, "Raport tygodniowy", dateRange);
  const totalDuration = trainings.reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalCalories = trainings.reduce((acc, t) => acc + (t.caloriesBurned || 0), 0);
  const avgOverall = trainings.reduce((acc, t) => acc + t.ratingOverall, 0) / trainings.length || 0;
  const physicalRatings = trainings.filter((t) => t.ratingPhysical);
  const avgPhysical = physicalRatings.length > 0 ? physicalRatings.reduce((acc, t) => acc + (t.ratingPhysical || 0), 0) / physicalRatings.length : 0;
  const energyRatings = trainings.filter((t) => t.ratingEnergy);
  const avgEnergy = energyRatings.length > 0 ? energyRatings.reduce((acc, t) => acc + (t.ratingEnergy || 0), 0) / energyRatings.length : 0;
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(sanitizePolishText("Podsumowanie"), 14, yPos);
  yPos += 8;
  const summaryData = [
    ["Liczba treningow", trainings.length.toString()],
    ["Laczny czas", formatDuration$1(totalDuration)],
    ["Spalone kalorie", totalCalories > 0 ? `${totalCalories} kcal` : "-"],
    ["Sr. zadowolenie", avgOverall > 0 ? avgOverall.toFixed(1) + "/5" : "-"],
    ["Sr. samopoczucie", avgPhysical > 0 ? avgPhysical.toFixed(1) + "/5" : "-"],
    ["Sr. energia", avgEnergy > 0 ? avgEnergy.toFixed(1) + "/5" : "-"]
  ].map((row) => row.map((cell) => sanitizePolishText(cell)));
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235]
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: "auto" }
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    margin: { left: 14, right: 14 }
  });
  yPos = doc.lastAutoTable.finalY + 15;
  if (trainings.length > 0) {
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(sanitizePolishText("Lista treningow"), 14, yPos);
    yPos += 8;
    const tableData = trainings.map((t) => [
      new Date(t.date).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short"
      }),
      sanitizePolishText(t.trainingType?.name || "Trening"),
      formatDuration$1(t.durationMinutes),
      `${t.ratingOverall}/5`,
      t.caloriesBurned ? `${t.caloriesBurned}` : "-"
    ]);
    autoTable(doc, {
      startY: yPos,
      head: [[sanitizePolishText("Data"), sanitizePolishText("Typ"), "Czas", "Ocena", "Kalorie"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold"
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 }
      },
      margin: { left: 14, right: 14 }
    });
  } else {
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(sanitizePolishText("Brak treningow w tym tygodniu."), 14, yPos);
  }
  addFooter(doc);
  const weekNum = getWeekNumber$1(startDate);
  const fileName = sanitizePolishText(`raport_tygodniowy_${startDate.getFullYear()}_T${weekNum}.pdf`);
  doc.save(fileName);
}
function getWeekNumber$1(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}

function generateMonthlyReport({ trainings, year, month }) {
  const doc = createPDF();
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric"
  });
  let yPos = addHeader(doc, "Raport miesięczny", monthName.charAt(0).toUpperCase() + monthName.slice(1));
  const totalDuration = trainings.reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalCalories = trainings.reduce((acc, t) => acc + (t.caloriesBurned || 0), 0);
  const avgOverall = trainings.reduce((acc, t) => acc + t.ratingOverall, 0) / trainings.length || 0;
  const physicalRatings = trainings.filter((t) => t.ratingPhysical);
  const avgPhysical = physicalRatings.length > 0 ? physicalRatings.reduce((acc, t) => acc + (t.ratingPhysical || 0), 0) / physicalRatings.length : 0;
  const energyRatings = trainings.filter((t) => t.ratingEnergy);
  const avgEnergy = energyRatings.length > 0 ? energyRatings.reduce((acc, t) => acc + (t.ratingEnergy || 0), 0) / energyRatings.length : 0;
  const typeBreakdown = trainings.reduce(
    (acc, t) => {
      const type = t.trainingType?.name || "Inne";
      if (!acc[type]) {
        acc[type] = { count: 0, duration: 0 };
      }
      acc[type].count++;
      acc[type].duration += t.durationMinutes;
      return acc;
    },
    {}
  );
  doc.setFontSize(14);
  doc.setFont("times", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(sanitizePolishText("Podsumowanie"), 14, yPos);
  yPos += 8;
  const summaryData = [
    ["Liczba treningow", trainings.length.toString()],
    ["Laczny czas", formatDuration$1(totalDuration)],
    ["Sredni czas treningu", trainings.length > 0 ? formatDuration$1(Math.round(totalDuration / trainings.length)) : "-"],
    ["Spalone kalorie", totalCalories > 0 ? `${totalCalories} kcal` : "-"],
    ["Sr. zadowolenie", avgOverall > 0 ? avgOverall.toFixed(1) + "/5" : "-"],
    ["Sr. samopoczucie", avgPhysical > 0 ? avgPhysical.toFixed(1) + "/5" : "-"],
    ["Sr. energia", avgEnergy > 0 ? avgEnergy.toFixed(1) + "/5" : "-"]
  ].map((row) => row.map((cell) => sanitizePolishText(cell)));
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: "striped",
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: "auto" }
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    margin: { left: 14, right: 14 }
  });
  yPos = doc.lastAutoTable.finalY + 15;
  if (Object.keys(typeBreakdown).length > 0) {
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(sanitizePolishText("Podzial wg typu treningu"), 14, yPos);
    yPos += 8;
    const typeData = Object.entries(typeBreakdown).sort((a, b) => b[1].count - a[1].count).map(([type, data]) => [sanitizePolishText(type), data.count.toString(), formatDuration$1(data.duration)]);
    autoTable(doc, {
      startY: yPos,
      head: [[sanitizePolishText("Typ"), "Liczba", "Czas"]],
      body: typeData,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold"
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      margin: { left: 14, right: 14 }
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }
  if (trainings.length > 0) {
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(sanitizePolishText("Lista treningow"), 14, yPos);
    yPos += 8;
    const tableData = trainings.map((t) => [
      new Date(t.date).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short"
      }),
      sanitizePolishText(t.trainingType?.name || "Trening"),
      formatDuration$1(t.durationMinutes),
      `${t.ratingOverall}/5`,
      t.caloriesBurned ? `${t.caloriesBurned}` : "-"
    ]);
    autoTable(doc, {
      startY: yPos,
      head: [[sanitizePolishText("Data"), sanitizePolishText("Typ"), "Czas", "Ocena", "Kalorie"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold"
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 }
      },
      margin: { left: 14, right: 14 }
    });
  } else {
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(sanitizePolishText("Brak treningow w tym miesiacu."), 14, yPos);
  }
  addFooter(doc);
  const monthStr = month.toString().padStart(2, "0");
  const fileName = sanitizePolishText(`raport_miesieczny_${year}_${monthStr}.pdf`);
  doc.save(fileName);
}

function PeriodExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState("weekly");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = /* @__PURE__ */ new Date();
    return getWeekString(now);
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = /* @__PURE__ */ new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-period-export", handleOpen);
    return () => window.removeEventListener("open-period-export", handleOpen);
  }, []);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      let startDate;
      let endDate;
      if (reportType === "weekly") {
        const [year, week] = selectedWeek.split("-W").map(Number);
        const dates = getWeekDates(year, week);
        startDate = dates.start.toISOString().split("T")[0];
        endDate = dates.end.toISOString().split("T")[0];
      } else {
        const [year, month] = selectedMonth.split("-").map(Number);
        startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
      }
      const response = await fetch(
        `/api/trainings?startDate=${startDate}&endDate=${endDate}&limit=100`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trainings");
      }
      const data = await response.json();
      const trainings = data.data;
      if (reportType === "weekly") {
        const [year, week] = selectedWeek.split("-W").map(Number);
        const dates = getWeekDates(year, week);
        generateWeeklyReport({
          trainings,
          startDate: dates.start,
          endDate: dates.end
        });
      } else {
        const [year, month] = selectedMonth.split("-").map(Number);
        generateMonthlyReport({
          trainings,
          year,
          month
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error exporting report:", error);
    } finally {
      setIsExporting(false);
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { isOpen, onClose: () => setIsOpen(false), title: "Eksportuj raport", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `flex-1 py-2 px-4 rounded-lg text-sm lg:text-base font-medium transition-colors ${reportType === "weekly" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
          onClick: () => setReportType("weekly"),
          children: "Tygodniowy"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `flex-1 py-2 px-4 rounded-lg text-sm lg:text-base font-medium transition-colors ${reportType === "monthly" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
          onClick: () => setReportType("monthly"),
          children: "Miesięczny"
        }
      )
    ] }),
    reportType === "weekly" ? /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Wybierz tydzień" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "week",
          value: selectedWeek,
          onChange: (e) => setSelectedWeek(e.target.value),
          className: "w-full px-3 py-2 text-sm lg:text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Wybierz miesiąc" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "month",
          value: selectedMonth,
          onChange: (e) => setSelectedMonth(e.target.value),
          className: "w-full px-3 py-2 text-sm lg:text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
      /* @__PURE__ */ jsxs(Button, { onClick: handleExport, isLoading: isExporting, className: "flex-1", children: [
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
                d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              }
            )
          }
        ),
        "Eksportuj PDF"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setIsOpen(false), children: "Anuluj" })
    ] })
  ] }) });
}
function getWeekString(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
function getWeekDates(year, week) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const start = new Date(simple);
  if (dow <= 4) {
    start.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    start.setDate(simple.getDate() + 8 - simple.getDay());
  }
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Treningi" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto"> <div class="flex items-center justify-between mb-6"> <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Moje treningi</h1> <div class="flex gap-2"> <button id="export-report-btn" class="inline-flex items-center px-4 py-2 text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"> <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg>
Eksportuj raport
</button> <a href="/trainings/new" class="inline-flex items-center px-4 py-2 text-sm lg:text-base font-medium text-white bg-primary-600 dark:bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-500 rounded-lg transition-colors"> <svg class="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path> </svg>
Dodaj trening
</a> </div> </div> ${renderComponent($$result2, "TrainingList", TrainingList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/trainings/TrainingList", "client:component-export": "TrainingList" })} ${renderComponent($$result2, "PeriodExportDialog", PeriodExportDialog, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/pdf/PeriodExportDialog", "client:component-export": "PeriodExportDialog" })} </div> ${renderScript($$result2, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/index.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/index.astro";
const $$url = "/trainings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
