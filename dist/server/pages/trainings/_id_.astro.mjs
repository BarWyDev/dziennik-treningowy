import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C-0B9Fh3.mjs';
import { $ as $$AppLayout } from '../../chunks/AppLayout_BmmcCXTo.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { B as Button } from '../../chunks/Button_DSs3LSd1.mjs';
import { A as Alert } from '../../chunks/Alert_Bst9GH5v.mjs';
import { D as Dialog } from '../../chunks/Dialog_BB7fs6nV.mjs';
import { c as createPDF, a as addHeader, f as formatDuration$1, s as sanitizePolishText, b as addFooter } from '../../chunks/common_BnydJ18k.mjs';
import autoTable from 'jspdf-autotable';
import { d as db, t as trainingTypes, a as trainings } from '../../chunks/index_D15ihLaC.mjs';
import { eq, and } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Usuń trening",
  message = "Czy na pewno chcesz usunąć ten trening? Tej operacji nie można cofnąć."
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Dialog, { isOpen, onClose, title, children: [
    /* @__PURE__ */ jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-6 text-sm lg:text-base", children: message }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "danger",
          onClick: handleConfirm,
          isLoading: isDeleting,
          className: "flex-1",
          children: "Usuń"
        }
      ),
      /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onClose, disabled: isDeleting, children: "Anuluj" })
    ] })
  ] });
}

function generateTrainingPDF(training) {
  const doc = createPDF();
  let dateStr = new Date(training.date).toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  if (training.time) {
    dateStr += ` • ${training.time}`;
  }
  let yPos = addHeader(
    doc,
    training.trainingType?.name || "Trening",
    dateStr
  );
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55);
  const details = [
    { label: "Czas trwania", value: formatDuration$1(training.durationMinutes) }
  ];
  if (training.caloriesBurned) {
    details.push({ label: "Spalone kalorie", value: `${training.caloriesBurned} kcal` });
  }
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: details.map((d) => [sanitizePolishText(d.label), sanitizePolishText(d.value)]),
    theme: "plain",
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: "auto" }
    },
    styles: {
      fontSize: 11,
      cellPadding: 4
    },
    margin: { left: 14 }
  });
  yPos = doc.lastAutoTable.finalY + 15;
  if (training.trainingGoal) {
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(sanitizePolishText("Cel treningu (mentalny i fizyczny)"), 14, yPos);
    doc.setFont("times", "normal");
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(11);
    yPos += 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textLines = doc.splitTextToSize(sanitizePolishText(training.trainingGoal), pageWidth - 28);
    doc.text(textLines, 14, yPos);
    yPos += textLines.length * 5 + 10;
  }
  doc.setFontSize(13);
  doc.setFont("times", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(sanitizePolishText("Oceny (skala 1-5)"), 14, yPos);
  yPos += 10;
  const ratings = [
    { label: "Ogólne zadowolenie", value: training.ratingOverall }
  ];
  if (training.ratingPhysical) {
    ratings.push({ label: "Samopoczucie fizyczne", value: training.ratingPhysical });
  }
  if (training.ratingEnergy) {
    ratings.push({ label: "Poziom energii", value: training.ratingEnergy });
  }
  if (training.ratingMotivation) {
    ratings.push({ label: "Motywacja", value: training.ratingMotivation });
  }
  if (training.ratingDifficulty) {
    ratings.push({ label: "Trudność treningu", value: training.ratingDifficulty });
  }
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: ratings.map((r) => [
      sanitizePolishText(r.label),
      `${r.value} / 5 ${"*".repeat(r.value)}${"-".repeat(5 - r.value)}`
    ]),
    theme: "plain",
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: "auto" }
    },
    styles: {
      fontSize: 11,
      cellPadding: 3
    },
    margin: { left: 14 }
  });
  yPos = doc.lastAutoTable.finalY + 15;
  if (training.mostSatisfiedWith || training.improveNextTime || training.howToImprove) {
    doc.setFontSize(13);
    doc.setFont("times", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(sanitizePolishText("Refleksja po treningu"), 14, yPos);
    yPos += 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    if (training.mostSatisfiedWith) {
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text(sanitizePolishText("Z czego jestem najbardziej zadowolony?"), 14, yPos);
      yPos += 6;
      doc.setFont("times", "normal");
      doc.setTextColor(31, 41, 55);
      const lines1 = doc.splitTextToSize(sanitizePolishText(training.mostSatisfiedWith), pageWidth - 28);
      doc.text(lines1, 14, yPos);
      yPos += lines1.length * 5 + 8;
    }
    if (training.improveNextTime) {
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(217, 119, 6);
      doc.text(sanitizePolishText("Co nastepnym razem chce zrobic lepiej?"), 14, yPos);
      yPos += 6;
      doc.setFont("times", "normal");
      doc.setTextColor(31, 41, 55);
      const lines2 = doc.splitTextToSize(sanitizePolishText(training.improveNextTime), pageWidth - 28);
      doc.text(lines2, 14, yPos);
      yPos += lines2.length * 5 + 8;
    }
    if (training.howToImprove) {
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.setTextColor(147, 51, 234);
      doc.text(sanitizePolishText("Jak moge to zrobic?"), 14, yPos);
      yPos += 6;
      doc.setFont("times", "normal");
      doc.setTextColor(31, 41, 55);
      const lines3 = doc.splitTextToSize(sanitizePolishText(training.howToImprove), pageWidth - 28);
      doc.text(lines3, 14, yPos);
      yPos += lines3.length * 5 + 10;
    }
  }
  if (training.notes) {
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(sanitizePolishText("Dodatkowe uwagi i komentarze"), 14, yPos);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    yPos += 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textLines = doc.splitTextToSize(sanitizePolishText(training.notes), pageWidth - 28);
    doc.text(textLines, 14, yPos);
  }
  addFooter(doc);
  const fileName = `trening_${training.date}.pdf`;
  doc.save(fileName);
}

