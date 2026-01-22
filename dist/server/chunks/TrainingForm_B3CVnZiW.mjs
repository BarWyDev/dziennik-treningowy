import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { c as createTrainingSchema } from './training_DZ_Fq8pO.mjs';
import { B as Button } from './Button_DSs3LSd1.mjs';
import { I as Input } from './Input_jnU1wWv_.mjs';
import { L as Label } from './Label_CbQ68ufM.mjs';
import { S as Select } from './Select_DYlv6HWL.mjs';
import { A as Alert } from './Alert_Bst9GH5v.mjs';

function RatingInput({ value, onChange, error }) {
  const [hoveredRating, setHoveredRating] = useState(null);
  const displayRating = hoveredRating ?? value ?? 0;
  const handleClick = (rating) => {
    if (value === rating) {
      onChange(void 0);
    } else {
      onChange(rating);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((rating) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded",
        onMouseEnter: () => setHoveredRating(rating),
        onMouseLeave: () => setHoveredRating(null),
        onClick: () => handleClick(rating),
        children: /* @__PURE__ */ jsx(
          "svg",
          {
            className: `w-8 h-8 lg:w-9 lg:h-9 transition-colors ${rating <= displayRating ? "text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500" : "text-gray-300 dark:text-gray-700"}`,
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 1.5,
            children: /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              }
            )
          }
        )
      },
      rating
    )) }),
    value && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm lg:text-base text-gray-500 dark:text-gray-400", children: [
      "Ocena: ",
      value,
      "/5 (kliknij ponownie, aby usunąć)"
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: error })
  ] });
}

