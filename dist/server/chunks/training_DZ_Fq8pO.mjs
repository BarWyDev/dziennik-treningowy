import { z } from 'zod';

const createTrainingSchema = z.object({
  trainingTypeId: z.string().uuid("Wybierz typ treningu"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowy format daty"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Nieprawidłowy format czasu (HH:MM)").or(z.literal("")).optional(),
  durationMinutes: z.number().min(1, "Czas trwania musi wynosić co najmniej 1 minutę").max(600, "Czas trwania nie może przekraczać 10 godzin"),
  // Multi-category ratings (1-5 scale)
  ratingOverall: z.number().min(1, "Ocena musi być w skali 1-5").max(5, "Ocena musi być w skali 1-5"),
  ratingPhysical: z.number().min(1, "Ocena musi być w skali 1-5").max(5, "Ocena musi być w skali 1-5").optional(),
  ratingEnergy: z.number().min(1, "Ocena musi być w skali 1-5").max(5, "Ocena musi być w skali 1-5").optional(),
  ratingMotivation: z.number().min(1, "Ocena musi być w skali 1-5").max(5, "Ocena musi być w skali 1-5").optional(),
  ratingDifficulty: z.number().min(1, "Ocena musi być w skali 1-5").max(5, "Ocena musi być w skali 1-5").optional(),
  // Reflection/Coaching fields
  trainingGoal: z.string().max(500, "Cel treningu może mieć maksymalnie 500 znaków").optional(),
  mostSatisfiedWith: z.string().max(500, "Pole może mieć maksymalnie 500 znaków").optional(),
  improveNextTime: z.string().max(500, "Pole może mieć maksymalnie 500 znaków").optional(),
  howToImprove: z.string().max(500, "Pole może mieć maksymalnie 500 znaków").optional(),
  // Other fields
  notes: z.string().max(1e3, "Notatki mogą mieć maksymalnie 1000 znaków").optional(),
  caloriesBurned: z.number().min(0, "Kalorie nie mogą być ujemne").max(1e4, "Wartość kalorii jest za wysoka").optional().or(z.nan()).transform((val) => isNaN(val) ? void 0 : val)
});
const updateTrainingSchema = createTrainingSchema.partial();
z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  trainingTypeId: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export { createTrainingSchema as c, updateTrainingSchema as u };