function ExportButton({ training }) {
  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      generateTrainingPDF(training);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", onClick: handleExport, isLoading: isExporting, children: [
    /* @__PURE__ */ jsx(
      "svg",
      {
        className: "w-4 h-4 mr-1",
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
    "PDF"
  ] });
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins} minut`;
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
function RatingStars({ rating }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
    [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(
      "svg",
      {
        className: `w-5 h-5 lg:w-6 lg:h-6 ${i < rating ? "text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500" : "text-gray-300 dark:text-gray-700"}`,
        viewBox: "0 0 20 20",
        children: /* @__PURE__ */ jsx("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" })
      },
      i
    )),
    /* @__PURE__ */ jsxs("span", { className: "ml-2 text-sm lg:text-base text-gray-600 dark:text-gray-400", children: [
      rating,
      "/5"
    ] })
  ] });
}
function TrainingDetails({ training }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/trainings/${training.id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Nie udało się usunąć treningu");
      }
      window.location.href = "/trainings";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
      setIsDeleteDialogOpen(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", className: "mb-6", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100", children: training.trainingType?.name || "Trening" }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 dark:text-gray-400 mt-1 text-base lg:text-lg", children: [
            formatDate(training.date),
            training.time && ` • ${training.time}`
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(ExportButton, { training }),
          /* @__PURE__ */ jsx("a", { href: `/trainings/${training.id}/edit`, children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "sm", children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-4 h-4 mr-1",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  }
                )
              }
            ),
            "Edytuj"
          ] }) }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "danger",
              size: "sm",
              onClick: () => setIsDeleteDialogOpen(true),
              children: [
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "w-4 h-4 mr-1",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      }
                    )
                  }
                ),
                "Usuń"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1", children: "Czas trwania" }),
            /* @__PURE__ */ jsx("p", { className: "text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100", children: formatDuration(training.durationMinutes) })
          ] }),
          training.caloriesBurned && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1", children: "Spalone kalorie" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100", children: [
              training.caloriesBurned,
              " kcal"
            ] })
          ] })
        ] }),
        training.trainingGoal && /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-medium text-blue-900 dark:text-blue-300 mb-2", children: "🎯 Cel treningu (mentalny i fizyczny)" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-blue-800 dark:text-blue-200 whitespace-pre-wrap", children: training.trainingGoal })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-4", children: "Oceny" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2", children: "Ogólne zadowolenie" }),
              /* @__PURE__ */ jsx(RatingStars, { rating: training.ratingOverall })
            ] }),
            training.ratingPhysical && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2", children: "Samopoczucie fizyczne" }),
              /* @__PURE__ */ jsx(RatingStars, { rating: training.ratingPhysical })
            ] }),
            training.ratingEnergy && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2", children: "Poziom energii" }),
              /* @__PURE__ */ jsx(RatingStars, { rating: training.ratingEnergy })
            ] }),
            training.ratingMotivation && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2", children: "Motywacja" }),
              /* @__PURE__ */ jsx(RatingStars, { rating: training.ratingMotivation })
            ] }),
            training.ratingDifficulty && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2", children: "Trudność treningu" }),
              /* @__PURE__ */ jsx(RatingStars, { rating: training.ratingDifficulty })
            ] })
          ] })
        ] }),
        (training.mostSatisfiedWith || training.improveNextTime || training.howToImprove) && /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-4", children: "Refleksja po treningu" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            training.mostSatisfiedWith && /* @__PURE__ */ jsxs("div", { className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-medium text-green-900 dark:text-green-300 mb-2", children: "😊 Z czego jestem najbardziej zadowolony?" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-green-800 dark:text-green-200 whitespace-pre-wrap", children: training.mostSatisfiedWith })
            ] }),
            training.improveNextTime && /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-medium text-amber-900 dark:text-amber-300 mb-2", children: "📈 Co następnym razem chcę zrobić lepiej?" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-amber-800 dark:text-amber-200 whitespace-pre-wrap", children: training.improveNextTime })
            ] }),
            training.howToImprove && /* @__PURE__ */ jsxs("div", { className: "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-medium text-purple-900 dark:text-purple-300 mb-2", children: "💡 Jak mogę to zrobić?" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-purple-800 dark:text-purple-200 whitespace-pre-wrap", children: training.howToImprove })
            ] })
          ] })
        ] }),
        training.notes && /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-6", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Dodatkowe uwagi i komentarze" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm lg:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap", children: training.notes })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx("a", { href: "/trainings", className: "text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm lg:text-base font-medium", children: "← Powrót do listy treningów" }) }),
    /* @__PURE__ */ jsx(
      DeleteConfirmDialog,
      {
        isOpen: isDeleteDialogOpen,
        onClose: () => setIsDeleteDialogOpen(false),
        onConfirm: handleDelete
      }
    )
  ] });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { id } = Astro2.params;
  const user = Astro2.locals.user;
  if (!id || !user) {
    return Astro2.redirect("/trainings");
  }
  const [result] = await db.select({
    training: trainings,
    trainingType: trainingTypes
  }).from(trainings).leftJoin(trainingTypes, eq(trainings.trainingTypeId, trainingTypes.id)).where(and(eq(trainings.id, id), eq(trainings.userId, user.id)));
  if (!result) {
    return Astro2.redirect("/trainings");
  }
  const training = {
    ...result.training,
    trainingType: result.trainingType
  };
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": training.trainingType?.name || "Trening" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto"> ${renderComponent($$result2, "TrainingDetails", TrainingDetails, { "training": training, "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/features/trainings/TrainingDetails", "client:component-export": "TrainingDetails" })} </div> ` })}`;
}, "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/[id]/index.astro", void 0);

const $$file = "C:/Users/bwysocki/projekt-dziennik-treningowy/src/pages/trainings/[id]/index.astro";
const $$url = "/trainings/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
