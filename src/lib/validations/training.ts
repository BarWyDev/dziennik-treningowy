import { z } from 'zod';
import { mediaIdsSchema } from './media';

export const createTrainingSchema = z.object({
  trainingTypeId: z.string().uuid('Wybierz typ treningu'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty'),
  time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Nieprawidłowy format czasu (HH:MM)')
    .or(z.literal(''))
    .optional(),
  durationMinutes: z
    .number()
    .min(1, 'Czas trwania musi wynosić co najmniej 1 minutę')
    .max(600, 'Czas trwania nie może przekraczać 10 godzin'),
  description: z
    .string()
    .max(1000, 'Opis treningu może mieć maksymalnie 1000 znaków')
    .optional(),

  // Multi-category ratings (1-5 scale)
  ratingOverall: z
    .number()
    .min(1, 'Ocena musi być w skali 1-5')
    .max(5, 'Ocena musi być w skali 1-5'),
  ratingPhysical: z
    .number()
    .min(1, 'Ocena musi być w skali 1-5')
    .max(5, 'Ocena musi być w skali 1-5')
    .optional(),
  ratingEnergy: z
    .number()
    .min(1, 'Ocena musi być w skali 1-5')
    .max(5, 'Ocena musi być w skali 1-5')
    .optional(),
  ratingMotivation: z
    .number()
    .min(1, 'Ocena musi być w skali 1-5')
    .max(5, 'Ocena musi być w skali 1-5')
    .optional(),
  ratingDifficulty: z
    .number()
    .min(1, 'Ocena musi być w skali 1-5')
    .max(5, 'Ocena musi być w skali 1-5')
    .optional(),

  // Reflection/Coaching fields
  trainingGoal: z
    .string()
    .max(500, 'Cel treningu może mieć maksymalnie 500 znaków')
    .optional(),
  mostSatisfiedWith: z
    .string()
    .max(500, 'Pole może mieć maksymalnie 500 znaków')
    .optional(),
  improveNextTime: z
    .string()
    .max(500, 'Pole może mieć maksymalnie 500 znaków')
    .optional(),
  howToImprove: z
    .string()
    .max(500, 'Pole może mieć maksymalnie 500 znaków')
    .optional(),

  // Other fields
  notes: z.string().max(1000, 'Notatki mogą mieć maksymalnie 1000 znaków').optional(),
  caloriesBurned: z
    .number()
    .min(0, 'Kalorie nie mogą być ujemne')
    .max(10000, 'Wartość kalorii jest za wysoka')
    .optional()
    .or(z.nan())
    .transform((val) => (isNaN(val as number) ? undefined : val)),

  // Media attachments
  mediaIds: mediaIdsSchema,
});

export const updateTrainingSchema = createTrainingSchema.partial();

// Schemat dla query params (przychodzą jako stringi z URL)
export const trainingFiltersQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  trainingTypeId: z.string().uuid('Nieprawidłowy format UUID').optional().or(z.literal('')),
  page: z
    .string()
    .regex(/^\d+$/, 'Strona musi być liczbą')
    .optional()
    .transform((val) => parseInt(val || '1', 10))
    .pipe(z.number().min(1, 'Strona musi być większa od 0')),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit musi być liczbą')
    .optional()
    .transform((val) => parseInt(val || '20', 10))
    .pipe(z.number().min(1, 'Limit musi być większy od 0').max(100, 'Limit nie może przekraczać 100')),
});

// Schemat dla przetworzonych danych (po konwersji)
export const trainingFiltersSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  trainingTypeId: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type TrainingFilters = z.infer<typeof trainingFiltersSchema>;