function DurationPicker({ value, onChange, error }) {
  const [hours, setHours] = useState(Math.floor(value / 60));
  const [minutes, setMinutes] = useState(value % 60);
  useEffect(() => {
    setHours(Math.floor(value / 60));
    setMinutes(value % 60);
  }, [value]);
  const handleHoursChange = (newHours) => {
    const clampedHours = Math.max(0, Math.min(10, newHours));
    setHours(clampedHours);
    onChange(clampedHours * 60 + minutes);
  };
  const handleMinutesChange = (newMinutes) => {
    const clampedMinutes = Math.max(0, Math.min(59, newMinutes));
    setMinutes(clampedMinutes);
    onChange(hours * 60 + clampedMinutes);
  };
  const quickOptions = [15, 30, 45, 60, 90, 120];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0",
            max: "10",
            value: hours,
            onChange: (e) => handleHoursChange(parseInt(e.target.value) || 0),
            className: "w-16 px-3 py-2 text-sm lg:text-base text-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400", children: "godz." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            min: "0",
            max: "59",
            value: minutes,
            onChange: (e) => handleMinutesChange(parseInt(e.target.value) || 0),
            className: "w-16 px-3 py-2 text-sm lg:text-base text-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm lg:text-base text-gray-600 dark:text-gray-400", children: "min." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: quickOptions.map((mins) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(mins),
        className: `px-3 py-1 text-xs lg:text-sm font-medium rounded-full transition-colors ${value === mins ? "bg-primary-600 dark:bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
        children: mins >= 60 ? `${mins / 60}h` : `${mins}min`
      },
      mins
    )) }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: error })
  ] });
}

function TrainingForm({ training, onSuccess }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const isEditing = !!training;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(createTrainingSchema),
    defaultValues: {
      trainingTypeId: training?.trainingTypeId || "",
      date: training?.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      time: training?.time || "",
      durationMinutes: training?.durationMinutes || 30,
      ratingOverall: training?.ratingOverall || 3,
      ratingPhysical: training?.ratingPhysical || void 0,
      ratingEnergy: training?.ratingEnergy || void 0,
      ratingMotivation: training?.ratingMotivation || void 0,
      ratingDifficulty: training?.ratingDifficulty || void 0,
      trainingGoal: training?.trainingGoal || "",
      mostSatisfiedWith: training?.mostSatisfiedWith || "",
      improveNextTime: training?.improveNextTime || "",
      howToImprove: training?.howToImprove || "",
      notes: training?.notes || "",
      caloriesBurned: training?.caloriesBurned || void 0
    }
  });
  useEffect(() => {
    const fetchTrainingTypes = async () => {
      try {
        const response = await fetch("/api/training-types");
        if (response.ok) {
          const data = await response.json();
          setTrainingTypes(data);
        }
      } catch {
        console.error("Error fetching training types");
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchTrainingTypes();
  }, []);
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = isEditing ? `/api/trainings/${training.id}` : "/api/trainings";
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
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/trainings";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };
  const typeOptions = trainingTypes.map((type) => ({
    value: type.id,
    label: type.name
  }));
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
    error && /* @__PURE__ */ jsx(Alert, { variant: "error", children: error }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "trainingTypeId", required: true, children: "Typ treningu" }),
      isLoadingTypes ? /* @__PURE__ */ jsx("div", { className: "h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" }) : /* @__PURE__ */ jsx(
        Select,
        {
          id: "trainingTypeId",
          options: typeOptions,
          placeholder: "Wybierz typ treningu",
          error: errors.trainingTypeId?.message,
          ...register("trainingTypeId")
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
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
        /* @__PURE__ */ jsx(Label, { htmlFor: "time", children: "Godzina (opcjonalnie)" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "time",
            type: "time",
            placeholder: "HH:MM",
            error: errors.time?.message,
            ...register("time")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { required: true, children: "Czas trwania" }),
      /* @__PURE__ */ jsx(
        Controller,
        {
          name: "durationMinutes",
          control,
          render: ({ field }) => /* @__PURE__ */ jsx(
            DurationPicker,
            {
              value: field.value,
              onChange: field.onChange,
              error: errors.durationMinutes?.message
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "trainingGoal", children: "Mój cel na trening (mentalny i fizyczny)" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "trainingGoal",
          rows: 2,
          className: "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          placeholder: "Co chcesz osiągnąć podczas tego treningu?",
          ...register("trainingGoal")
        }
      ),
      errors.trainingGoal && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: errors.trainingGoal.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-medium text-base lg:text-lg text-gray-900 dark:text-gray-100", children: "Oceny (skala 1-5)" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { required: true, children: "Ogólne zadowolenie" }),
        /* @__PURE__ */ jsx(
          Controller,
          {
            name: "ratingOverall",
            control,
            render: ({ field }) => /* @__PURE__ */ jsx(
              RatingInput,
              {
                value: field.value,
                onChange: field.onChange,
                error: errors.ratingOverall?.message
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Samopoczucie fizyczne (opcjonalnie)" }),
        /* @__PURE__ */ jsx(
          Controller,
          {
            name: "ratingPhysical",
            control,
            render: ({ field }) => /* @__PURE__ */ jsx(
              RatingInput,
              {
                value: field.value,
                onChange: field.onChange,
                error: errors.ratingPhysical?.message
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Poziom energii (opcjonalnie)" }),
        /* @__PURE__ */ jsx(
          Controller,
          {
            name: "ratingEnergy",
            control,
            render: ({ field }) => /* @__PURE__ */ jsx(
              RatingInput,
              {
                value: field.value,
                onChange: field.onChange,
                error: errors.ratingEnergy?.message
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Motywacja (opcjonalnie)" }),
        /* @__PURE__ */ jsx(
          Controller,
          {
            name: "ratingMotivation",
            control,
            render: ({ field }) => /* @__PURE__ */ jsx(
              RatingInput,
              {
                value: field.value,
                onChange: field.onChange,
                error: errors.ratingMotivation?.message
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "Trudność treningu (opcjonalnie)" }),
        /* @__PURE__ */ jsx(
          Controller,
          {
            name: "ratingDifficulty",
            control,
            render: ({ field }) => /* @__PURE__ */ jsx(
              RatingInput,
              {
                value: field.value,
                onChange: field.onChange,
                error: errors.ratingDifficulty?.message
              }
            )
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-medium text-base lg:text-lg text-gray-900 dark:text-gray-100", children: "Refleksja po treningu" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "mostSatisfiedWith", children: "Z czego jestem najbardziej zadowolony?" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "mostSatisfiedWith",
            rows: 2,
            className: "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
            placeholder: "Co poszło najlepiej?",
            ...register("mostSatisfiedWith")
          }
        ),
        errors.mostSatisfiedWith && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: errors.mostSatisfiedWith.message })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "improveNextTime", children: "Co następnym razem chcę zrobić lepiej?" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "improveNextTime",
            rows: 2,
            className: "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
            placeholder: "Nad czym chcesz popracować?",
            ...register("improveNextTime")
          }
        ),
        errors.improveNextTime && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: errors.improveNextTime.message })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "howToImprove", children: "Jak mogę to zrobić?" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "howToImprove",
            rows: 2,
            className: "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
            placeholder: "Konkretne kroki do poprawy...",
            ...register("howToImprove")
          }
        ),
        errors.howToImprove && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: errors.howToImprove.message })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "caloriesBurned", children: "Spalone kalorie (opcjonalnie)" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: "caloriesBurned",
          type: "number",
          min: "0",
          max: "10000",
          placeholder: "np. 300",
          error: errors.caloriesBurned?.message,
          ...register("caloriesBurned", { valueAsNumber: true })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "notes", children: "Dodatkowe uwagi i komentarze (opcjonalnie)" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "notes",
          rows: 3,
          className: "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          placeholder: "Inne obserwacje lub notatki...",
          ...register("notes")
        }
      ),
      errors.notes && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: errors.notes.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(Button, { type: "submit", isLoading, className: "flex-1", children: isEditing ? "Zapisz zmiany" : "Dodaj trening" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "secondary",
          onClick: () => window.history.back(),
          children: "Anuluj"
        }
      )
    ] })
  ] });
}

export { TrainingForm as T };
